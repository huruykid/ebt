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
  namePatterns?: string[];
}

export const useNearbyStores = ({
  latitude,
  longitude,
  radius = 10,
  limit = 20,
  category = 'trending',
  storeTypes = [],
  namePatterns = []
}: UseNearbyStoresProps) => {
  return useQuery({
    queryKey: ['nearby-stores', latitude, longitude, radius, limit, category, storeTypes, namePatterns],
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
        .not('Latitude', 'is', null)
        .not('Longitude', 'is', null)
        .gte('Latitude', minLat)
        .lte('Latitude', maxLat)
        .gte('Longitude', minLon)
        .lte('Longitude', maxLon);

      // Apply category filters
      if (category !== 'trending' && (Array.isArray(storeTypes) && storeTypes.length > 0 || Array.isArray(namePatterns) && namePatterns.length > 0)) {
        const filters = [];
        
        // Add store type filters
        if (Array.isArray(storeTypes) && storeTypes.length > 0) {
          const typeFilters = storeTypes.map(type => `Store_Type.ilike.%${type}%`);
          filters.push(...typeFilters);
        }
        
        // Add name pattern filters
        if (Array.isArray(namePatterns) && namePatterns.length > 0) {
          const nameFilters = namePatterns.map(pattern => `Store_Name.ilike.%${pattern}%`);
          filters.push(...nameFilters);
        }
        
        if (filters.length > 0) {
          query = query.or(filters.join(','));
        }
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
            store.Latitude!,
            store.Longitude!
          );
          return { ...store, distance };
        })
        .filter(store => store.distance <= radius); // Use the dynamic radius parameter

      // Apply trending logic or sort by distance
      if (category === 'trending') {
        // Get click data for trending analysis
        const storeIds = storesWithDistance.map(store => parseInt(store.id));
        
        if (storeIds.length > 0) {
          // Get click counts for stores in the area within the last 30 days
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          
          const { data: clickData } = await supabase
            .from('store_clicks')
            .select('store_id, clicked_at, user_latitude, user_longitude')
            .in('store_id', storeIds.map(id => id.toString()))
            .gte('clicked_at', thirtyDaysAgo.toISOString());

          // Calculate trending scores based on clicks in the user's area
          const trendingScores = new Map<number, number>();
          
          clickData?.forEach(click => {
            const clickDistance = calculateDistance(
              latitude,
              longitude,
              parseFloat(click.user_latitude.toString()),
              parseFloat(click.user_longitude.toString())
            );
            
            // Only count clicks from users within a larger radius (25 miles)
            if (clickDistance <= 25) {
              // Weight recent clicks more heavily
              const daysSinceClick = (Date.now() - new Date(click.clicked_at).getTime()) / (1000 * 60 * 60 * 24);
              const recencyWeight = Math.max(0.1, 1 - (daysSinceClick / 30)); // Linear decay over 30 days
              
              const storeIdNum = parseInt(click.store_id);
              const currentScore = trendingScores.get(storeIdNum) || 0;
              trendingScores.set(storeIdNum, currentScore + recencyWeight);
            }
          });

          // Sort by trending score, then by incentive programs, then by distance
          storesWithDistance = storesWithDistance.sort((a, b) => {
            const aScore = trendingScores.get(parseInt(a.id)) || 0;
            const bScore = trendingScores.get(parseInt(b.id)) || 0;
            
            // First priority: trending score (click-based)
            if (aScore !== bScore) {
              return bScore - aScore;
            }
            
            // Second priority: stores with incentive programs
            const aHasIncentive = a.Incentive_Program ? 1 : 0;
            const bHasIncentive = b.Incentive_Program ? 1 : 0;
            if (aHasIncentive !== bHasIncentive) {
              return bHasIncentive - aHasIncentive;
            }
            
            // Third priority: distance
            return a.distance - b.distance;
          });
        } else {
          // Fallback to incentive programs + distance if no stores found
          storesWithDistance = storesWithDistance.sort((a, b) => {
            const aHasIncentive = a.Incentive_Program ? 1 : 0;
            const bHasIncentive = b.Incentive_Program ? 1 : 0;
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
