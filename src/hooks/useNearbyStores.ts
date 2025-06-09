
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
      if (category !== 'trending' && Array.isArray(storeTypes) && storeTypes.length > 0) {
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

      if (!data || !Array.isArray(data)) {
        return [];
      }

      // Calculate actual distances and filter by radius
      let storesWithDistance = data
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
        // Get click data for trending analysis
        const storeIds = storesWithDistance.map(store => store.id);
        
        if (storeIds.length > 0) {
          // Get click counts for stores in the area within the last 30 days
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          
          const { data: clickData } = await supabase
            .from('store_clicks')
            .select('store_id, clicked_at, user_latitude, user_longitude')
            .in('store_id', storeIds)
            .gte('clicked_at', thirtyDaysAgo.toISOString());

          // Calculate trending scores based on clicks in the user's area
          const trendingScores = new Map<number, number>();
          
          clickData?.forEach(click => {
            const clickDistance = calculateDistance(
              latitude,
              longitude,
              click.user_latitude,
              click.user_longitude
            );
            
            // Only count clicks from users within a larger radius (25 miles)
            if (clickDistance <= 25) {
              // Weight recent clicks more heavily
              const daysSinceClick = (Date.now() - new Date(click.clicked_at).getTime()) / (1000 * 60 * 60 * 24);
              const recencyWeight = Math.max(0.1, 1 - (daysSinceClick / 30)); // Linear decay over 30 days
              
              const currentScore = trendingScores.get(click.store_id) || 0;
              trendingScores.set(click.store_id, currentScore + recencyWeight);
            }
          });

          // Sort by trending score, then by incentive programs, then by distance
          storesWithDistance = storesWithDistance.sort((a, b) => {
            const aScore = trendingScores.get(a.id) || 0;
            const bScore = trendingScores.get(b.id) || 0;
            
            // First priority: trending score (click-based)
            if (aScore !== bScore) {
              return bScore - aScore;
            }
            
            // Second priority: stores with incentive programs
            const aHasIncentive = a.incentive_program ? 1 : 0;
            const bHasIncentive = b.incentive_program ? 1 : 0;
            if (aHasIncentive !== bHasIncentive) {
              return bHasIncentive - aHasIncentive;
            }
            
            // Third priority: distance
            return a.distance - b.distance;
          });
        } else {
          // Fallback to incentive programs + distance if no stores found
          storesWithDistance = storesWithDistance.sort((a, b) => {
            const aHasIncentive = a.incentive_program ? 1 : 0;
            const bHasIncentive = b.incentive_program ? 1 : 0;
            if (aHasIncentive !== bHasIncentive) {
              return bHasIncentive - aHasIncentive;
            }
            return a.distance - b.distance;
          });
        }
      } else {
        // For other categories, sort by distance
        storesWithDistance = storesWithDistance.sort((a, b) => a.distance - b.distance);
      }

      return storesWithDistance.slice(0, limit);
    },
    enabled: !!(latitude && longitude),
  });
};
