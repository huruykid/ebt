
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
    // For farmers market patterns, be more specific
    if (pattern.toLowerCase().includes('farmer')) {
      // Match variations of farmers market
      filters.push(`Store_Name.ilike.%farmers market%`);
      filters.push(`Store_Name.ilike.%farmer's market%`);
      filters.push(`Store_Name.ilike.%farm market%`);
      filters.push(`Store_Type.ilike.%farmers market%`);
      filters.push(`Store_Type.ilike.%farmer's market%`);
      filters.push(`Store_Type.ilike.%farm market%`);
    } else {
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
  locationSearch: { lat: number; lng: number } | null
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
    locationSearch
  });

  // Apply search query first
  if (searchQuery.trim()) {
    query = query.or(`Store_Name.ilike.%${searchQuery}%,City.ilike.%${searchQuery}%,Zip_Code.ilike.%${searchQuery}%,State.ilike.%${searchQuery}%`);
  }

  // Apply category filters for non-trending categories
  if (activeCategory !== 'trending' && (selectedStoreTypes.length > 0 || selectedNamePatterns.length > 0)) {
    const filters = [
      ...buildStoreTypeFilters(selectedStoreTypes),
      ...buildNamePatternFilters(selectedNamePatterns)
    ];
    
    if (filters.length > 0) {
      console.log('Applied filters:', filters);
      query = query.or(filters.join(','));
    }
  }

  // If location search is active, ensure we have latitude/longitude data
  if (locationSearch) {
    query = query
      .not('Latitude', 'is', null)
      .not('Longitude', 'is', null);
  }

  query = query.limit(1000); // Increased limit to get more results before distance filtering

  return query;
};
