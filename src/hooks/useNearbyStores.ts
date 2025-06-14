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
  useOptimized?: boolean; // Flag to use optimized database function
}

interface OptimizedNearbyResult {
  id: string;
  store_name: string;
  store_street_address: string;
  city: string;
  state: string;
  zip_code: string;
  store_type: string;
  latitude: number;
  longitude: number;
  distance_miles: number;
}

export const useNearbyStores = ({
  latitude,
  longitude,
  radius = 10,
  limit = 20,
  category = 'trending',
  storeTypes = [],
  namePatterns = [],
  useOptimized = true
}: UseNearbyStoresProps) => {
  return useQuery({
    queryKey: ['nearby-stores', latitude, longitude, radius, limit, category, storeTypes, namePatterns, useOptimized],
    queryFn: async (): Promise<StoreWithDistance[]> => {
      // Use optimized database function when possible
      if (useOptimized && namePatterns.length === 0) {
        const { data, error } = await supabase.rpc('get_nearby_stores', {
          user_lat: latitude,
          user_lng: longitude,
          radius_miles: radius,
          store_types: storeTypes.length > 0 ? storeTypes : null,
          result_limit: limit * 2 // Get more for better filtering
        });

        if (error) {
          console.error('Optimized nearby stores error:', error);
          throw error;
        }

        // Convert the raw results to the correct format
        let storesWithDistance: StoreWithDistance[] = (data || []).map((result: OptimizedNearbyResult) => ({
          id: result.id,
          Store_Name: result.store_name,
          Store_Street_Address: result.store_street_address,
          City: result.city,
          State: result.state,
          Zip_Code: result.zip_code,
          Store_Type: result.store_type,
          Latitude: result.latitude,
          Longitude: result.longitude,
          distance: result.distance_miles,
          // Map other required fields with defaults
          Additional_Address: null,
          Zip4: null,
          County: null,
          Record_ID: null,
          ObjectId: null,
          Grantee_Name: null,
          X: null,
          Y: null,
          Incentive_Program: null
        }));

        // Apply trending logic if needed
        if (category === 'trending') {
          const storeIds = storesWithDistance.map(store => parseInt(store.id));
          
          if (storeIds.length > 0) {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            
            const { data: clickData } = await supabase
              .from('store_clicks')
              .select('store_id, clicked_at, user_latitude, user_longitude')
              .in('store_id', storeIds.map(id => id.toString()))
              .gte('clicked_at', thirtyDaysAgo.toISOString());

            const trendingScores = new Map<number, number>();
            
            clickData?.forEach(click => {
              const clickDistance = calculateDistance(
                latitude,
                longitude,
                parseFloat(click.user_latitude.toString()),
                parseFloat(click.user_longitude.toString())
              );
              
              if (clickDistance <= 25) {
                const daysSinceClick = (Date.now() - new Date(click.clicked_at).getTime()) / (1000 * 60 * 60 * 24);
                const recencyWeight = Math.max(0.1, 1 - (daysSinceClick / 30));
                
                const storeIdNum = parseInt(click.store_id);
                const currentScore = trendingScores.get(storeIdNum) || 0;
                trendingScores.set(storeIdNum, currentScore + recencyWeight);
              }
            });

            storesWithDistance = storesWithDistance.sort((a, b) => {
              const aScore = trendingScores.get(parseInt(a.id)) || 0;
              const bScore = trendingScores.get(parseInt(b.id)) || 0;
              
              if (aScore !== bScore) {
                return bScore - aScore;
              }
              
              const aHasIncentive = a.Incentive_Program ? 1 : 0;
              const bHasIncentive = b.Incentive_Program ? 1 : 0;
              if (aHasIncentive !== bHasIncentive) {
                return bHasIncentive - aHasIncentive;
              }
              
              return (a.distance || 0) - (b.distance || 0);
            });
          }
        }

        return storesWithDistance.slice(0, limit);
      }

      // Fallback to original implementation for complex queries
      const latDelta = radius / 69;
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

      if (category !== 'trending' && (Array.isArray(storeTypes) && storeTypes.length > 0 || Array.isArray(namePatterns) && namePatterns.length > 0)) {
        const filters = [];
        
        if (Array.isArray(storeTypes) && storeTypes.length > 0) {
          const typeFilters = storeTypes.map(type => `Store_Type.ilike.%${type}%`);
          filters.push(...typeFilters);
        }
        
        if (Array.isArray(namePatterns) && namePatterns.length > 0) {
          const nameFilters = namePatterns.map(pattern => `Store_Name.ilike.%${pattern}%`);
          filters.push(...nameFilters);
        }
        
        if (filters.length > 0) {
          query = query.or(filters.join(','));
        }
      }

      query = query.limit(limit * 2);

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching nearby stores:', error);
        throw error;
      }

      if (!data || !Array.isArray(data)) {
        return [];
      }

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
        .filter(store => store.distance <= radius);

      // Apply trending logic for original implementation
      if (category === 'trending') {
        const storeIds = storesWithDistance.map(store => parseInt(store.id));
        
        if (storeIds.length > 0) {
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          
          const { data: clickData } = await supabase
            .from('store_clicks')
            .select('store_id, clicked_at, user_latitude, user_longitude')
            .in('store_id', storeIds.map(id => id.toString()))
            .gte('clicked_at', thirtyDaysAgo.toISOString());

          const trendingScores = new Map<number, number>();
          
          clickData?.forEach(click => {
            const clickDistance = calculateDistance(
              latitude,
              longitude,
              parseFloat(click.user_latitude.toString()),
              parseFloat(click.user_longitude.toString())
            );
            
            if (clickDistance <= 25) {
              const daysSinceClick = (Date.now() - new Date(click.clicked_at).getTime()) / (1000 * 60 * 60 * 24);
              const recencyWeight = Math.max(0.1, 1 - (daysSinceClick / 30));
              
              const storeIdNum = parseInt(click.store_id);
              const currentScore = trendingScores.get(storeIdNum) || 0;
              trendingScores.set(storeIdNum, currentScore + recencyWeight);
            }
          });

          storesWithDistance = storesWithDistance.sort((a, b) => {
            const aScore = trendingScores.get(parseInt(a.id)) || 0;
            const bScore = trendingScores.get(parseInt(b.id)) || 0;
            
            if (aScore !== bScore) {
              return bScore - aScore;
            }
            
            const aHasIncentive = a.Incentive_Program ? 1 : 0;
            const bHasIncentive = b.Incentive_Program ? 1 : 0;
            if (aHasIncentive !== bHasIncentive) {
              return bHasIncentive - aHasIncentive;
            }
            
            return a.distance - b.distance;
          });
        } else {
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
        storesWithDistance = storesWithDistance.sort((a, b) => a.distance - b.distance);
      }

      return storesWithDistance.slice(0, limit);
    },
    enabled: !!(latitude && longitude),
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};
