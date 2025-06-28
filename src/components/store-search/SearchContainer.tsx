
import React from 'react';
import { SearchBar } from '@/components/SearchBar';
import { CategorySearchResults } from '@/components/store-search/CategorySearchResults';
import { useStoreSearch } from '@/hooks/useStoreSearch';
import { useGeolocation } from '@/hooks/useGeolocation';
import { MapPin } from 'lucide-react';
import { sanitizeString, isValidZipCode } from '@/utils/security';

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
      const sanitizedCity = sanitizeString(initialCity);
      setSearchQuery(sanitizedCity);
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

  const handleSearch = (query: string) => {
    console.log('SearchContainer: handleSearch called with:', query);
    
    // Sanitize the input query
    const sanitizedQuery = sanitizeString(query);
    setSearchQuery(sanitizedQuery);
    
    // Check if the query looks like a zip code (5 digits)
    if (isValidZipCode(sanitizedQuery)) {
      console.log('SearchContainer: Detected zip code search:', sanitizedQuery);
      // For zip code searches, clear location search to force text-based search
      setLocationSearch(null);
    }
  };

  const handleLocationSearch = (lat: number, lng: number) => {
    console.log('SearchContainer: handleLocationSearch called with:', lat, lng);
    
    // Validate coordinates
    if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      setLocationSearch({ lat, lng });
      // Clear the text search query when using location search
      setSearchQuery('');
    } else {
      console.error('Invalid coordinates provided:', lat, lng);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search Bar */}
      <SearchBar
        onSearch={handleSearch}
        onLocationSearch={handleLocationSearch}
        placeholder="Search for stores, ZIP codes, or cities..."
        initialValue={searchQuery}
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

      {/* Search Query Display */}
      {searchQuery && !locationSearch && (
        <div className="mt-4 text-sm text-muted-foreground flex items-center gap-1">
          <span>
            Search results for: "{searchQuery}"
          </span>
        </div>
      )}

      {/* Category Search Results with Tabs */}
      <div className="mt-6">
        <CategorySearchResults
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
          onCategoryChange={handleCategoryChange}
        />
      </div>
    </div>
  );
};
