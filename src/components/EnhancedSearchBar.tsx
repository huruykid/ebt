import React, { useState, useRef, useEffect } from 'react';
import { Search, MapPin, X, Navigation } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useEnhancedSearch } from '@/hooks/useEnhancedSearch';
import { SearchSuggestionsDropdown, ActiveFilters } from '@/components/search';
import { SEARCH_DEFAULTS } from '@/constants/searchConstants';
import { cn } from '@/lib/utils';
import type { SearchSuggestion, SearchHistory } from '@/types/searchTypes';
import type { StoreWithDistance } from '@/types/storeTypes';

interface EnhancedSearchBarProps {
  className?: string;
  placeholder?: string;
  compact?: boolean;
  initialQuery?: string;
  initialLocation?: string;
  initialUseCurrentLocation?: boolean;
  onSearchChange?: (results: StoreWithDistance[], isLoading: boolean, hasSearched: boolean) => void;
}

export const EnhancedSearchBar: React.FC<EnhancedSearchBarProps> = ({
  className,
  placeholder = "Search for stores like 'Walmart' or 'Pizza'...",
  compact = false,
  initialQuery = '',
  initialLocation = '',
  initialUseCurrentLocation = false,
  onSearchChange
}) => {
  const {
    searchParams,
    searchResults,
    isLoading,
    hasSearched,
    suggestions,
    showSuggestions,
    searchHistory,
    updateSearchParams,
    clearSearch,
    clearHistory,
    setShowSuggestions,
    hasCurrentLocation
  } = useEnhancedSearch();

  const [inputValue, setInputValue] = useState(initialQuery || searchParams.query);
  const [locationValue, setLocationValue] = useState(initialLocation || searchParams.location || '');
  const [showLocationInput, setShowLocationInput] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync with external initial values when they change
  useEffect(() => {
    if (initialQuery && initialQuery !== inputValue) {
      setInputValue(initialQuery);
      updateSearchParams({ query: initialQuery });
    }
  }, [initialQuery]);

  useEffect(() => {
    if (initialLocation && initialLocation !== locationValue) {
      setLocationValue(initialLocation);
      updateSearchParams({ location: initialLocation });
    }
  }, [initialLocation]);

  useEffect(() => {
    if (initialUseCurrentLocation) {
      updateSearchParams({ useCurrentLocation: true });
    }
  }, [initialUseCurrentLocation]);

  // Notify parent of search state changes (skip initial empty state)
  useEffect(() => {
    // Only notify parent if there's an active search or results
    if (hasSearched || searchResults.length > 0 || isLoading) {
      onSearchChange?.(searchResults, isLoading, hasSearched);
    }
  }, [searchResults, isLoading, hasSearched, onSearchChange]);

  // Track if a manual search was triggered - timestamp to prevent debounce from firing after
  const manualSearchTimeRef = useRef(0);

  // Debounced query update - only for auto-search as you type
  useEffect(() => {
    // Skip debounced update if a manual search happened within the debounce window
    const timeSinceManual = Date.now() - manualSearchTimeRef.current;
    if (timeSinceManual < SEARCH_DEFAULTS.DEBOUNCE_MS + 100) {
      return;
    }
    
    const timer = setTimeout(() => {
      // Only update if value actually changed and not during manual search
      if (inputValue !== searchParams.query && Date.now() - manualSearchTimeRef.current > SEARCH_DEFAULTS.DEBOUNCE_MS) {
        updateSearchParams({ query: inputValue });
      }
    }, SEARCH_DEFAULTS.DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [inputValue, searchParams.query, updateSearchParams]);

  // Debounced location update - only for auto-search as you type  
  useEffect(() => {
    // Skip debounced update if a manual search happened within the debounce window
    const timeSinceManual = Date.now() - manualSearchTimeRef.current;
    if (timeSinceManual < SEARCH_DEFAULTS.LOCATION_DEBOUNCE_MS + 100) {
      return;
    }
    
    const timer = setTimeout(() => {
      // Only update if value actually changed and not during manual search
      if (locationValue !== searchParams.location && Date.now() - manualSearchTimeRef.current > SEARCH_DEFAULTS.LOCATION_DEBOUNCE_MS) {
        updateSearchParams({ location: locationValue });
      }
    }, SEARCH_DEFAULTS.LOCATION_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [locationValue, searchParams.location, updateSearchParams]);

  // Close suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setShowSuggestions]);

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    if (suggestion.type === 'location') {
      setLocationValue(suggestion.value);
      updateSearchParams({ location: suggestion.value });
    } else {
      setInputValue(suggestion.value);
      updateSearchParams({ query: suggestion.value });
    }
    setShowSuggestions(false);
  };

  const handleHistoryClick = (item: SearchHistory) => {
    setInputValue(item.query);
    if (item.location) {
      setLocationValue(item.location);
    }
    updateSearchParams({ query: item.query, location: item.location });
    setShowSuggestions(false);
  };

  const handleCurrentLocation = () => {
    updateSearchParams({ useCurrentLocation: true, location: '' });
    setLocationValue('');
    setShowLocationInput(false);
  };

  const handleClear = () => {
    setInputValue('');
    setLocationValue('');
    clearSearch();
    setShowSuggestions(false);
    setShowLocationInput(false);
  };

  const handleSearch = () => {
    setShowSuggestions(false);
    // Record the time of manual search to prevent debounce effects from firing
    manualSearchTimeRef.current = Date.now();
    updateSearchParams({ 
      query: inputValue, 
      location: locationValue 
    });
  };

  const hasQuery = inputValue.trim() || locationValue.trim() || searchParams.useCurrentLocation;

  // Compact version for mobile/embedded use
  if (compact) {
    return (
      <div ref={containerRef} className={cn("relative w-full space-y-3", className)}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder={placeholder}
            className="pl-10 pr-10 h-12 text-base rounded-xl border-2 border-primary/20 focus:border-primary/40"
          />
          {hasQuery && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <Button 
          onClick={handleSearch} 
          className="w-full h-11"
          disabled={!hasQuery || isLoading}
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-background border-t-transparent mr-2" />
          ) : (
            <Search className="h-4 w-4 mr-2" />
          )}
          Search Stores
        </Button>

        {showSuggestions && (
          <SearchSuggestionsDropdown
            suggestions={suggestions}
            searchHistory={searchHistory}
            onSuggestionClick={handleSuggestionClick}
            onHistoryClick={handleHistoryClick}
            onClearHistory={clearHistory}
            compact
          />
        )}
      </div>
    );
  }

  // Full version
  return (
    <Card ref={containerRef} className={cn("p-6 space-y-4 border-2 border-primary/20", className)}>
      <div className="space-y-4">
        {/* Main Search Input */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            placeholder={placeholder}
            className="pl-12 pr-12 h-14 text-base rounded-xl border-2 border-primary/20 focus:border-primary/40"
          />
          {isLoading && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent" />
            </div>
          )}
        </div>

        {/* Location Controls */}
        <div className="flex gap-2">
          {!showLocationInput ? (
            <div className="flex gap-2 flex-wrap">
              <Button
                variant="outline"
                onClick={() => setShowLocationInput(true)}
                className="flex items-center gap-2"
              >
                <MapPin className="h-4 w-4" />
                Add Location
              </Button>
              {hasCurrentLocation && (
                <Button
                  variant="outline"
                  onClick={handleCurrentLocation}
                  className="flex items-center gap-2"
                >
                  <Navigation className="h-4 w-4" />
                  Use My Location
                </Button>
              )}
            </div>
          ) : (
            <div className="flex gap-2 flex-1">
              <Input
                value={locationValue}
                onChange={(e) => setLocationValue(e.target.value)}
                placeholder="City, State or ZIP code..."
                className="flex-1"
              />
              <Button variant="outline" onClick={() => setShowLocationInput(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Search Button */}
        <Button 
          onClick={handleSearch} 
          size="lg"
          className="w-full h-12 text-base font-semibold"
          disabled={!hasQuery || isLoading}
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-background border-t-transparent mr-2" />
          ) : (
            <Search className="h-5 w-5 mr-2" />
          )}
          Search Stores
        </Button>

        {/* Active Filters */}
        <ActiveFilters
          inputValue={inputValue}
          locationValue={locationValue}
          searchParams={searchParams}
          onClearInput={() => setInputValue('')}
          onClearLocation={() => setLocationValue('')}
          onClearCurrentLocation={() => updateSearchParams({ useCurrentLocation: false })}
          onClearAll={handleClear}
        />

        {/* Results Count */}
        {searchResults.length > 0 && (
          <div className="text-sm text-muted-foreground">
            Found {searchResults.length} store{searchResults.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && (
        <SearchSuggestionsDropdown
          suggestions={suggestions}
          searchHistory={searchHistory}
          onSuggestionClick={handleSuggestionClick}
          onHistoryClick={handleHistoryClick}
          onClearHistory={clearHistory}
        />
      )}
    </Card>
  );
};