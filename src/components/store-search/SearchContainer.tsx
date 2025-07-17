
import React from 'react';
import { CategorySearchResults } from '@/components/store-search/CategorySearchResults';
import { useLocationBasedSearch } from '@/hooks/useLocationBasedSearch';
import { useGeolocation } from '@/hooks/useGeolocation';
import { MapPin, Search, Navigation } from 'lucide-react';
import { sanitizeString, isValidZipCode } from '@/utils/security';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LocationSelector } from '@/components/LocationSelector';

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
    userZipCode,
    selectedCity,
    selectedState,
    handleLocationSelect,
    clearLocationSelection
  } = useLocationBasedSearch();

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

  const [storeNameInput, setStoreNameInput] = React.useState(searchQuery);

  const handleStoreNameSearch = () => {
    const sanitizedQuery = sanitizeString(storeNameInput);
    setSearchQuery(sanitizedQuery);
  };

  const handleBothFieldsSearch = () => {
    const sanitizedStoreName = sanitizeString(storeNameInput);
    
    if (sanitizedStoreName && selectedCity && selectedState) {
      // Use smart_store_search with city and state
      setSearchQuery(sanitizedStoreName);
      setLocationSearch(null);
    } else if (sanitizedStoreName) {
      // Store name only
      setSearchQuery(sanitizedStoreName);
      setLocationSearch(null);
    } else if (selectedCity && selectedState) {
      // City and state only
      setSearchQuery('');
      setLocationSearch(null);
    }
  };

  const handleUseCurrentLocation = () => {
    if (latitude && longitude) {
      setLocationSearch({ lat: latitude, lng: longitude });
      // Clear the location selector when using current location
      clearLocationSelection();
      
      // If we have a store name, keep it for smart search (name + location)
      if (storeNameInput.trim()) {
        const sanitizedStoreName = sanitizeString(storeNameInput);
        setSearchQuery(sanitizedStoreName);
      } else {
        // Clear search query to use pure location search
        setSearchQuery('');
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* UPDATED: Two-Field Search Interface */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Find SNAP/EBT Stores</h1>
        <p className="text-muted-foreground">
          Search by store name and location to find stores that accept EBT/SNAP benefits
        </p>
        {/* Force React to re-render */}
        <div className="hidden" data-version="v2.0"></div>
      </div>

      {/* NEW: Two-Field Search Form */}
      <Card className="p-6 mb-6 bg-gradient-to-r from-primary/5 to-secondary/5 border-2 border-primary/20">
        <div className="space-y-4">
          {/* Store Name Field */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-foreground">Store Name (Optional)</label>
            <Input
              type="text"
              placeholder="e.g., Walmart, McDonald's, Target..."
              value={storeNameInput}
              onChange={(e) => setStoreNameInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleBothFieldsSearch()}
              className="w-full h-12 text-base"
            />
          </div>

          {/* Location Field */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-foreground">Location</label>
            <div className="flex gap-3 items-center">
              <LocationSelector
                onLocationSelect={handleLocationSelect}
                selectedCity={selectedCity}
                selectedState={selectedState}
                className="flex-1"
              />
              {latitude && longitude && (
                <Button onClick={handleUseCurrentLocation} variant="outline" disabled={geoLoading} className="h-12 px-4">
                  <Navigation className="h-4 w-4 mr-2" />
                  Use My Location
                </Button>
              )}
            </div>
          </div>

          {/* Search Button */}
          <Button 
            onClick={handleBothFieldsSearch} 
            disabled={!storeNameInput.trim() && !selectedCity && !selectedState && !locationSearch}
            className="w-full h-12 text-base font-semibold"
            size="lg"
          >
            <Search className="h-5 w-5 mr-2" />
            Search Stores
          </Button>
        </div>
      </Card>

      {/* Location Display */}
      {locationSearch && (
        <div className="mt-4 text-sm text-muted-foreground flex items-center gap-1">
          <MapPin className="h-4 w-4" />
          <span>
            Results near your current location
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
