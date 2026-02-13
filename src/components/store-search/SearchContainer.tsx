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
    <div className="container mx-auto px-4 py-4 md:py-6 max-w-2xl animate-fade-in">
      {/* Search Form */}
      <div className="space-y-3 mb-4">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
          <Input
            type="text"
            placeholder="Search for stores like 'Walmart' or 'Pizza'..."
            value={storeNameInput}
            onChange={(e) => setStoreNameInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full h-11 pl-10 text-sm transition-shadow focus:shadow-md"
          />
        </div>

        <div className="flex gap-2 items-center">
          <div className="relative flex-1 group">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
            <Input
              type="text"
              placeholder="City, State or ZIP code"
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full h-11 pl-10 text-sm transition-shadow focus:shadow-md"
            />
          </div>
          {latitude && longitude && (
            <Button 
              onClick={handleUseCurrentLocation} 
              variant="outline" 
              disabled={geoLoading} 
              size="sm"
              className="h-11 px-3 shrink-0 text-xs"
            >
              <Navigation className="h-3.5 w-3.5 mr-1.5" />
              <span className="hidden sm:inline">Use My Location</span>
              <span className="sm:hidden">GPS</span>
            </Button>
          )}
        </div>

        <Button 
          onClick={handleBothFieldsSearch} 
          disabled={isSearchDisabled}
          className="w-full h-10 text-sm font-medium transition-all active:scale-[0.98]"
        >
          Search Stores
        </Button>
      </div>

      {/* Category Tabs */}
      <div className="mb-4" style={{ animationDelay: '0.1s', animationFillMode: 'both' }} >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Categories</span>
          <OpenNowFilter 
            isEnabled={openNowFilter} 
            onToggle={setOpenNowFilter} 
          />
        </div>
        <CategoryTabs onCategoryChange={handleCategoryChange} />
      </div>

      {locationSearch && (
        <div className="text-xs text-muted-foreground flex items-center gap-1 mb-3 animate-fade-in">
          <MapPin className="h-3 w-3" />
          <span>
            {showingInitialLocation && initialCity 
              ? `Showing stores near ${initialCity}`
              : 'Near your location'
            }
          </span>
          {userZipCode && <span>({userZipCode})</span>}
        </div>
      )}

      {searchQuery && !locationSearch && (
        <div className="text-xs text-muted-foreground mb-3">
          Results for "{searchQuery}"
        </div>
      )}

      <div>
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
