import React from 'react';
import { SmartSearchBar } from '@/components/SmartSearchBar';
import { useGeolocation } from '@/hooks/useGeolocation';
import { Button } from '@/components/ui/button';
import { Navigation } from 'lucide-react';

interface SearchHeaderProps {
  searchQuery: string;
  onSearch: (query: string) => void;
  onLocationSearch: (latitude: number, longitude: number) => void;
  onSmartSearch?: (searchText: string, city?: string, zipCode?: string, state?: string) => void;
}

export const SearchHeader: React.FC<SearchHeaderProps> = ({
  searchQuery,
  onSearch,
  onLocationSearch,
  onSmartSearch
}) => {
  const { latitude, longitude, loading: locationLoading } = useGeolocation();

  const handleSmartSearch = (searchText: string, city?: string, zipCode?: string, state?: string) => {
    if (onSmartSearch) {
      onSmartSearch(searchText, city, zipCode, state);
    } else {
      onSearch(searchText);
    }
  };

  const handleLocationSearch = () => {
    if (latitude && longitude) {
      onLocationSearch(latitude, longitude);
    }
  };

  return (
    <div className="space-y-6">
      {/* 
        SearchHeader does not know the URL param for state.
        It's owned by SmartSearchBar via SmartSearchBar's initialState.
        We'll rely on SmartSearchBar to read initial state from URLparams.
      */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">Find SNAP/EBT Stores</h1>
        <p className="text-muted-foreground">
          Search by store name/type and location with fuzzy matching
        </p>
      </div>

      <div className="space-y-4">
        <SmartSearchBar
          onSearch={handleSmartSearch}
          initialSearchText={searchQuery}
          // Do not pass initialState here. SmartSearchBar will read from URL.
        />
        {latitude && longitude && (
          <div className="text-center">
            <Button
              onClick={handleLocationSearch}
              disabled={locationLoading}
              variant="outline"
              size="lg"
              className="w-full sm:w-auto"
            >
              <Navigation className="h-4 w-4 mr-2" />
              Search near your current location
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
