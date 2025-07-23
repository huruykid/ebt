
import { useQuery } from '@tanstack/react-query';
import { buildLocationAwareQuery } from '@/utils/searchQueryBuilder';
import { calculateDistance } from '@/utils/distanceCalculation';
import { 
  applyGroceryExclusion,
  applyFarmersMarketFiltering
} from '@/utils/storeFiltering';
import { CATEGORY_EXCLUSIONS } from '@/constants/storeSearchConstants';
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
    queryKey: ['stores', searchQuery, activeCategory, selectedStoreTypes, selectedNamePatterns, locationSearch, radius, userZipCode],
    queryFn: async (): Promise<StoreWithDistance[]> => {
      console.log('🔍 Starting store search with params:', params);

      // Use the new location-aware query builder
      const query = buildLocationAwareQuery(
        searchQuery,
        activeCategory,
        selectedStoreTypes,
        selectedNamePatterns,
        locationSearch,
        radius,
        [], // excludePatterns - not used currently
        params.selectedCity,
        params.selectedState
      );

      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching stores:', error);
        throw error;
      }
      
      let results: StoreWithDistance[] = [];
      
      // For location-aware queries, the results already include distance and are pre-filtered
      if (locationSearch && data && data.length > 0 && 'distance_miles' in data[0]) {
        console.log('📊 Location-aware results received:', {
          totalResults: data.length,
          category: activeCategory,
          radius: radius,
          searchQuery: searchQuery,
          sampleResults: data.slice(0, 3).map(r => ({ 
            name: (r as any).store_name, 
            type: (r as any).store_type,
            distance: (r as any).distance_miles ? (r as any).distance_miles.toFixed(1) + ' miles' : 'unknown',
            similarity: (r as any).similarity_score ? (r as any).similarity_score.toFixed(2) : 'n/a'
          }))
        });

        // Convert the RPC result format to our expected format
        results = data.map(store => {
          const storeData = store as any; // Type assertion to handle the RPC result format
          return {
            id: storeData.id,
            Store_Name: storeData.store_name,
            Store_Street_Address: storeData.store_street_address,
            City: storeData.city,
            State: storeData.state,
            Zip_Code: storeData.zip_code,
            Store_Type: storeData.store_type,
            Latitude: storeData.latitude,
            Longitude: storeData.longitude,
            distance: storeData.distance_miles,
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
          };
        });

        // Apply category-specific filtering for location-based searches
        if (activeCategory === 'grocery' && results.length > 0) {
          console.log('🏪 Applying grocery exclusions to location results...');
          const beforeExclusion = results.length;
          results = applyGroceryExclusion(results);
          console.log(`🏪 Grocery filtering: ${beforeExclusion} → ${results.length} stores`);
        } else if (activeCategory === 'farmersmarket' && results.length > 0) {
          console.log('🥕 Applying farmers market filtering to location results...');
          const beforeFiltering = results.length;
          results = applyFarmersMarketFiltering(results);
          console.log(`🥕 Farmers market filtering: ${beforeFiltering} → ${results.length} stores`);
        }

        return results;
      }

      // Fallback to original logic for non-location searches
      // Transform the data to match StoreWithDistance type
      if (data && Array.isArray(data)) {
        results = data.map(store => {
          // Handle both formats - some queries return the correct format already
          if ('Store_Name' in store) {
            return store as StoreWithDistance;
          } else {
            // Transform from database format to StoreWithDistance format
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
      
      console.log('📊 Non-location search results:', {
        totalResults: results.length,
        category: activeCategory,
        radius: radius,
        locationActive: !!locationSearch,
        sampleResults: results.slice(0, 3).map(r => ({ 
          name: r.Store_Name, 
          type: r.Store_Type,
          coordinates: { lat: r.Latitude, lng: r.Longitude }
        }))
      });

      // Apply category-specific exclusions for non-location searches
      const excludePatterns = activeCategory === 'trending' ? CATEGORY_EXCLUSIONS[activeCategory] || [] : [];
      
      if (activeCategory === 'grocery' && results.length > 0) {
        console.log('🏪 Applying grocery exclusions...');
        const beforeExclusion = results.length;
        results = applyGroceryExclusion(results);
        console.log(`🏪 Grocery filtering: ${beforeExclusion} → ${results.length} stores`);
      } else if (activeCategory === 'farmersmarket' && results.length > 0) {
        console.log('🥕 Applying farmers market filtering...');
        const beforeFiltering = results.length;
        results = applyFarmersMarketFiltering(results);
        console.log(`🥕 Farmers market filtering: ${beforeFiltering} → ${results.length} stores`);
      }

      // Apply location filtering for non-location searches if location is provided
      if (locationSearch && results.length > 0) {
        console.log(`📍 Applying fallback location filtering with ${radius} mile radius...`);
        const beforeLocationFilter = results.length;
        
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
          
        console.log(`📍 Fallback location filtering: ${beforeLocationFilter} → ${results.length} stores within ${radius} miles`);
      }

      console.log('✅ Final search results:', {
        category: activeCategory,
        storeTypes: selectedStoreTypes,
        namePatterns: selectedNamePatterns,
        locationActive: !!locationSearch,
        radius: radius,
        totalResults: results.length,
        sampleResults: results.slice(0, 3).map(r => ({ 
          name: r.Store_Name, 
          type: r.Store_Type,
          distance: r.distance ? r.distance.toFixed(1) + ' miles' : 'no distance calculated'
        }))
      });

      return results;
    },
  });
};
