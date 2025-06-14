
import { useQuery } from '@tanstack/react-query';
import { buildLocationAwareQuery } from '@/utils/searchQueryBuilder';
import { calculateDistance } from '@/utils/distanceCalculation';
import { 
  applyGroceryExclusion
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
        radius
      );

      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching stores:', error);
        throw error;
      }
      
      let results: StoreWithDistance[] = data || [];
      
      // For location-aware queries, the results already include distance and are pre-filtered
      if (locationSearch && data && data.length > 0 && 'distance_miles' in data[0]) {
        console.log('📊 Location-aware results received:', {
          totalResults: results.length,
          category: activeCategory,
          radius: radius,
          sampleResults: results.slice(0, 3).map(r => ({ 
            name: r.Store_Name || (r as any).store_name, 
            type: r.Store_Type || (r as any).store_type,
            distance: (r as any).distance_miles ? (r as any).distance_miles.toFixed(1) + ' miles' : 'unknown'
          }))
        });

        // Convert the RPC result format to our expected format
        results = results.map(store => {
          const storeData = store as any; // Type assertion to handle the mixed format
          return {
            id: storeData.id,
            Store_Name: storeData.Store_Name || storeData.store_name,
            Store_Street_Address: storeData.Store_Street_Address || storeData.store_street_address,
            City: storeData.City || storeData.city,
            State: storeData.State || storeData.state,
            Zip_Code: storeData.Zip_Code || storeData.zip_code,
            Store_Type: storeData.Store_Type || storeData.store_type,
            Latitude: storeData.Latitude || storeData.latitude,
            Longitude: storeData.Longitude || storeData.longitude,
            distance: storeData.distance || storeData.distance_miles,
            // Map other required fields with defaults
            Additional_Address: storeData.Additional_Address || null,
            Zip4: storeData.Zip4 || null,
            County: storeData.County || null,
            Record_ID: storeData.Record_ID || null,
            ObjectId: storeData.ObjectId || null,
            Grantee_Name: storeData.Grantee_Name || null,
            X: storeData.X || null,
            Y: storeData.Y || null,
            Incentive_Program: storeData.Incentive_Program || null
          };
        });

        // Only apply exclusions for location-based searches (not in the database query)
        if (activeCategory === 'grocery' && results.length > 0) {
          console.log('🏪 Applying grocery exclusions to location results...');
          const beforeExclusion = results.length;
          results = applyGroceryExclusion(results);
          console.log(`🏪 Grocery filtering: ${beforeExclusion} → ${results.length} stores`);
        }

        return results;
      }

      // Fallback to original logic for non-location searches
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
