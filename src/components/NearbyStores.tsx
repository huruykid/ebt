
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { StoreCard } from './StoreCard';
import { LoadingSpinner } from './LoadingSpinner';
import { MapPin, AlertCircle } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type Store = Tables<'snap_stores'>;

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
      <div className="flex items-start gap-3 mb-4">
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
      {stores.map((store) => (
        <StoreCard key={store.id} store={store} />
      ))}
    </div>
  );
};
