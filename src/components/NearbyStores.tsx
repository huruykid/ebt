
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
}

export const NearbyStores: React.FC<NearbyStoresProps> = ({ 
  latitude, 
  longitude, 
  radius = 10,
  limit = 20 
}) => {
  const { data: stores, isLoading, error } = useQuery({
    queryKey: ['nearby-stores', latitude, longitude, radius, limit],
    queryFn: async () => {
      // Calculate bounding box for rough filtering
      const latDelta = radius / 69; // Approximate miles to degrees
      const lonDelta = radius / (69 * Math.cos(latitude * Math.PI / 180));
      
      const minLat = latitude - latDelta;
      const maxLat = latitude + latDelta;
      const minLon = longitude - lonDelta;
      const maxLon = longitude + lonDelta;

      const { data, error } = await supabase
        .from('snap_stores')
        .select('*')
        .not('latitude', 'is', null)
        .not('longitude', 'is', null)
        .gte('latitude', minLat)
        .lte('latitude', maxLat)
        .gte('longitude', minLon)
        .lte('longitude', maxLon)
        .limit(limit * 2); // Get more results for better filtering

      if (error) {
        console.error('Error fetching nearby stores:', error);
        throw error;
      }

      // Calculate actual distances and sort by distance
      const storesWithDistance = (data || [])
        .map(store => {
          const distance = calculateDistance(
            latitude,
            longitude,
            store.latitude!,
            store.longitude!
          );
          return { ...store, distance };
        })
        .filter(store => store.distance <= radius)
        .sort((a, b) => a.distance - b.distance)
        .slice(0, limit);

      return storesWithDistance;
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
    return (
      <div className="text-center py-8">
        <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No SNAP stores found within {radius} miles of your location.</p>
        <p className="text-sm text-gray-500 mt-2">Try expanding your search radius or check a different area.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="h-5 w-5 text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-800">
          SNAP Stores Near You ({stores.length} found)
        </h2>
      </div>
      {stores.map((store) => (
        <div key={store.id} className="relative">
          <StoreCard store={store} />
          {store.distance && (
            <div className="absolute top-4 right-4 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
              {store.distance.toFixed(1)} mi
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
