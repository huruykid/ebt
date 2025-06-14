
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type Store = Tables<'snap_stores'>;

interface StoreWithDistance extends Store {
  distance?: number;
}

interface UseOptimizedNearbyStoresProps {
  latitude: number;
  longitude: number;
  radius?: number;
  limit?: number;
  storeTypes?: string[];
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

export const useOptimizedNearbyStores = ({
  latitude,
  longitude,
  radius = 10,
  limit = 50,
  storeTypes = []
}: UseOptimizedNearbyStoresProps) => {
  return useQuery({
    queryKey: ['optimized-nearby-stores', latitude, longitude, radius, limit, storeTypes],
    queryFn: async (): Promise<StoreWithDistance[]> => {
      const { data, error } = await supabase.rpc('get_nearby_stores', {
        user_lat: latitude,
        user_lng: longitude,
        radius_miles: radius,
        store_types: storeTypes.length > 0 ? storeTypes : null,
        result_limit: limit
      });

      if (error) {
        console.error('Optimized nearby stores error:', error);
        throw error;
      }

      console.log('Optimized nearby search results:', data?.length || 0, 'stores found');
      
      // Convert the raw results to the correct format
      const convertedResults: StoreWithDistance[] = (data || []).map((result: OptimizedNearbyResult) => ({
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
      
      return convertedResults;
    },
    enabled: !!(latitude && longitude),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};
