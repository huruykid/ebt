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
  const [sortBy, setSortBy] = useState<SortOption>('distance');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedZip, setSelectedZip] = useState('');

  useEffect(() => {
    const queryParam = searchParams.get('q') || '';
    if (queryParam !== searchQuery) {
      setSearchQuery(queryParam);
    }
  }, [searchParams]);

  const { locationSearch, setLocationSearch, userZipCode } = useLocationSearch();
  const {
    activeCategory,
    selectedStoreTypes,
    selectedNamePatterns,
    radius,
    setRadius,
    handleCategoryChange
  } = useCategoryManagement();

  const { data: stores, isLoading, error } = useStoreSearchQuery({
    searchQuery,
    activeCategory,
    selectedStoreTypes,
    selectedNamePatterns,
    locationSearch,
    userZipCode,
    radius,
    selectedCity,
    selectedState,
    selectedZip,
  });

  const sortedStores = stores ? sortStores(stores, sortBy) : [];

  const wrappedHandleCategoryChange = (categoryId: string, storeTypes: string[] = [], namePatterns: string[] = []) => {
    handleCategoryChange(categoryId, storeTypes, namePatterns);
    if (categoryId !== 'trending') {
      setSearchQuery('');
    }
  };

  const wrappedSetSearchQuery = (query: string) => {
    setSearchQuery(query);
  };

  const handleLocationSelect = (city: string, state: string) => {
    setSelectedCity(city);
    setSelectedState(state);
  };

  const clearLocationSelection = () => {
    setSelectedCity('');
    setSelectedState('');
    setSelectedZip('');
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
    selectedCity,
    selectedState,
    selectedZip,
    setSelectedZip,
    handleLocationSelect,
    clearLocationSelection,
  };
};
