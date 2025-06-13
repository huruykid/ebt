
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CategoryTabs } from './CategoryTabs';
import { SearchHeader } from './store-search/SearchHeader';
import { SearchResults } from './store-search/SearchResults';
import { StoreCard } from './StoreCard';
import { LoadingSpinner } from './LoadingSpinner';
import { useStoreSearch } from '@/hooks/useStoreSearch';
import { useSmartSearch } from '@/hooks/useSmartSearch';
import { useGeolocation } from '@/hooks/useGeolocation';

export const StoreSearch: React.FC = () => {
  const navigate = useNavigate();
  const { latitude, longitude, loading: locationLoading } = useGeolocation();
  const [searchMode, setSearchMode] = useState<'category' | 'smart'>('category');
  
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

  const handleSmartSearch = (searchText: string, city?: string, zipCode?: string) => {
    setSearchMode('smart');
    performSmartSearch({
      searchText,
      city,
      zipCode,
      similarityThreshold: 0.3,
      limit: 50
    });
    
    // Update URL to reflect the search
    const params = new URLSearchParams();
    if (searchText) params.set('q', searchText);
    if (city) params.set('city', city);
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

  const currentStores = searchMode === 'smart' ? smartResults : stores;
  const isLoading = searchMode === 'smart' ? smartLoading : (categoryLoading || locationLoading);
  const error = searchMode === 'smart' ? smartError : categoryError;

  return (
    <div className="min-h-screen">
      <div className="w-full max-w-4xl mx-auto p-4">
        <SearchHeader
          searchQuery={searchQuery}
          onSearch={handleSearch}
          onLocationSearch={handleLocationSearch}
          onSmartSearch={handleSmartSearch}
        />

        {/* Enhanced Category Tabs - only show when not in smart search mode */}
        {searchMode === 'category' && (
          <div className="mb-8">
            <div className="card-gradient rounded-spotify-xl p-4 border-2 border-accent/20">
              <CategoryTabs 
                onCategoryChange={handleCategorySelect}
              />
            </div>
          </div>
        )}

        {/* Smart Search Results */}
        {searchMode === 'smart' && (
          <div className="space-y-6">
            {isLoading && (
              <div className="flex justify-center py-8">
                <LoadingSpinner />
              </div>
            )}

            {error && (
              <div className="text-center py-8">
                <div className="card-gradient rounded-spotify-xl p-6 border-2 border-destructive/20">
                  <p className="text-destructive font-semibold">⚠️ Error loading stores. Please try again.</p>
                </div>
              </div>
            )}

            {!isLoading && !error && smartResults && smartResults.length === 0 && (
              <div className="text-center py-8">
                <div className="card-gradient rounded-spotify-xl p-8 border-2 border-muted/20">
                  <div className="text-6xl mb-4">🔍</div>
                  <p className="text-muted-foreground text-lg">
                    No stores found for "{searchParams.searchText}"
                    {searchParams.city && ` in ${searchParams.city}`}
                    {searchParams.zipCode && ` (${searchParams.zipCode})`}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Try adjusting your search terms or location filters
                  </p>
                </div>
              </div>
            )}

            {!isLoading && smartResults && smartResults.length > 0 && (
              <div className="space-y-6">
                <div className="card-gradient rounded-spotify-lg p-4 border-2 border-success/20">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Found {smartResults.length} stores
                      {searchParams.city && ` in ${searchParams.city}`}
                      {searchParams.zipCode && ` (${searchParams.zipCode})`}
                    </p>
                    <button
                      onClick={() => {
                        setSearchMode('category');
                        clearSmartSearch();
                        navigate('/search', { replace: true });
                      }}
                      className="text-sm text-primary hover:underline"
                    >
                      Back to categories
                    </button>
                  </div>
                </div>
                
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1">
                  {smartResults.map((store) => (
                    <StoreCard 
                      key={store.id}
                      store={{
                        id: store.id,
                        Store_Name: store.store_name,
                        Store_Street_Address: store.store_street_address,
                        City: store.city,
                        State: store.state,
                        Zip_Code: store.zip_code,
                        Store_Type: store.store_type,
                        Latitude: store.latitude,
                        Longitude: store.longitude,
                        // Map other required fields with defaults
                        Additional_Address: null,
                        Zip4: null,
                        County: null,
                        Record_ID: null,
                        ObjectId: null,
                        Grantee_Name: null,
                        X: null,
                        Y: null,
                        Incentive_Program: null
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Category Search Results */}
        {searchMode === 'category' && (
          <SearchResults
            stores={currentStores}
            isLoading={isLoading}
            error={error}
            locationSearch={locationSearch}
            activeCategory={activeCategory}
            selectedStoreTypes={selectedStoreTypes}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />
        )}
      </div>
    </div>
  );
};
