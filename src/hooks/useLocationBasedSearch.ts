import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { sortStores } from '@/utils/storeSorting';
import { useLocationSearch } from '@/hooks/useLocationSearch';
import { useCategoryManagement } from '@/hooks/useCategoryManagement';
import { useStoreSearchQuery } from '@/hooks/useStoreSearchQuery';
import type { SortOption } from '@/components/SortDropdown';

export const useLocationBasedSearch = () => {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [sortBy, setSortBy] = useState<'relevance' | 'distance' | 'name'>('relevance');

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
    selectedNamePatterns,
    radius,
    setRadius,
    handleCategoryChange,
  } = useCategoryManagement();

  // Use the search query hook with city/state parameters
  const { data: stores, isLoading, error } = useStoreSearchQuery({
    searchQuery,
    activeCategory,
    selectedStoreTypes,
    selectedNamePatterns,
    locationSearch,
    userZipCode,
    radius,
    city: locationSearch?.city,
    state: locationSearch?.state,
    zipCode: userZipCode || '',
  });

  // Sort the stores based on current sort option
  const sortedStores = stores ? sortStores(stores, sortBy) : [];

  const handleLocationUpdate = (location: typeof locationSearch) => {
    console.log('useLocationBasedSearch: Updating location to:', location);
    setLocationSearch(location);
  };

  const wrappedSetSearchQuery = (query: string) => {
    console.log('useLocationBasedSearch: Setting search query to:', query);
    setSearchQuery(query);
  };

  // Location selection helpers
  const selectedCity = locationSearch?.city || '';
  const selectedState = locationSearch?.state || '';
  const selectedZip = userZipCode || '';
  const setSelectedZip = (zip: string) => {
    // This would need to be implemented in useLocationSearch
  };

  const handleLocationSelect = (city: string, state: string) => {
    setLocationSearch({ city, state });
  };

  const clearLocationSelection = () => {
    setLocationSearch(null);
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
    selectedNamePatterns,
    radius,
    setRadius,
    handleCategoryChange,
    selectedCity,
    selectedState,
    selectedZip,
    setSelectedZip,
    handleLocationSelect,
    clearLocationSelection,
  };
};