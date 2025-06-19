
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, MapPin, X } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
    <div className="w-full max-w-md mx-auto space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            type="text"
            placeholder="Enter ZIP code (e.g., 90210)"
            value={zipInput}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            className="pr-10"
            maxLength={5}
          />
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
        <Button 
          onClick={handleSearch}
          disabled={!validateZipCode(zipInput)}
          className="px-4"
        >
          Search
        </Button>
      </div>

      {isSearchActive && (
        <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-blue-800 dark:text-blue-200">
              Showing results for ZIP: {activeZip}
            </span>
          </div>
          <Button
            onClick={handleClear}
            variant="ghost"
            size="sm"
            className="text-blue-600 hover:text-blue-800"
          >
            <X className="h-4 w-4 mr-1" />
            Use My Location Instead
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
