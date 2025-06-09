
import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { StoreCard } from './StoreCard';
import { LoadingSpinner } from './LoadingSpinner';
import { SortDropdown, SortOption } from './SortDropdown';
import { MapPin, AlertCircle } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';
import { useGooglePlacesSearch } from '@/hooks/useGooglePlaces';

type Store = Tables<'snap_stores'>;

interface StoreWithDistance extends Store {
  distance?: number;
  googleData?: {
    rating?: number;
    user_ratings_total?: number;
  };
}

interface NearbyStoresProps {
  latitude: number;
  longitude: number;
  radius?: number; // in miles
  limit?: number;
  category?: string;
  storeTypes?: string[];
}

export const NearbyStores: React.FC<NearbyStoresProps> = ({ 
  latitude, 
  longitude, 
  radius = 10,
  limit = 20,
  category = 'trending',
  storeTypes = []
}) => {
  const [sortBy, setSortBy] = useState<SortOption>('distance');

  const { data: stores, isLoading, error } = useQuery({
    queryKey: ['nearby-stores', latitude, longitude, radius, limit, category, storeTypes],
    queryFn: async () => {
      // Calculate bounding box for rough filtering
      const latDelta = radius / 69; // Approximate miles to degrees
      const lonDelta = radius / (69 * Math.cos(latitude * Math.PI / 180));
      
      const minLat = latitude - latDelta;
      const maxLat = latitude + latDelta;
      const minLon = longitude - lonDelta;
      const maxLon = longitude + lonDelta;

      let query = supabase
        .from('snap_stores')
        .select('*')
        .not('latitude', 'is', null)
        .not('longitude', 'is', null)
        .gte('latitude', minLat)
        .lte('latitude', maxLat)
        .gte('longitude', minLon)
        .lte('longitude', maxLon);

      // Apply category filters
      if (category !== 'trending' && storeTypes.length > 0) {
        // Create an OR condition for store types
        const typeFilters = storeTypes.map(type => `store_type.ilike.%${type}%`).join(',');
        query = query.or(typeFilters);
      }

      query = query.limit(limit * 2); // Get more results for better filtering

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching nearby stores:', error);
        throw error;
      }

      // Calculate actual distances and sort by distance
      let storesWithDistance = (data || [])
        .map(store => {
          const distance = calculateDistance(
            latitude,
            longitude,
            store.latitude!,
            store.longitude!
          );
          return { ...store, distance };
        })
        .filter(store => store.distance <= radius);

      // Apply trending logic or sort by distance
      if (category === 'trending') {
        // For trending, prioritize stores with incentive programs and then by proximity
        storesWithDistance = storesWithDistance
          .sort((a, b) => {
            // First priority: stores with incentive programs
            const aHasIncentive = a.incentive_program ? 1 : 0;
            const bHasIncentive = b.incentive_program ? 1 : 0;
            if (aHasIncentive !== bHasIncentive) {
              return bHasIncentive - aHasIncentive;
            }
            // Second priority: distance
            return a.distance - b.distance;
          });
      } else {
        // For other categories, sort by distance
        storesWithDistance = storesWithDistance.sort((a, b) => a.distance - b.distance);
      }

      return storesWithDistance.slice(0, limit);
    },
    enabled: !!(latitude && longitude),
  });

  // Haversine formula to calculate distance between two points
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Get Google Places data for the first 10 stores (to avoid hitting API limits)
  const storeQueries = useMemo(() => {
    if (!stores) return [];
    return stores.slice(0, 10).map(store => {
      const searchQuery = [
        store.store_name,
        store.store_street_address,
        store.city,
        store.state
      ].filter(Boolean).join(' ');
      return { query: searchQuery, storeId: store.id };
    });
  }, [stores]);

  // Fetch Google Places data for each store
  const googlePlacesQueries = storeQueries.map(({ query, storeId }) => 
    useGooglePlacesSearch(query, !!query)
  );

  // Create a map of Google Places data for each store
  const googlePlacesDataMap = useMemo(() => {
    const dataMap = new Map();
    storeQueries.forEach(({ storeId }, index) => {
      const googleData = googlePlacesQueries[index]?.data?.[0];
      if (googleData) {
        dataMap.set(storeId, {
          rating: googleData.rating,
          user_ratings_total: googleData.user_ratings_total
        });
      }
    });
    return dataMap;
  }, [storeQueries, googlePlacesQueries]);

  // Enhance stores with Google Places data
  const storesWithGoogleData = useMemo(() => {
    if (!stores) return [];
    return stores.map(store => ({
      ...store,
      googleData: googlePlacesDataMap.get(store.id)
    }));
  }, [stores, googlePlacesDataMap]);

  // Sort stores based on selected criteria
  const sortedStores = useMemo(() => {
    if (!storesWithGoogleData) return [];

    const storesCopy = [...storesWithGoogleData];

    switch (sortBy) {
      case 'distance':
        return storesCopy.sort((a, b) => (a.distance || 0) - (b.distance || 0));
      
      case 'popularity':
        // Sort by Google review count
        return storesCopy.sort((a, b) => {
          const aPopularity = a.googleData?.user_ratings_total || 0;
          const bPopularity = b.googleData?.user_ratings_total || 0;
          if (aPopularity !== bPopularity) {
            return bPopularity - aPopularity;
          }
          // Secondary sort by distance
          return (a.distance || 0) - (b.distance || 0);
        });
      
      case 'rating':
        // Sort by Google rating
        return storesCopy.sort((a, b) => {
          const aRating = a.googleData?.rating || 0;
          const bRating = b.googleData?.rating || 0;
          if (aRating !== bRating) {
            return bRating - aRating;
          }
          // Secondary sort by distance
          return (a.distance || 0) - (b.distance || 0);
        });
      
      default:
        return storesCopy;
    }
  }, [storesWithGoogleData, sortBy]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600">Error loading nearby stores. Please try again.</p>
      </div>
    );
  }

  if (!stores || stores.length === 0) {
    const categoryText = category === 'trending' ? 'SNAP stores' : storeTypes.join(', ').toLowerCase();
    return (
      <div className="text-center py-8">
        <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No {categoryText} found within {radius} miles of your location.</p>
        <p className="text-sm text-gray-500 mt-2">Try a different category or expand your search radius.</p>
      </div>
    );
  }

  const getHeaderText = () => {
    if (category === 'trending') {
      return `${stores.length} stores near you`;
    }
    const categoryName = storeTypes.length > 0 ? storeTypes.join(', ') : 'SNAP Stores';
    return `${stores.length} ${categoryName.toLowerCase()} nearby`;
  };

  const getSubtext = () => {
    const closestDistance = stores[0]?.distance;
    if (closestDistance !== undefined) {
      return `Starting ${closestDistance.toFixed(1)} mi away`;
    }
    return `Within ${radius} miles`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          <MapPin className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              {getHeaderText()}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {getSubtext()}
            </p>
          </div>
        </div>
        <SortDropdown currentSort={sortBy} onSortChange={setSortBy} />
      </div>
      {sortedStores.map((store) => (
        <StoreCard key={store.id} store={store} />
      ))}
    </div>
  );
};
