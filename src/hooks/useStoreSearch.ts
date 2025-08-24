
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { sortStores } from '@/utils/storeSorting';
import { useLocationSearch } from '@/hooks/useLocationSearch';
import { useCategoryManagement } from '@/hooks/useCategoryManagement';
import { useStoreSearchQuery } from '@/hooks/useStoreSearchQuery';
import type { SortOption } from '@/components/SortDropdown';

export const useStoreSearch = () => {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [sortBy, setSortBy] = useState<SortOption>('distance');

  // Update search query when URL parameter changes
  useEffect(() => {
    const queryParam = searchParams.get('q') || '';
    if (queryParam !== searchQuery) {
      setSearchQuery(queryParam);
    }
  }, [searchParams]);

  // Use custom hooks for location and category management
  const { locationSearch, setLocationSearch, userZipCode } = useLocationSearch();
  const {
    activeCategory,
    selectedStoreTypes,
    selectedNamePatterns,
    radius,
    setRadius,
    handleCategoryChange
  } = useCategoryManagement();

  // Use the search query hook
  const { data: stores, isLoading, error } = useStoreSearchQuery({
    searchQuery,
    activeCategory,
    selectedStoreTypes,
    selectedNamePatterns,
    locationSearch,
    userZipCode,
    radius,
    selectedCity: '', // Will be updated by SearchContainer
    selectedState: '' // Will be updated by SearchContainer
  });

  // Sort the stores based on the selected option
  const sortedStores = stores ? sortStores(stores, sortBy) : [];

  const wrappedHandleCategoryChange = (categoryId: string, storeTypes: string[] = [], namePatterns: string[] = []) => {
    handleCategoryChange(categoryId, storeTypes, namePatterns);
    
    // Force a fresh search by clearing the search query for category-based searches
    if (categoryId !== 'trending') {
      setSearchQuery('');
    }
  };

  const wrappedSetSearchQuery = (query: string) => {
    console.log('useStoreSearch: Setting search query to:', query);
    setSearchQuery(query);
  };

  return {
    searchQuery,
    setSearchQuery: wrappedSetSearchQuery,
    activeCategory,
    selectedStoreTypes,
    selectedNamePatterns,
    locationSearch,
    setLocationSearch,
    sortBy,
    setSortBy,
    radius,
    setRadius,
    stores: sortedStores,
    isLoading,
    error,
    handleCategoryChange: wrappedHandleCategoryChange,
    userZipCode,
  };
};
