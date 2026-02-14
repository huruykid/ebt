
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { buildLocationAwareQuery } from '@/utils/searchQueryBuilder';
import { calculateDistance } from '@/utils/distanceCalculation';
import { 
  applyGroceryExclusion,
  applyFarmersMarketFiltering
} from '@/utils/storeFiltering';
import { CATEGORY_EXCLUSIONS } from '@/constants/searchConstants';
import type { StoreWithDistance, SearchParams } from '@/types/storeSearchTypes';

export const useStoreSearchQuery = (params: SearchParams) => {
  const {
    searchQuery,
    activeCategory,
    selectedStoreTypes,
    selectedNamePatterns,
    locationSearch,
    userZipCode,
    radius
  } = params;

  return useQuery({
    queryKey: ['stores', searchQuery, activeCategory, selectedStoreTypes, selectedNamePatterns, locationSearch, radius, userZipCode, params.selectedCity, params.selectedState, params.selectedZip],
    queryFn: async (): Promise<StoreWithDistance[]> => {
      const query = buildLocationAwareQuery(
        searchQuery,
        activeCategory,
        selectedStoreTypes,
        selectedNamePatterns,
        locationSearch,
        radius,
        [],
        params.selectedCity,
        params.selectedState,
        params.selectedZip
      );

      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching stores:', error);
        throw error;
      }
      
      let results: StoreWithDistance[] = [];
      
      // For location-aware queries, the results already include distance and are pre-filtered
      if (locationSearch && data && data.length > 0 && 'distance_miles' in data[0]) {
        // Enrich RPC results with google_opening_hours and Incentive_Program
        const storeIds = data.map((s: any) => s.id);
        const { data: enrichData } = await supabase
          .from('snap_stores')
          .select('id, google_opening_hours, Incentive_Program')
          .in('id', storeIds);

        const enrichMap = new Map<string, { google_opening_hours: any; Incentive_Program: string | null }>();
        if (enrichData) {
          for (const e of enrichData) {
            enrichMap.set(e.id, { google_opening_hours: e.google_opening_hours, Incentive_Program: e.Incentive_Program });
          }
        }

        // Convert the RPC result format to our expected format
        results = (data.map(store => {
          const s = store as any;
          const extra = enrichMap.get(s.id);
          return {
            ...s,
            id: s.id,
            Store_Name: s.Store_Name || s.store_name,
            Store_Street_Address: s.Store_Street_Address || s.store_street_address,
            City: s.City || s.city,
            State: s.State || s.state,
            Zip_Code: s.Zip_Code || s.zip_code,
            Store_Type: s.Store_Type || s.store_type,
            Latitude: s.Latitude ?? s.latitude,
            Longitude: s.Longitude ?? s.longitude,
            distance: s.distance_miles ?? s.distance,
            Additional_Address: s.Additional_Address || s.additional_address || null,
            Zip4: s.Zip4 || s.zip4 || null,
            County: s.County || s.county || null,
            Record_ID: s.Record_ID || s.record_id || null,
            ObjectId: s.ObjectId || s.object_id || null,
            Grantee_Name: s.Grantee_Name || s.grantee_name || null,
            X: s.X || s.x || null,
            Y: s.Y || s.y || null,
            Incentive_Program: extra?.Incentive_Program || s.Incentive_Program || s.incentive_program || null,
            google_opening_hours: extra?.google_opening_hours || s.google_opening_hours || null,
          };
        }) as StoreWithDistance[]);

        // Apply name-pattern-based filtering
        if (selectedNamePatterns.length > 0 && results.length > 0) {
          results = results.filter(store => {
            const name = (store.Store_Name || '').toLowerCase();
            const type = (store.Store_Type || '').toLowerCase();
            return selectedNamePatterns.some(p => 
              name.includes(p.toLowerCase()) || type.includes(p.toLowerCase())
            );
          });
        }

        // Apply category-specific filtering for location-based searches
        if (activeCategory === 'grocery' && results.length > 0) {
          results = applyGroceryExclusion(results);
        } else if (activeCategory === 'farmersmarket' && results.length > 0) {
          results = applyFarmersMarketFiltering(results);
        }

        return results;
      }

      // Fallback to original logic for non-location searches
      if (data && Array.isArray(data)) {
        results = data.map(store => {
          if ('Store_Name' in store) {
            return store as StoreWithDistance;
          } else {
            const storeData = store as any;
            return {
              id: storeData.id,
              Store_Name: storeData.store_name || storeData.Store_Name,
              Store_Street_Address: storeData.store_street_address || storeData.Store_Street_Address,
              City: storeData.city || storeData.City,
              State: storeData.state || storeData.State,
              Zip_Code: storeData.zip_code || storeData.Zip_Code,
              Store_Type: storeData.store_type || storeData.Store_Type,
              Latitude: storeData.latitude || storeData.Latitude,
              Longitude: storeData.longitude || storeData.Longitude,
              Additional_Address: storeData.additional_address || storeData.Additional_Address || null,
              Zip4: storeData.zip4 || storeData.Zip4 || null,
              County: storeData.county || storeData.County || null,
              Record_ID: storeData.record_id || storeData.Record_ID || null,
              ObjectId: storeData.object_id || storeData.ObjectId || null,
              Grantee_Name: storeData.grantee_name || storeData.Grantee_Name || null,
              X: storeData.x || storeData.X || null,
              Y: storeData.y || storeData.Y || null,
              Incentive_Program: storeData.incentive_program || storeData.Incentive_Program || null,
              distance: storeData.distance_miles || storeData.distance
            } as StoreWithDistance;
          }
        });
      } else {
        results = [];
      }

      // Apply category-specific exclusions for non-location searches
      if (activeCategory === 'grocery' && results.length > 0) {
        results = applyGroceryExclusion(results);
      } else if (activeCategory === 'farmersmarket' && results.length > 0) {
        results = applyFarmersMarketFiltering(results);
      }

      // Apply location filtering for non-location searches if location is provided
      if (locationSearch && results.length > 0) {
        results = results
          .filter(store => store.Latitude && store.Longitude)
          .map(store => {
            const distance = calculateDistance(
              locationSearch.lat,
              locationSearch.lng,
              store.Latitude!,
              store.Longitude!
            );
            return { ...store, distance };
          })
          .filter(store => store.distance! <= radius)
          .sort((a, b) => a.distance! - b.distance!);
      }

      return results;
    },
  });
};
