import React, { useState, useEffect, useCallback } from 'react';
import { CategorySearchResults } from '@/components/store-search/CategorySearchResults';
import { CategoryTabs } from '@/components/CategoryTabs';
import { OpenNowFilter } from '@/components/OpenNowFilter';
import { useLocationBasedSearch } from '@/hooks/useLocationBasedSearch';
import { useGeolocation } from '@/hooks/useGeolocation';
import { MapPin, Search, Navigation } from 'lucide-react';
import { sanitizeString } from '@/utils/security';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { isStoreOpen } from '@/utils/storeHoursUtils';

interface SearchContainerProps {
  initialCity?: string;
  initialLocation?: { lat: number; lng: number };
}

export const SearchContainer: React.FC<SearchContainerProps> = ({ initialCity, initialLocation }) => {
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
    isLoading,
    error,
    handleCategoryChange,
    userZipCode,
    setSelectedZip,
    handleLocationSelect,
    clearLocationSelection,
  } = useLocationBasedSearch();

  const { latitude, longitude, loading: geoLoading } = useGeolocation();
  
  // Track if we've auto-searched with initial location
  const [hasAutoSearched, setHasAutoSearched] = useState(false);
  const [storeNameInput, setStoreNameInput] = useState('');
  const [locationInput, setLocationInput] = useState('');
  const [openNowFilter, setOpenNowFilter] = useState(false);

  // If initialLocation is provided, set it immediately for auto-search
  useEffect(() => {
    if (initialLocation && !hasAutoSearched && !locationSearch) {
      setLocationSearch(initialLocation);
      setHasAutoSearched(true);
    }
  }, [initialLocation, hasAutoSearched, locationSearch, setLocationSearch]);

  // If initialCity is provided (without coordinates), set it in the search query
  useEffect(() => {
    if (initialCity && !searchQuery && !initialLocation) {
      const sanitizedCity = sanitizeString(initialCity);
      setSearchQuery(sanitizedCity);
    }
  }, [initialCity, searchQuery, setSearchQuery, initialLocation]);

  // Set location when geolocation data is available (only if no initial location)
  useEffect(() => {
    if (latitude && longitude && !initialLocation && !hasAutoSearched) {
      setLocationSearch({ lat: latitude, lng: longitude });
    }
  }, [latitude, longitude, setLocationSearch, initialLocation, hasAutoSearched]);

  const handleRadiusChange = useCallback((newRadius: number) => {
    setRadius(newRadius);
  }, [setRadius]);

  const geocode = useCallback(async (q: string): Promise<{ lat: number; lng: number } | null> => {
    try {
      const params = new URLSearchParams({
        q: q.trim(),
        format: 'json',
        addressdetails: '1',
        limit: '1',
        countrycodes: 'us',
        dedupe: '1',
      });
      const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`);
      if (!res.ok) return null;
      const data = await res.json();
      if (Array.isArray(data) && data[0]?.lat && data[0]?.lon) {
        return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
      }
      return null;
    } catch {
      return null;
    }
  }, []);

  const handleBothFieldsSearch = useCallback(async () => {
    const sanitizedStoreName = sanitizeString(storeNameInput);
    const sanitizedLocation = sanitizeString(locationInput);

    // Reset explicit filters
    setSelectedZip('');
    clearLocationSelection();

    // Parse ZIP or City, ST
    const zipMatch = sanitizedLocation.match(/^\d{5}$/);
    const cityStateMatch = sanitizedLocation.match(/^(.*?),\s*([A-Za-z]{2})$/);

    if (zipMatch) {
      const zip = zipMatch[0];
      const coords = await geocode(zip);
      if (coords) setLocationSearch(coords);
      setSelectedZip(zip);
      setSearchQuery(sanitizedStoreName);
      return;
    }

    if (cityStateMatch) {
      const city = cityStateMatch[1];
      const state = cityStateMatch[2];
      const coords = await geocode(`${city}, ${state}`);
      if (coords) setLocationSearch(coords);
      handleLocationSelect(city, state);
      setSearchQuery(sanitizedStoreName);
      return;
    }

    if (sanitizedLocation) {
      // Free-form location: attempt geocode
      const coords = await geocode(sanitizedLocation);
      if (coords) setLocationSearch(coords);
      setSearchQuery(sanitizedStoreName);
      return;
    }

    if (sanitizedStoreName) {
      // Name only: keep existing geolocation if available
      setSearchQuery(sanitizedStoreName);
    }
  }, [storeNameInput, locationInput, setSelectedZip, clearLocationSelection, geocode, setLocationSearch, setSearchQuery, handleLocationSelect]);

  const handleUseCurrentLocation = useCallback(() => {
    if (latitude && longitude) {
      setLocationSearch({ lat: latitude, lng: longitude });
      setLocationInput('');
      setSelectedZip('');
      clearLocationSelection();
      
      if (storeNameInput.trim()) {
        const sanitizedStoreName = sanitizeString(storeNameInput);
        setSearchQuery(sanitizedStoreName);
      } else {
        setSearchQuery('');
      }
    }
  }, [latitude, longitude, setLocationSearch, setSelectedZip, clearLocationSelection, storeNameInput, setSearchQuery]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBothFieldsSearch();
    }
  }, [handleBothFieldsSearch]);

  // Show location context when using initial location
  const showingInitialLocation = initialLocation && locationSearch && 
    locationSearch.lat === initialLocation.lat && 
    locationSearch.lng === initialLocation.lng;

  const isSearchDisabled = !storeNameInput.trim() && !locationInput.trim() && !locationSearch;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-2">Find SNAP/EBT Stores</h2>
        <p className="text-muted-foreground">
          Search by store name and location to find stores that accept EBT/SNAP benefits
        </p>
      </div>

      <Card className="p-6 mb-6 bg-gradient-to-r from-primary/5 to-secondary/5 border-2 border-primary/20">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2 text-foreground">
              Store Name (Optional)
            </label>
            <Input
              type="text"
              placeholder="e.g., Walmart, McDonald's, Target..."
              value={storeNameInput}
              onChange={(e) => setStoreNameInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full h-12 text-base"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-foreground">
              Location
            </label>
            <div className="flex gap-3 items-center flex-wrap sm:flex-nowrap">
              <Input
                type="text"
                placeholder="City, ST or ZIP (e.g., Fresno, CA or 90210)"
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 h-12 text-base min-w-0"
              />
              {latitude && longitude && (
                <Button 
                  onClick={handleUseCurrentLocation} 
                  variant="outline" 
                  disabled={geoLoading} 
                  className="h-12 px-4 shrink-0"
                >
                  <Navigation className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Use My Location</span>
                  <span className="sm:hidden">My Location</span>
                </Button>
              )}
            </div>
          </div>

          <Button 
            onClick={handleBothFieldsSearch} 
            disabled={isSearchDisabled}
            className="w-full h-12 text-base font-semibold"
            size="lg"
          >
            <Search className="h-5 w-5 mr-2" />
            Search Stores
          </Button>
        </div>
      </Card>

      {/* Category Tabs - always visible */}
      <div className="mt-4 mb-2">
        <div className="card-gradient rounded-xl p-3 border border-accent/20">
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-sm font-semibold text-foreground">Filter by Category</span>
            <OpenNowFilter 
              isEnabled={openNowFilter} 
              onToggle={setOpenNowFilter} 
            />
          </div>
          <CategoryTabs onCategoryChange={handleCategoryChange} />
        </div>
      </div>

      {locationSearch && (
        <div className="mt-4 text-sm text-muted-foreground flex items-center gap-1">
          <MapPin className="h-4 w-4" />
          <span>
            {showingInitialLocation && initialCity 
              ? `Showing stores near ${initialCity}`
              : 'Results near your current location'
            }
          </span>
          {userZipCode && <span className="ml-1">({userZipCode})</span>}
        </div>
      )}

      {searchQuery && !locationSearch && (
        <div className="mt-4 text-sm text-muted-foreground flex items-center gap-1">
          <span>Search results for: "{searchQuery}"</span>
        </div>
      )}

      <div className="mt-6">
        <CategorySearchResults
          stores={openNowFilter ? stores.filter(store => {
            const openingHours = (store as any).google_opening_hours;
            return isStoreOpen(openingHours) === true;
          }) : stores}
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
