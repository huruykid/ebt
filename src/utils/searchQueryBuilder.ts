
import { supabase } from '@/integrations/supabase/client';

/**
 * Build search filters for store types
 */
export const buildStoreTypeFilters = (selectedStoreTypes: string[]): string[] => {
  const filters: string[] = [];
  selectedStoreTypes.forEach(type => {
    filters.push(`Store_Type.ilike.%${type}%`);
  });
  return filters;
};

/**
 * Build search filters for name patterns
 */
export const buildNamePatternFilters = (selectedNamePatterns: string[]): string[] => {
  const filters: string[] = [];
  
  console.log('Applying name patterns:', selectedNamePatterns);
  selectedNamePatterns.forEach(pattern => {
    // For other patterns, use the original logic
    const words = pattern.split(' ');
    if (words.length > 1) {
      words.forEach(word => {
        if (word.length > 2) {
          filters.push(`Store_Name.ilike.%${word}%`);
          filters.push(`Store_Type.ilike.%${word}%`);
        }
      });
    } else {
      filters.push(`Store_Name.ilike.%${pattern}%`);
      filters.push(`Store_Type.ilike.%${pattern}%`);
    }
  });
  
  return filters;
};

/**
 * Build location-aware base query that prioritizes location filtering first
 */
export const buildLocationAwareQuery = (
  searchQuery: string,
  activeCategory: string,
  selectedStoreTypes: string[],
  selectedNamePatterns: string[],
  locationSearch: { lat: number; lng: number } | null,
  radius: number = 10,
  excludePatterns: string[] = []
) => {
  // If we have both location AND a search query, use smart_store_search for best results
  if (locationSearch && searchQuery.trim()) {
    console.log('🎯 Using smart search combining name and location for:', searchQuery);
    
    return supabase.rpc('smart_store_search', {
      search_text: searchQuery.trim(),
      search_city: '',
      search_state: '',
      search_zip: '',
      similarity_threshold: 0.2, // Lower threshold for more matches
      result_limit: 200
    }).then(async (result) => {
      if (result.data) {
        // Calculate distances and filter by radius for the smart search results
        const resultsWithDistance = result.data
          .map(store => ({
            ...store,
            distance_miles: calculateDistanceInline(
              locationSearch.lat,
              locationSearch.lng,
              store.latitude,
              store.longitude
            )
          }))
          .filter(store => store.distance_miles <= radius)
          .sort((a, b) => {
            // Primary sort: similarity score (higher is better)
            const scoreDiff = b.similarity_score - a.similarity_score;
            if (Math.abs(scoreDiff) > 0.1) return scoreDiff;
            
            // Secondary sort: distance (closer is better)
            return a.distance_miles - b.distance_miles;
          });
        
        console.log(`🎯 Smart search found ${resultsWithDistance.length} results within ${radius} miles for "${searchQuery}"`);
        return { data: resultsWithDistance, error: result.error };
      }
      return result;
    });
  }
  
  // If we have location but no search query, use the proximity-based function
  if (locationSearch) {
    console.log('🎯 Using location-aware search with radius:', radius);
    
    // For location-based searches, use broader category filters to get more results
    let storeTypeFilters: string[] = [];
    
    if (activeCategory === 'grocery') {
      // More inclusive grocery store types
      storeTypeFilters = [
        'Supermarket',
        'Grocery Store', 
        'Supercenter',
        'Convenience Store', // Include convenience stores that might sell groceries
        'Specialty Store'
      ];
    } else if (activeCategory === 'convenience') {
      storeTypeFilters = [
        'Convenience Store',
        'Gas Station',
        'Specialty Store'
      ];
    } else if (activeCategory === 'hotmeals') {
      storeTypeFilters = [
        'Restaurant Meals Program',
        'Restaurant',
        'Fast Food'
      ];
    } else if (activeCategory === 'farmersmarket') {
      storeTypeFilters = [
        'Farmers Market',
        'Farm Market',
        'Specialty Store'
      ];
    }
    
    // Use the optimized nearby stores function
    return supabase.rpc('get_nearby_stores', {
      user_lat: locationSearch.lat,
      user_lng: locationSearch.lng,
      radius_miles: radius,
      store_types: storeTypeFilters.length > 0 ? storeTypeFilters : null,
      result_limit: 200 // Increased limit for better results
    });
  }
  
  // Fallback to original query for non-location searches
  return buildBaseQuery(searchQuery, activeCategory, selectedStoreTypes, selectedNamePatterns, locationSearch, excludePatterns);
};

// Helper function to calculate distance inline
const calculateDistanceInline = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Build the base Supabase query with search and category filters (for non-location searches)
 */
export const buildBaseQuery = (
  searchQuery: string,
  activeCategory: string,
  selectedStoreTypes: string[],
  selectedNamePatterns: string[],
  locationSearch: { lat: number; lng: number } | null,
  excludePatterns: string[] = []
) => {
  let query = supabase
    .from('snap_stores')
    .select('*')
    .order('Store_Name');

  console.log('Query parameters:', {
    searchQuery,
    activeCategory,
    selectedStoreTypes,
    selectedNamePatterns,
    excludePatterns,
    locationSearch
  });

  // Apply search query first if provided
  if (searchQuery.trim()) {
    query = query.or(`Store_Name.ilike.%${searchQuery}%,City.ilike.%${searchQuery}%,Zip_Code.ilike.%${searchQuery}%,State.ilike.%${searchQuery}%`);
  }

  // Apply category filters with simplified logic
  if (activeCategory === 'grocery') {
    console.log('🏪 Applying grocery filters');
    // More inclusive grocery search
    query = query.or(`Store_Type.ilike.%supermarket%,Store_Type.ilike.%grocery%,Store_Type.ilike.%supercenter%,Store_Type.ilike.%market%,Store_Name.ilike.%market%,Store_Name.ilike.%food%`);
  } else if (activeCategory === 'convenience') {
    console.log('🏬 Applying convenience store filters');
    // Search for convenience stores
    query = query.or(`Store_Type.ilike.%convenience%,Store_Name.ilike.%7-eleven%,Store_Name.ilike.%circle k%,Store_Name.ilike.%wawa%`);
  } else if (activeCategory === 'hotmeals') {
    console.log('🍽️ Applying hot meals (RMP) filters');
    // Search for restaurants and places that might serve hot meals
    query = query.or(`Store_Type.ilike.%restaurant%,Store_Name.ilike.%restaurant%,Store_Name.ilike.%cafe%,Store_Name.ilike.%diner%`);
  } else if (activeCategory === 'farmersmarket') {
    console.log('🥕 Applying farmer\'s market filters');
    // Search for farmers markets and farm stands
    query = query.or(`Store_Type.ilike.%farmers%,Store_Type.ilike.%market%,Store_Name.ilike.%farmers market%,Store_Name.ilike.%farm market%,Store_Name.ilike.%farmstand%`);
  } else if (activeCategory !== 'trending' && (selectedStoreTypes.length > 0 || selectedNamePatterns.length > 0)) {
    const filters = [
      ...buildStoreTypeFilters(selectedStoreTypes),
      ...buildNamePatternFilters(selectedNamePatterns)
    ];
    
    if (filters.length > 0) {
      console.log('Applied filters:', filters);
      query = query.or(filters.join(','));
    }
  }

  // Ensure we have coordinates for all results
  query = query
    .not('Latitude', 'is', null)
    .not('Longitude', 'is', null)
    .not('Store_Name', 'is', null)
    .neq('Store_Name', '');

  query = query.limit(2000);

  return query;
};
