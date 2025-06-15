
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchHeader } from './SearchHeader';
import { SmartSearchResults } from './SmartSearchResults';
import { CategorySearchResults } from './CategorySearchResults';
import { useStoreSearch } from '@/hooks/useStoreSearch';
import { useSmartSearch } from '@/hooks/useSmartSearch';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useToast } from "@/components/ui/use-toast";
import type { Tables } from '@/integrations/supabase/types';

type Store = Tables<'snap_stores'>;

interface StoreWithDistance extends Store {
  distance?: number;
}

export const SearchContainer: React.FC = () => {
  const navigate = useNavigate();
  const { latitude, longitude, loading: locationLoading } = useGeolocation();
  const [searchMode, setSearchMode] = useState<'category' | 'smart'>('category');
  const { toast } = useToast();
  
  // Original category-based search
  const {
    searchQuery,
    setSearchQuery,
    activeCategory,
    selectedStoreTypes,
    locationSearch,
    setLocationSearch,
    sortBy,
    setSortBy,
    radius,
    setRadius,
    stores,
    isLoading: categoryLoading,
    error: categoryError,
    handleCategoryChange,
  } = useStoreSearch();

  // New smart search functionality
  const {
    results: smartResults,
    isLoading: smartLoading,
    error: smartError,
    performSearch: performSmartSearch,
    clearSearch: clearSmartSearch,
    searchParams
  } = useSmartSearch();

  // Automatically set location search when geolocation is available
  useEffect(() => {
    if (latitude && longitude && !locationSearch && !searchQuery.trim() && searchMode === 'category') {
      setLocationSearch({ lat: latitude, lng: longitude });
    }
  }, [latitude, longitude, locationSearch, searchQuery, setLocationSearch, searchMode]);

  // Parse query params once on mount to set defaults for smart search (esp. state)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initialState = params.get('state') || 'CA';
    // If no state param and city param IS PRESENT: force user to select
    if (params.get('city') && !params.get('state')) {
      console.log('City search without state detected, will prompt user to select state');
    }
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setLocationSearch(null);
    setSearchMode('category');
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`, { replace: true });
    } else {
      navigate('/search', { replace: true });
    }
  };

  const handleSmartSearch = (searchText: string, city?: string, zipCode?: string, state?: string) => {
    setSearchMode('smart');
    
    // For city searches without state, try to proceed but don't apply location filtering
    if ((city || zipCode) && !state) {
      toast({
        variant: "destructive",
        title: "State required",
        description: "Please select a U.S. state to refine your location search."
      });
      return;
    }

    // Determine whether to apply location filtering
    const shouldApplyLocationFilter = (city || zipCode) && state;

    const searchParams = {
      searchText,
      city,
      state: state || "",
      zipCode,
      similarityThreshold: 0.3,
      limit: 50,
      // Only apply user location filtering if we have both coordinates AND location search
      ...(shouldApplyLocationFilter && latitude && longitude && {
        userLatitude: latitude,
        userLongitude: longitude,
        radius: radius
      })
    };
    
    console.log('Smart search params:', searchParams);
    performSmartSearch(searchParams);
    
    // Update URL with all params
    const params = new URLSearchParams();
    if (searchText) params.set('q', searchText);
    if (city) params.set('city', city);
    if (state) params.set('state', state);
    if (zipCode) params.set('zip', zipCode);
    navigate(`/search?${params.toString()}`, { replace: true });
  };

  const handleLocationSearch = (latitude: number, longitude: number) => {
    setLocationSearch({ lat: latitude, lng: longitude });
    setSearchQuery('');
    setSearchMode('category');
    clearSmartSearch();
    navigate('/search', { replace: true });
  };

  const handleCategorySelect = (categoryId: string, storeTypes?: string[], namePatterns?: string[]) => {
    setSearchMode('category');
    clearSmartSearch();
    handleCategoryChange(categoryId, storeTypes, namePatterns);
  };

  const handleBackToCategories = () => {
    setSearchMode('category');
    clearSmartSearch();
    navigate('/search', { replace: true });
  };

  // Use the correct types for the current stores and loading states
  const currentStores: StoreWithDistance[] = searchMode === 'smart' ? (smartResults || []) : (stores || []);
  const isLoading = searchMode === 'smart' ? smartLoading : (categoryLoading || locationLoading);
  const error = searchMode === 'smart' ? smartError : categoryError;

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <SearchHeader
        searchQuery={searchQuery}
        onSearch={handleSearch}
        onLocationSearch={handleLocationSearch}
        onSmartSearch={handleSmartSearch}
      />

      {/* Smart Search Results */}
      {searchMode === 'smart' && (
        <SmartSearchResults
          stores={currentStores}
          isLoading={isLoading}
          error={error}
          searchParams={searchParams}
          onBackToCategories={handleBackToCategories}
        />
      )}

      {/* Category Search Results */}
      {searchMode === 'category' && (
        <CategorySearchResults
          stores={currentStores}
          isLoading={isLoading}
          error={error}
          locationSearch={locationSearch}
          activeCategory={activeCategory}
          selectedStoreTypes={selectedStoreTypes}
          sortBy={sortBy}
          onSortChange={setSortBy}
          radius={radius}
          onRadiusChange={setRadius}
          onCategoryChange={handleCategorySelect}
        />
      )}
    </div>
  );
};
