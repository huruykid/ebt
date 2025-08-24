import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { sortStores } from '@/utils/storeSorting';
import { useLocationSearch } from '@/hooks/useLocationSearch';
import { useCategoryManagement } from '@/hooks/useCategoryManagement';
import { useStoreSearchQuery } from '@/hooks/useStoreSearchQuery';
import type { SortOption } from '@/components/SortDropdown';

interface UseStoreSearchProps {
  useLocationParams?: boolean;
}

export const useStoreSearch = ({ useLocationParams = false }: UseStoreSearchProps = {}) => {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [sortBy, setSortBy] = useState<SortOption>('relevance');

  // Initialize from URL params
  useEffect(() => {
    const urlQuery = searchParams.get('q') || '';
    if (urlQuery !== searchQuery) {
      setSearchQuery(urlQuery);
    }
  }, [searchParams]);

  // Use custom hooks for location and category management
  const { locationSearch, setLocationSearch, userZipCode } = useLocationSearch();
  const {
    activeCategory,
    selectedStoreTypes,
    setActiveCategory,
    setSelectedStoreTypes,
    resetCategoryFilters
  } = useCategoryManagement();

  // Build search parameters
  const searchParams_internal = {
    searchQuery,
    activeCategory,
    selectedStoreTypes,
    ...(useLocationParams && locationSearch ? {
      city: locationSearch.city,
      state: locationSearch.state,
      zipCode: locationSearch.zipCode
    } : {}),
  };

  // Use the search query hook
  const { data: stores, isLoading, error } = useStoreSearchQuery(searchParams_internal);

  // Sort the stores based on current sort option
  const sortedStores = stores ? sortStores(stores, sortBy) : [];

  const handleLocationUpdate = (location: typeof locationSearch) => {
    console.log('useStoreSearch: Updating location to:', location);
    setLocationSearch(location);
  };

  const wrappedSetSearchQuery = (query: string) => {
    console.log('useStoreSearch: Setting search query to:', query);
    setSearchQuery(query);
  };

  return {
    searchQuery,
    setSearchQuery: wrappedSetSearchQuery,
    stores: sortedStores,
    isLoading,
    error,
    sortBy,
    setSortBy,
    locationSearch,
    setLocationSearch: handleLocationUpdate,
    userZipCode,
    activeCategory,
    selectedStoreTypes,
    setActiveCategory,
    setSelectedStoreTypes,
    resetCategoryFilters,
  };
};