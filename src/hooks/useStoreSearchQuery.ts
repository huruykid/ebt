
import { useQuery } from '@tanstack/react-query';
import { buildBaseQuery } from '@/utils/searchQueryBuilder';
import { calculateDistance } from '@/utils/distanceCalculation';
import { 
  applyGroceryExclusion, 
  applyLocationFiltering 
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

      // For category searches, don't use exclusion patterns in the query - apply them after
      const excludePatterns = activeCategory === 'trending' ? CATEGORY_EXCLUSIONS[activeCategory] || [] : [];

      // Build the query without exclusion patterns for category searches
      const query = buildBaseQuery(
        searchQuery,
        activeCategory,
        selectedStoreTypes,
        selectedNamePatterns,
        locationSearch,
        excludePatterns
      );

      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching stores:', error);
        throw error;
      }
      
      let results: StoreWithDistance[] = data || [];
      console.log('📊 Initial database results:', {
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

      // Apply category-specific exclusions AFTER getting results
      if (activeCategory === 'grocery' && results.length > 0) {
        console.log('🏪 Applying grocery exclusions...');
        const beforeExclusion = results.length;
        results = applyGroceryExclusion(results);
        console.log(`🏪 Grocery filtering: ${beforeExclusion} → ${results.length} stores`);
      } else if (activeCategory === 'convenience' && results.length > 0) {
        console.log('🏬 Applying convenience store exclusions...');
        const beforeExclusion = results.length;
        // Filter out CVS, Walgreens, and pharmacies from convenience store results
        results = results.filter(store => {
          const storeName = store.Store_Name?.toLowerCase() || '';
          const storeType = store.Store_Type?.toLowerCase() || '';
          const excludePatterns = ['cvs', 'walgreens', 'rite aid', 'dollar'];
          const shouldExclude = excludePatterns.some(pattern => 
            storeName.includes(pattern) || storeType.includes(pattern)
          );
          return !shouldExclude;
        });
        console.log(`🏬 Convenience store filtering: ${beforeExclusion} → ${results.length} stores`);
      }

      // Apply location filtering if active (this should be AFTER category filtering)
      if (locationSearch && results.length > 0) {
        console.log(`📍 Applying location filtering with ${radius} mile radius...`);
        const beforeLocationFilter = results.length;
        results = applyLocationFiltering(results, locationSearch, radius, calculateDistance);
        console.log(`📍 Location filtering: ${beforeLocationFilter} → ${results.length} stores within ${radius} miles`);
      } else if (locationSearch) {
        console.log('⚠️ No results to filter by location');
      } else {
        console.log('🌍 No location search active');
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
