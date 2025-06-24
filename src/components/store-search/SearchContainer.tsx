
import React from 'react';
import { SearchBar } from '@/components/SearchBar';
import { SearchResults } from '@/components/store-search/SearchResults';
import { StoreFilters } from '@/components/StoreFilters';
import { useStoreSearch } from '@/hooks/useStoreSearch';
import { useGeolocation } from '@/hooks/useGeolocation';
import { MapPin } from 'lucide-react';

interface SearchFilters {
  storeType: string;
  incentiveProgram: string;
  hasCoordinates: boolean;
}

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

  // State for additional filters
  const [filters, setFilters] = React.useState<SearchFilters>({
    storeType: '',
    incentiveProgram: '',
    hasCoordinates: false
  });

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

  const handleSearch = (query: string) => {
    console.log('SearchContainer: handleSearch called with:', query);
    setSearchQuery(query);
    
    // Check if the query looks like a zip code (5 digits)
    const zipRegex = /^\d{5}$/;
    if (zipRegex.test(query.trim())) {
      console.log('SearchContainer: Detected zip code search:', query);
      // For zip code searches, clear location search to force text-based search
      setLocationSearch(null);
    }
  };

  const handleLocationSearch = (lat: number, lng: number) => {
    console.log('SearchContainer: handleLocationSearch called with:', lat, lng);
    setLocationSearch({ lat, lng });
    // Clear the text search query when using location search
    setSearchQuery('');
  };

  const handleFiltersChange = (newFilters: SearchFilters) => {
    setFilters(newFilters);
  };

  // Apply additional filters to the stores
  const filteredStores = React.useMemo(() => {
    let filtered = [...stores];

    // Filter by store type
    if (filters.storeType) {
      filtered = filtered.filter(store => 
        store.Store_Type?.toLowerCase().includes(filters.storeType.toLowerCase())
      );
    }

    // Filter by incentive program
    if (filters.incentiveProgram) {
      filtered = filtered.filter(store => 
        store.Incentive_Program?.toLowerCase().includes(filters.incentiveProgram.toLowerCase())
      );
    }

    // Filter by coordinates availability
    if (filters.hasCoordinates) {
      filtered = filtered.filter(store => 
        store.Latitude && store.Longitude
      );
    }

    return filtered;
  }, [stores, filters]);

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

      {/* Store Filters */}
      <div className="mt-6">
        <StoreFilters 
          filters={filters}
          onFiltersChange={handleFiltersChange}
        />
      </div>

      {/* Search Results */}
      <SearchResults
        stores={filteredStores}
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
