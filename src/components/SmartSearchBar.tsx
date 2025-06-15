import React, { useState } from 'react';
import { Search, MapPin, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { StoreQueryInput } from './StoreQueryInput';
import { LocationQueryInput } from './LocationQueryInput';
import { SmartSearchPills } from './SmartSearchPills';

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

  const filteredStoreTypes = popularStoreTypes.filter(type =>
    storeQuery && type.toLowerCase().includes(storeQuery.toLowerCase())
  ).slice(0, 5);

  const filteredLocations = popularLocations.filter(location =>
    locationQuery && location.toLowerCase().includes(locationQuery.toLowerCase())
  ).slice(0, 5);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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

  const hasContent = storeQuery.trim() || locationQuery.trim();

  return (
    <div className={`space-y-4 ${className}`}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <StoreQueryInput
            value={storeQuery}
            onChange={setStoreQuery}
            onSuggestionClick={(s) => { setStoreQuery(s); setShowStoreSuggestions(false); }}
            suggestions={filteredStoreTypes}
            showSuggestions={showStoreSuggestions}
            setShowSuggestions={setShowStoreSuggestions}
          />
          <LocationQueryInput
            value={locationQuery}
            onChange={setLocationQuery}
            onSuggestionClick={(s) => { setLocationQuery(s); setShowLocationSuggestions(false); }}
            suggestions={filteredLocations}
            showSuggestions={showLocationSuggestions}
            setShowSuggestions={setShowLocationSuggestions}
          />
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
        <SmartSearchPills setStoreQuery={setStoreQuery} setLocationQuery={setLocationQuery} />
      </form>
    </div>
  );
};
