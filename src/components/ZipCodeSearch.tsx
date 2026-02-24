import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, MapPin, X } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { trackZipCodeSearch } from '@/utils/analytics';

interface ZipCodeSearchProps {
  onZipSearch: (zipCode: string) => void;
  onClearSearch: () => void;
  isSearchActive: boolean;
  activeZip?: string;
  errorMessage?: string;
  noResultsMessage?: string;
}

export const ZipCodeSearch: React.FC<ZipCodeSearchProps> = ({
  onZipSearch,
  onClearSearch,
  isSearchActive,
  activeZip,
  errorMessage,
  noResultsMessage
}) => {
  const [zipInput, setZipInput] = useState('');

  const validateZipCode = (zip: string): boolean => {
    const zipRegex = /^\d{5}$/;
    return zipRegex.test(zip);
  };

  const handleSearch = () => {
    const trimmedZip = zipInput.trim();
    if (validateZipCode(trimmedZip)) {
      trackZipCodeSearch(trimmedZip);
      onZipSearch(trimmedZip);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 5);
    setZipInput(value);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleClear = () => {
    setZipInput('');
    onClearSearch();
  };

  return (
    <div className="w-full max-w-lg mx-auto space-y-3">
      <div className="flex shadow-md rounded-lg overflow-hidden border border-border">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            inputMode="numeric"
            placeholder="Enter ZIP code"
            value={zipInput}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            className="pl-12 pr-4 h-12 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm rounded-none"
            maxLength={5}
            aria-label="ZIP code"
          />
        </div>
        <Button 
          onClick={handleSearch}
          disabled={!validateZipCode(zipInput)}
          className="h-12 px-5 rounded-none text-sm font-semibold bg-primary hover:bg-primary/90 transition-all"
        >
          <Search className="h-5 w-5 mr-2" />
          Search
        </Button>
      </div>

      {isSearchActive && (
        <div className="flex items-center justify-between bg-primary/5 border border-primary/20 p-3 rounded-lg">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            <span className="text-sm text-foreground font-medium">
              Showing results for ZIP: {activeZip}
            </span>
          </div>
          <Button
            onClick={handleClear}
            variant="ghost"
            size="sm"
            className="text-primary hover:text-primary/80 hover:bg-primary/10"
          >
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        </div>
      )}

      {errorMessage && (
        <Alert variant="destructive">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {noResultsMessage && (
        <Alert>
          <AlertDescription>{noResultsMessage}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};
