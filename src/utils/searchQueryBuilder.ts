
import { supabase } from '@/integrations/supabase/client';

/**
 * Build search filters for store types with exclusion patterns
 */
export const buildStoreTypeFilters = (selectedStoreTypes: string[], excludePatterns: string[] = []): string[] => {
  const filters: string[] = [];
  selectedStoreTypes.forEach(type => {
    filters.push(`Store_Type.ilike.%${type}%`);
  });
  return filters;
};

/**
 * Build search filters for name patterns with exclusion patterns
 */
export const buildNamePatternFilters = (selectedNamePatterns: string[], excludePatterns: string[] = []): string[] => {
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
 * Build exclusion filters to remove unwanted matches
 */
export const buildExclusionFilters = (excludePatterns: string[]): string => {
  if (excludePatterns.length === 0) return '';
  
  const exclusions: string[] = [];
  excludePatterns.forEach(pattern => {
    exclusions.push(`Store_Name.not.ilike.%${pattern}%`);
    exclusions.push(`Store_Type.not.ilike.%${pattern}%`);
  });
  
  return exclusions.join(',');
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

  // Apply category filters with better matching logic
  if (activeCategory === 'farmers') {
    console.log('🥕 Applying farmers market filters');
    // Search for any store that could be a farmers market
    query = query.or(`Store_Name.ilike.%farmer%,Store_Name.ilike.%market%,Store_Type.ilike.%farmer%,Store_Type.ilike.%market%`);
  } else if (activeCategory === 'pharmacy') {
    console.log('💊 Applying pharmacy filters');
    // Search for pharmacies and drug stores, including major chains
    query = query.or(`Store_Name.ilike.%CVS%,Store_Name.ilike.%Walgreens%,Store_Name.ilike.%Rite Aid%,Store_Name.ilike.%pharmacy%,Store_Type.ilike.%pharmacy%,Store_Type.ilike.%drug store%`);
  } else if (activeCategory === 'dollar') {
    console.log('💵 Applying dollar store filters');
    // Search specifically for dollar stores, excluding pharmacies
    query = query.or(`Store_Name.ilike.%Dollar General%,Store_Name.ilike.%Family Dollar%,Store_Name.ilike.%Dollar Tree%,Store_Name.ilike.%99 cent%,Store_Type.ilike.%dollar%,Store_Type.ilike.%discount%`);
  } else if (activeCategory !== 'trending' && (selectedStoreTypes.length > 0 || selectedNamePatterns.length > 0)) {
    const filters = [
      ...buildStoreTypeFilters(selectedStoreTypes, excludePatterns),
      ...buildNamePatternFilters(selectedNamePatterns, excludePatterns)
    ];
    
    if (filters.length > 0) {
      console.log('Applied filters:', filters);
      query = query.or(filters.join(','));
    }
  }

  // Apply exclusion filters to remove unwanted matches
  if (excludePatterns.length > 0) {
    console.log('Applying exclusion patterns:', excludePatterns);
    excludePatterns.forEach(pattern => {
      query = query
        .not('Store_Name', 'ilike', `%${pattern}%`)
        .not('Store_Type', 'ilike', `%${pattern}%`);
    });
  }

  // Ensure we have coordinates for all results
  query = query
    .not('Latitude', 'is', null)
    .not('Longitude', 'is', null)
    .not('Store_Name', 'is', null)
    .neq('Store_Name', '');

  query = query.limit(2000); // Increased limit to search more broadly

  return query;
};
