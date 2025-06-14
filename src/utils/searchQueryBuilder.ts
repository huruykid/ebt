
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
 * Build the base Supabase query with search and category filters
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
    // Search for grocery stores and supermarkets
    query = query.or(`Store_Type.ilike.%supermarket%,Store_Type.ilike.%grocery%,Store_Type.ilike.%supercenter%,Store_Name.ilike.%market%`);
  } else if (activeCategory === 'convenience') {
    console.log('🏬 Applying convenience store filters');
    // Search for convenience stores
    query = query.or(`Store_Type.ilike.%convenience%,Store_Name.ilike.%7-eleven%,Store_Name.ilike.%circle k%,Store_Name.ilike.%wawa%`);
  } else if (activeCategory === 'hotmeals') {
    console.log('🍽️ Applying hot meals (RMP) filters');
    // Search for restaurants and places that might serve hot meals
    query = query.or(`Store_Type.ilike.%restaurant%,Store_Name.ilike.%restaurant%,Store_Name.ilike.%cafe%,Store_Name.ilike.%diner%`);
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
