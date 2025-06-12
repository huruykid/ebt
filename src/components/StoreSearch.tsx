
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CategoryTabs } from './CategoryTabs';
import { SearchHeader } from './store-search/SearchHeader';
import { SearchResults } from './store-search/SearchResults';
import { useStoreSearch } from '@/hooks/useStoreSearch';

export const StoreSearch: React.FC = () => {
  const navigate = useNavigate();
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
    isLoading,
    error,
    handleCategoryChange,
  } = useStoreSearch();

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setLocationSearch(null); // Clear location search when doing text search
    // Update URL to reflect the new search
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`, { replace: true });
    } else {
      navigate('/search', { replace: true });
    }
  };

  const handleLocationSearch = (latitude: number, longitude: number) => {
    setLocationSearch({ lat: latitude, lng: longitude });
    setSearchQuery(''); // Clear text search when doing location search
    navigate('/search', { replace: true });
  };

  return (
    <div className="min-h-screen">
      <div className="w-full max-w-4xl mx-auto p-4">
        <SearchHeader
          searchQuery={searchQuery}
          onSearch={handleSearch}
          onLocationSearch={handleLocationSearch}
        />

        {/* Enhanced Category Tabs */}
        <div className="mb-8">
          <div className="card-gradient rounded-spotify-xl p-4 border-2 border-accent/20">
            <CategoryTabs 
              onCategoryChange={handleCategoryChange}
            />
          </div>
        </div>

        <SearchResults
          stores={stores}
          isLoading={isLoading}
          error={error}
          locationSearch={locationSearch}
          activeCategory={activeCategory}
          selectedStoreTypes={selectedStoreTypes}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />
      </div>
    </div>
  );
};
