
import React from 'react';
import { SearchBar } from '@/components/SearchBar';
import { SearchResults } from '@/components/store-search/SearchResults';
import { useStoreSearch } from '@/hooks/useStoreSearch';
import { useGeolocation } from '@/hooks/useGeolocation';
import { MapPin } from 'lucide-react';

interface SearchContainerProps {
  initialCity?: string;
}

export const SearchContainer: React.FC<SearchContainerProps> = ({ initialCity }) => {
  const {
    searchQuery,
    setSearchQuery,
    activeCategory,
    selectedStoreTypes,
    selectedNamePatterns,
    locationSearch,
    setLocationSearch,
    sortBy,
    setSortBy,
    radius,
    setRadius,
    stores,
    isLoading,
    error,
    handleCategoryChange,
    userZipCode
  } = useStoreSearch();

  const { latitude, longitude, error: geoError, loading: geoLoading } = useGeolocation();

  // If initialCity is provided, set it in the search query
  React.useEffect(() => {
    if (initialCity && !searchQuery) {
      setSearchQuery(initialCity);
    }
  }, [initialCity, searchQuery, setSearchQuery]);

  // Set location when geolocation data is available
  React.useEffect(() => {
    if (latitude && longitude) {
      setLocationSearch({ lat: latitude, lng: longitude });
    }
  }, [latitude, longitude, setLocationSearch]);

  const handleRadiusChange = (newRadius: number) => {
    setRadius(newRadius);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search Bar */}
      <SearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeCategory={activeCategory}
        selectedStoreTypes={selectedStoreTypes}
        selectedNamePatterns={selectedNamePatterns}
        onCategoryChange={handleCategoryChange}
      />

      {/* Location Display */}
      {locationSearch && (
        <div className="mt-4 text-sm text-muted-foreground flex items-center gap-1">
          <MapPin className="h-4 w-4" />
          <span>
            Results near you
          </span>
          {userZipCode && <span className="ml-1">({userZipCode})</span>}
        </div>
      )}

      {/* Search Results */}
      <SearchResults
        stores={stores}
        isLoading={isLoading}
        error={error}
        locationSearch={locationSearch}
        activeCategory={activeCategory}
        selectedStoreTypes={selectedStoreTypes}
        sortBy={sortBy}
        onSortChange={setSortBy}
        radius={radius}
        onRadiusChange={handleRadiusChange}
      />
    </div>
  );
};
