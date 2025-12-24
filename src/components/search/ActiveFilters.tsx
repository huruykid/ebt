import React from 'react';
import { MapPin, Navigation, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { SearchParams } from '@/types/searchTypes';

interface ActiveFiltersProps {
  inputValue: string;
  locationValue: string;
  searchParams: SearchParams;
  onClearInput: () => void;
  onClearLocation: () => void;
  onClearCurrentLocation: () => void;
  onClearAll: () => void;
}

export const ActiveFilters: React.FC<ActiveFiltersProps> = ({
  inputValue,
  locationValue,
  searchParams,
  onClearInput,
  onClearLocation,
  onClearCurrentLocation,
  onClearAll
}) => {
  const hasQuery = inputValue.trim() || locationValue.trim() || searchParams.useCurrentLocation;
  
  if (!hasQuery) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {inputValue && (
        <Badge variant="secondary" className="flex items-center gap-1">
          Search: {inputValue}
          <button onClick={onClearInput} aria-label="Clear search">
            <X className="h-3 w-3" />
          </button>
        </Badge>
      )}
      {locationValue && (
        <Badge variant="secondary" className="flex items-center gap-1">
          <MapPin className="h-3 w-3" />
          {locationValue}
          <button onClick={onClearLocation} aria-label="Clear location">
            <X className="h-3 w-3" />
          </button>
        </Badge>
      )}
      {searchParams.useCurrentLocation && (
        <Badge variant="secondary" className="flex items-center gap-1">
          <Navigation className="h-3 w-3" />
          Current Location
          <button onClick={onClearCurrentLocation} aria-label="Clear current location">
            <X className="h-3 w-3" />
          </button>
        </Badge>
      )}
      <Button variant="ghost" size="sm" onClick={onClearAll}>
        Clear All
      </Button>
    </div>
  );
};
