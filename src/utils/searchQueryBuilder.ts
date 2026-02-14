import { supabase } from '@/integrations/supabase/client';

/** Default result limit for all search paths */
const RESULT_LIMIT = 200;

/**
 * Unified category → store type configuration.
 * Used by getCategoryStoreTypes, buildLocationAwareQuery inline filters,
 * and buildBaseQuery .or() filters – single source of truth.
 */
export const CATEGORY_STORE_TYPES: Record<string, {
  rpcTypes: string[];
  orFilter: string;
}> = {
  grocery: {
    rpcTypes: ['Supermarket', 'Grocery Store', 'Supercenter', 'Convenience Store', 'Specialty Store'],
    orFilter: 'Store_Type.ilike.%supermarket%,Store_Type.ilike.%grocery%,Store_Type.ilike.%supercenter%,Store_Type.ilike.%market%,Store_Name.ilike.%market%,Store_Name.ilike.%food%',
  },
  convenience: {
    rpcTypes: ['Convenience Store', 'Gas Station', 'Specialty Store'],
    orFilter: 'Store_Type.ilike.%convenience%,Store_Name.ilike.%7-eleven%,Store_Name.ilike.%circle k%,Store_Name.ilike.%wawa%',
  },
  hotmeals: {
    rpcTypes: ['Restaurant Meals Program', 'Restaurant', 'Fast Food'],
    orFilter: 'Store_Type.ilike.%restaurant%,Store_Name.ilike.%restaurant%,Store_Name.ilike.%cafe%,Store_Name.ilike.%diner%',
  },
  farmersmarket: {
    rpcTypes: ['Farmers Market', 'Farm Market', 'Specialty Store'],
    orFilter: "Store_Type.ilike.%farmers%,Store_Type.ilike.%market%,Store_Name.ilike.%farmers market%,Store_Name.ilike.%farm market%,Store_Name.ilike.%farmstand%",
  },
};

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
  
  selectedNamePatterns.forEach(pattern => {
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
  excludePatterns: string[] = [],
  selectedCity?: string,
  selectedState?: string,
  selectedZip?: string
) => {
  // First priority: If coordinates are available, prefer location-aware search
  if (locationSearch) {
    if (searchQuery.trim()) {
      // Name + coordinates → smart search + distance/radius
      const query = searchQuery.trim();
      return supabase.rpc('smart_store_search', {
        search_text: query,
        search_city: '',
        search_state: '',
        search_zip: '',
        similarity_threshold: 0.2,
        result_limit: RESULT_LIMIT
      }).then(async (result) => {
        if (result.data) {
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
              const scoreDiff = (b.similarity_score ?? 0) - (a.similarity_score ?? 0);
              if (Math.abs(scoreDiff) > 0.1) return scoreDiff;
              return (a.distance_miles ?? 0) - (b.distance_miles ?? 0);
            });
          return { data: resultsWithDistance, error: result.error };
        }
        return result;
      });
    }

    // Coordinates only → proximity-based function with category filtering
    const categoryConfig = CATEGORY_STORE_TYPES[activeCategory];
    return supabase.rpc('get_nearby_stores', {
      user_lat: locationSearch.lat,
      user_lng: locationSearch.lng,
      radius_miles: radius,
      store_types: categoryConfig?.rpcTypes ?? null,
      result_limit: RESULT_LIMIT
    });
  }
  
  // Next: Use selectedCity and selectedState from LocationSelector, if provided
  if (selectedCity && selectedState) {
    return supabase.rpc('smart_store_search', {
      search_text: searchQuery.trim() || '',
      search_city: selectedCity,
      search_state: selectedState,
      search_zip: '',
      similarity_threshold: 0.2,
      result_limit: RESULT_LIMIT
    });
  }
  
  // Second priority: If explicit ZIP is selected, use it
  if (selectedZip && selectedZip.trim().match(/^\d{5}$/)) {
    const nameOnly = (searchQuery || '').trim();
    return supabase.rpc('smart_store_search', {
      search_text: nameOnly,
      search_city: '',
      search_state: '',
      search_zip: selectedZip.trim(),
      similarity_threshold: 0.2,
      result_limit: RESULT_LIMIT
    });
  }
  
  // Next: If we have a search query, try to parse it for business name + city/zip combinations
  if (searchQuery.trim()) {
    const query = searchQuery.trim();
    
    // Check if the search contains common city name patterns
    // Import city names from cityData would bloat the bundle; keep a lean inline list
    const cityWords = ['fresno', 'sacramento', 'los angeles', 'san francisco', 'san diego', 'oakland', 'bakersfield', 'stockton', 'modesto', 'riverside'];
    const foundCity = cityWords.find(city => query.toLowerCase().includes(city.toLowerCase()));
    
    if (foundCity) {
      const businessName = query.toLowerCase().replace(foundCity.toLowerCase(), '').trim();
      
      return supabase.rpc('smart_store_search', {
        search_text: businessName || query,
        search_city: foundCity,
        search_state: '',
        search_zip: '',
        similarity_threshold: 0.2,
        result_limit: RESULT_LIMIT
      });
    }
    
    // If we have both location AND a search query, use smart_store_search for best results
    if (locationSearch) {
      return supabase.rpc('smart_store_search', {
        search_text: query,
        search_city: '',
        search_state: '',
        search_zip: '',
        similarity_threshold: 0.2,
        result_limit: RESULT_LIMIT
      }).then(async (result) => {
        if (result.data) {
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
              const scoreDiff = b.similarity_score - a.similarity_score;
              if (Math.abs(scoreDiff) > 0.1) return scoreDiff;
              return a.distance_miles - b.distance_miles;
            });
          
          return { data: resultsWithDistance, error: result.error };
        }
        return result;
      });
    }
    
    // For search queries without location, still use smart_store_search
    return supabase.rpc('smart_store_search', {
      search_text: query,
      search_city: '',
      search_state: '',
      search_zip: '',
      similarity_threshold: 0.2,
      result_limit: RESULT_LIMIT
    });
  }
  
  // If we have location but no search query, use the proximity-based function
  if (locationSearch) {
    const categoryConfig = CATEGORY_STORE_TYPES[activeCategory];
    
    return supabase.rpc('get_nearby_stores', {
      user_lat: locationSearch.lat,
      user_lng: locationSearch.lng,
      radius_miles: radius,
      store_types: categoryConfig?.rpcTypes ?? null,
      result_limit: RESULT_LIMIT
    });
  }
  
  // Fallback to original query for non-location searches
  return buildBaseQuery(searchQuery, activeCategory, selectedStoreTypes, selectedNamePatterns, locationSearch, excludePatterns);
};

/**
 * Map activeCategory to store_types for the get_nearby_stores RPC
 */
function getCategoryStoreTypes(activeCategory: string): string[] | null {
  return CATEGORY_STORE_TYPES[activeCategory]?.rpcTypes ?? null;
}

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

  // Apply search query first if provided
  if (searchQuery.trim()) {
    query = query.or(`Store_Name.ilike.%${searchQuery}%,City.ilike.%${searchQuery}%,Zip_Code.ilike.%${searchQuery}%,State.ilike.%${searchQuery}%`);
  }

  // Apply category filters using the unified config
  const categoryConfig = CATEGORY_STORE_TYPES[activeCategory];
  if (categoryConfig) {
    query = query.or(categoryConfig.orFilter);
  } else if (activeCategory !== 'trending' && (selectedStoreTypes.length > 0 || selectedNamePatterns.length > 0)) {
    const filters = [
      ...buildStoreTypeFilters(selectedStoreTypes),
      ...buildNamePatternFilters(selectedNamePatterns)
    ];
    
    if (filters.length > 0) {
      query = query.or(filters.join(','));
    }
  }

  // Ensure we have coordinates for all results
  query = query
    .not('Latitude', 'is', null)
    .not('Longitude', 'is', null)
    .not('Store_Name', 'is', null)
    .neq('Store_Name', '');

  query = query.limit(RESULT_LIMIT);

  return query;
};
