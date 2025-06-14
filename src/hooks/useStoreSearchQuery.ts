
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
            name: r.store_name || r.Store_Name, 
            type: r.store_type || r.Store_Type,
            distance: r.distance_miles ? r.distance_miles.toFixed(1) + ' miles' : 'unknown'
          }))
        });

        // Convert the RPC result format to our expected format
        results = results.map(store => ({
          id: store.id,
          Store_Name: store.store_name || store.Store_Name,
          Store_Street_Address: store.store_street_address || store.Store_Street_Address,
          City: store.city || store.City,
          State: store.state || store.State,
          Zip_Code: store.zip_code || store.Zip_Code,
          Store_Type: store.store_type || store.Store_Type,
          Latitude: store.latitude || store.Latitude,
          Longitude: store.longitude || store.Longitude,
          distance: store.distance_miles,
          // Map other required fields with defaults
          Additional_Address: store.Additional_Address || null,
          Zip4: store.Zip4 || null,
          County: store.County || null,
          Record_ID: store.Record_ID || null,
          ObjectId: store.ObjectId || null,
          Grantee_Name: store.Grantee_Name || null,
          X: store.X || null,
          Y: store.Y || null,
          Incentive_Program: store.Incentive_Program || null
        }));

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
