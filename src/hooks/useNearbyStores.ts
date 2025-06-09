
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { calculateDistance } from '@/utils/distanceUtils';
import type { Tables } from '@/integrations/supabase/types';

type Store = Tables<'snap_stores'>;

interface StoreWithDistance extends Store {
  distance?: number;
}

interface UseNearbyStoresProps {
  latitude: number;
  longitude: number;
  radius?: number;
  limit?: number;
  category?: string;
  storeTypes?: string[];
}

export const useNearbyStores = ({
  latitude,
  longitude,
  radius = 10,
  limit = 20,
  category = 'trending',
  storeTypes = []
}: UseNearbyStoresProps) => {
  return useQuery({
    queryKey: ['nearby-stores', latitude, longitude, radius, limit, category, storeTypes],
    queryFn: async (): Promise<StoreWithDistance[]> => {
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
};
