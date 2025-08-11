
import React from 'react';
import { CategorySearchResults } from '@/components/store-search/CategorySearchResults';
import { useLocationBasedSearch } from '@/hooks/useLocationBasedSearch';
import { useGeolocation } from '@/hooks/useGeolocation';
import { MapPin, Search, Navigation } from 'lucide-react';
import { sanitizeString, isValidZipCode } from '@/utils/security';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';


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
    selectedZip,
    setSelectedZip,
    handleLocationSelect,
    clearLocationSelection,
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
  const [locationInput, setLocationInput] = React.useState('');

  const handleBothFieldsSearch = () => {
    const sanitizedStoreName = sanitizeString(storeNameInput);
    const sanitizedLocation = sanitizeString(locationInput);

    // Reset previous explicit location filters
    setSelectedZip('');
    clearLocationSelection();

    // Parse location: ZIP (5 digits) or "City, ST"
    const zipMatch = sanitizedLocation.match(/^\d{5}$/);
    const cityStateMatch = sanitizedLocation.match(/^(.*?),\s*([A-Za-z]{2})$/);

    if (zipMatch) {
      setSelectedZip(zipMatch[0]);
      setLocationSearch(null); // use RPC + ZIP, not geolocation
      setSearchQuery(sanitizedStoreName); // name-only goes to search_text
      return;
    }

    if (cityStateMatch) {
      const city = cityStateMatch[1];
      const state = cityStateMatch[2];
      handleLocationSelect(city, state);
      setLocationSearch(null); // use RPC + city/state
      setSearchQuery(sanitizedStoreName);
      return;
    }

    if (sanitizedStoreName) {
      // Name only
      setSearchQuery(sanitizedStoreName);
      setLocationSearch(null);
      return;
    }

    if (!sanitizedStoreName && !sanitizedLocation && !locationSearch) {
      // nothing to search
      return;
    }
  };

  const handleUseCurrentLocation = () => {
    if (latitude && longitude) {
      setLocationSearch({ lat: latitude, lng: longitude });
      setLocationInput(''); // Clear location input
      setSelectedZip('');
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
              <Input
                type="text"
                placeholder="City, ST or ZIP (e.g., Fresno, CA or 90210)"
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleBothFieldsSearch()}
                className="flex-1 h-12 text-base"
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
            disabled={!storeNameInput.trim() && !locationInput.trim() && !locationSearch}
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
