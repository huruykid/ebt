
import React, { useState } from 'react';
import { Search, MapPin, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface SmartSearchBarProps {
  onSearch: (searchText: string, city?: string, zipCode?: string) => void;
  onClear?: () => void;
  placeholder?: string;
  className?: string;
  initialSearchText?: string;
  initialCity?: string;
  initialZip?: string;
}

const popularStoreTypes = [
  'Domino\'s', 'McDonald\'s', 'Walmart', 'Target', 'Subway', 'Pizza Hut',
  'Bakery', 'Corner Store', 'Dollar Store', 'Grocery Store', 'Taco Bell'
];

const popularLocations = [
  'Los Angeles', 'New York', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia',
  'San Antonio', 'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville',
  'Fresno', 'Sacramento', 'Oakland', 'Long Beach'
];

export const SmartSearchBar: React.FC<SmartSearchBarProps> = ({
  onSearch,
  onClear,
  className = "",
  initialSearchText = "",
  initialCity = "",
  initialZip = ""
}) => {
  const [storeQuery, setStoreQuery] = useState(initialSearchText);
  const [locationQuery, setLocationQuery] = useState(initialCity || initialZip);
  const [showStoreSuggestions, setShowStoreSuggestions] = useState(false);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Parse location to determine if it's a city or zip code
    const isZipCode = /^\d{5}(-\d{4})?$/.test(locationQuery.trim());
    const city = isZipCode ? undefined : locationQuery.trim() || undefined;
    const zipCode = isZipCode ? locationQuery.trim() : undefined;
    
    onSearch(storeQuery.trim(), city, zipCode);
    setShowStoreSuggestions(false);
    setShowLocationSuggestions(false);
  };

  const handleClear = () => {
    setStoreQuery('');
    setLocationQuery('');
    setShowStoreSuggestions(false);
    setShowLocationSuggestions(false);
    onClear?.();
  };

  const handleStoreSuggestionClick = (suggestion: string) => {
    setStoreQuery(suggestion);
    setShowStoreSuggestions(false);
  };

  const handleLocationSuggestionClick = (suggestion: string) => {
    setLocationQuery(suggestion);
    setShowLocationSuggestions(false);
  };

  const filteredStoreTypes = popularStoreTypes.filter(type =>
    storeQuery && type.toLowerCase().includes(storeQuery.toLowerCase())
  ).slice(0, 5);

  const filteredLocations = popularLocations.filter(location =>
    locationQuery && location.toLowerCase().includes(locationQuery.toLowerCase())
  ).slice(0, 5);

  const hasContent = storeQuery.trim() || locationQuery.trim();

  return (
    <div className={`space-y-4 ${className}`}>
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Two-field search layout */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Store/Category Field */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
            <Input
              type="text"
              value={storeQuery}
              onChange={(e) => {
                setStoreQuery(e.target.value);
                setShowStoreSuggestions(e.target.value.length > 0);
              }}
              onFocus={() => setShowStoreSuggestions(storeQuery.length > 0)}
              onBlur={() => setTimeout(() => setShowStoreSuggestions(false), 200)}
              placeholder="Domino's, Bakery, Corner Store..."
              className="pl-10 pr-4"
            />
            
            {/* Store suggestions dropdown */}
            {showStoreSuggestions && filteredStoreTypes.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-input rounded-md shadow-lg z-50 max-h-40 overflow-y-auto">
                {filteredStoreTypes.map((type, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleStoreSuggestionClick(type)}
                    className="w-full text-left px-3 py-2 hover:bg-muted text-sm border-b border-muted last:border-0"
                  >
                    {type}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Location Field */}
          <div className="relative flex-1">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
            <Input
              type="text"
              value={locationQuery}
              onChange={(e) => {
                setLocationQuery(e.target.value);
                setShowLocationSuggestions(e.target.value.length > 0);
              }}
              onFocus={() => setShowLocationSuggestions(locationQuery.length > 0)}
              onBlur={() => setTimeout(() => setShowLocationSuggestions(false), 200)}
              placeholder="Fresno or 90015"
              className="pl-10 pr-4"
            />
            
            {/* Location suggestions dropdown */}
            {showLocationSuggestions && filteredLocations.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-input rounded-md shadow-lg z-50 max-h-40 overflow-y-auto">
                {filteredLocations.map((location, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleLocationSuggestionClick(location)}
                    className="w-full text-left px-3 py-2 hover:bg-muted text-sm border-b border-muted last:border-0"
                  >
                    {location}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 sm:w-auto w-full">
            {hasContent && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleClear}
                className="shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            
            <Button type="submit" className="sm:w-auto w-full">
              Search
            </Button>
          </div>
        </div>

        {/* Example searches as pills */}
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground text-center">Try these examples:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              type="button"
              onClick={() => {
                setStoreQuery('domino');
                setLocationQuery('fresno');
              }}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-muted hover:bg-muted/80 rounded-full transition-colors"
            >
              domino fresno
            </button>
            <button
              type="button"
              onClick={() => {
                setStoreQuery('chickn');
                setLocationQuery('90015');
              }}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-muted hover:bg-muted/80 rounded-full transition-colors"
            >
              chickn 90015
            </button>
            <button
              type="button"
              onClick={() => {
                setStoreQuery('tacc bell');
                setLocationQuery('');
              }}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-muted hover:bg-muted/80 rounded-full transition-colors"
            >
              tacc bell
            </button>
            <button
              type="button"
              onClick={() => {
                setStoreQuery('bakery');
                setLocationQuery('los angeles');
              }}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-muted hover:bg-muted/80 rounded-full transition-colors"
            >
              bakery los angeles
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
