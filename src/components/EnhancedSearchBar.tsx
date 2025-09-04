import React, { useState, useRef, useEffect } from 'react';
import { Search, MapPin, Clock, X, Navigation } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useEnhancedSearch } from '@/hooks/useEnhancedSearch';
import { cn } from '@/lib/utils';

interface EnhancedSearchBarProps {
  className?: string;
  placeholder?: string;
  onResultsChange?: (results: any[]) => void;
  compact?: boolean;
}

export const EnhancedSearchBar: React.FC<EnhancedSearchBarProps> = ({
  className,
  placeholder = "Search for stores like 'Walmart' or 'Pizza'...",
  onResultsChange,
  compact = false
}) => {
  const {
    searchParams,
    searchResults,
    isLoading,
    suggestions,
    showSuggestions,
    searchHistory,
    updateSearchParams,
    clearSearch,
    clearHistory,
    setShowSuggestions,
    hasCurrentLocation
  } = useEnhancedSearch();

  const [inputValue, setInputValue] = useState(searchParams.query);
  const [locationValue, setLocationValue] = useState(searchParams.location || '');
  const [showLocationInput, setShowLocationInput] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputValue !== searchParams.query) {
        updateSearchParams({ query: inputValue });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [inputValue, searchParams.query, updateSearchParams]);

  // Location search debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (locationValue !== searchParams.location) {
        updateSearchParams({ location: locationValue });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [locationValue, searchParams.location, updateSearchParams]);

  // Pass results to parent component
  useEffect(() => {
    onResultsChange?.(searchResults);
  }, [searchResults, onResultsChange]);

  // Handle clicks outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setShowSuggestions]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setShowSuggestions(true);
  };

  const handleSuggestionClick = (suggestion: any) => {
    if (suggestion.type === 'location') {
      setLocationValue(suggestion.value);
      updateSearchParams({ location: suggestion.value });
    } else {
      setInputValue(suggestion.value);
      updateSearchParams({ query: suggestion.value });
    }
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

  const hasQuery = inputValue.trim() || locationValue.trim() || searchParams.useCurrentLocation;

  if (compact) {
    return (
      <div ref={containerRef} className={cn("relative w-full", className)}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={handleInputChange}
            onFocus={() => setShowSuggestions(true)}
            placeholder={placeholder}
            className="pl-10 pr-10 h-12 text-base rounded-xl border-2 border-primary/20 focus:border-primary/40"
          />
          {hasQuery && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && (suggestions.length > 0 || searchHistory.length > 0) && (
          <Card className="absolute top-full left-0 right-0 mt-1 z-50 max-h-80 overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full text-left px-4 py-3 hover:bg-muted/50 border-b border-muted/20 last:border-0 flex items-center gap-3"
              >
                <span className="text-lg">{suggestion.icon}</span>
                <div>
                  <div className="font-medium">{suggestion.value}</div>
                  {suggestion.subtitle && (
                    <div className="text-sm text-muted-foreground">{suggestion.subtitle}</div>
                  )}
                </div>
              </button>
            ))}
          </Card>
        )}
      </div>
    );
  }

  return (
    <Card ref={containerRef} className={cn("p-6 space-y-4 border-2 border-primary/20", className)}>
      <div className="space-y-4">
        {/* Main Search Input */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={handleInputChange}
            onFocus={() => setShowSuggestions(true)}
            placeholder={placeholder}
            className="pl-12 pr-12 h-14 text-base rounded-xl border-2 border-primary/20 focus:border-primary/40"
          />
          {isLoading && (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent"></div>
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
              <Button
                variant="outline"
                onClick={() => setShowLocationInput(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Active Filters */}
        {hasQuery && (
          <div className="flex items-center gap-2 flex-wrap">
            {inputValue && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Search: {inputValue}
                <button onClick={() => setInputValue('')}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {locationValue && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {locationValue}
                <button onClick={() => setLocationValue('')}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {searchParams.useCurrentLocation && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Navigation className="h-3 w-3" />
                Current Location
                <button onClick={() => updateSearchParams({ useCurrentLocation: false })}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {hasQuery && (
              <Button variant="ghost" size="sm" onClick={handleClear}>
                Clear All
              </Button>
            )}
          </div>
        )}

        {/* Search Results Count */}
        {searchResults.length > 0 && (
          <div className="text-sm text-muted-foreground">
            Found {searchResults.length} store{searchResults.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && (suggestions.length > 0 || searchHistory.length > 0) && (
        <Card className="border-t border-muted/20 mt-4 -mx-6 -mb-6 rounded-t-none">
          <div className="p-4">
            {searchHistory.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    Recent Searches
                  </div>
                  <Button variant="ghost" size="sm" onClick={clearHistory}>
                    Clear
                  </Button>
                </div>
                <div className="space-y-1">
                  {searchHistory.slice(0, 3).map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleSuggestionClick({ type: 'recent', value: item.query })}
                      className="w-full text-left px-3 py-2 hover:bg-muted/50 rounded-lg flex items-center gap-3"
                    >
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{item.query}</div>
                        {item.location && (
                          <div className="text-sm text-muted-foreground">in {item.location}</div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {suggestions.length > 0 && (
              <div className="space-y-1">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full text-left px-3 py-2 hover:bg-muted/50 rounded-lg flex items-center gap-3"
                  >
                    <span className="text-lg">{suggestion.icon}</span>
                    <div>
                      <div className="font-medium">{suggestion.value}</div>
                      {suggestion.subtitle && (
                        <div className="text-sm text-muted-foreground">{suggestion.subtitle}</div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}
    </Card>
  );
};