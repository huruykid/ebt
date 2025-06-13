
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

export const SmartSearchBar: React.FC<SmartSearchBarProps> = ({
  onSearch,
  onClear,
  placeholder = "Search stores (e.g., 'domino', 'chickn')",
  className = "",
  initialSearchText = "",
  initialCity = "",
  initialZip = ""
}) => {
  const [searchText, setSearchText] = useState(initialSearchText);
  const [city, setCity] = useState(initialCity);
  const [zipCode, setZipCode] = useState(initialZip);
  const [showLocationFilters, setShowLocationFilters] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchText.trim(), city.trim() || undefined, zipCode.trim() || undefined);
  };

  const handleClear = () => {
    setSearchText('');
    setCity('');
    setZipCode('');
    setShowLocationFilters(false);
    onClear?.();
  };

  const hasFilters = city.trim() || zipCode.trim();

  return (
    <div className={`space-y-3 ${className}`}>
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Main search bar */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder={placeholder}
              className="pl-10 pr-10"
            />
            {(searchText || hasFilters) && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setShowLocationFilters(!showLocationFilters)}
            className={showLocationFilters || hasFilters ? 'bg-primary/10 border-primary/50' : ''}
          >
            <MapPin className="h-4 w-4" />
          </Button>
          
          <Button type="submit">
            Search
          </Button>
        </div>

        {/* Location filters */}
        {showLocationFilters && (
          <div className="flex gap-2 p-3 bg-muted/50 rounded-lg">
            <Input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="City (e.g., Fresno)"
              className="flex-1"
            />
            <Input
              type="text"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              placeholder="Zip (e.g., 90015)"
              className="flex-1"
            />
          </div>
        )}

        {/* Active filters display */}
        {hasFilters && (
          <div className="flex gap-2 flex-wrap">
            {city && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/20 text-primary text-sm rounded-md">
                City: {city}
                <button
                  type="button"
                  onClick={() => setCity('')}
                  className="hover:bg-primary/30 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {zipCode && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/20 text-primary text-sm rounded-md">
                Zip: {zipCode}
                <button
                  type="button"
                  onClick={() => setZipCode('')}
                  className="hover:bg-primary/30 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
          </div>
        )}
      </form>
    </div>
  );
};
