
import React from 'react';
import { SmartSearchBar } from '@/components/SmartSearchBar';
import { useGeolocation } from '@/hooks/useGeolocation';

interface SearchHeaderProps {
  searchQuery: string;
  onSearch: (query: string) => void;
  onLocationSearch: (latitude: number, longitude: number) => void;
  onSmartSearch?: (searchText: string, city?: string, zipCode?: string) => void;
}

export const SearchHeader: React.FC<SearchHeaderProps> = ({
  searchQuery,
  onSearch,
  onLocationSearch,
  onSmartSearch
}) => {
  const { latitude, longitude, loading: locationLoading } = useGeolocation();

  const handleSmartSearch = (searchText: string, city?: string, zipCode?: string) => {
    if (onSmartSearch) {
      onSmartSearch(searchText, city, zipCode);
    } else {
      // Fallback to regular search if smart search not provided
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
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">Find SNAP/EBT Stores</h1>
        <p className="text-muted-foreground">
          Search by store name/type and location with fuzzy matching
        </p>
      </div>

      <SmartSearchBar
        onSearch={handleSmartSearch}
        initialSearchText={searchQuery}
      />

      {latitude && longitude && (
        <div className="text-center">
          <button
            onClick={handleLocationSearch}
            disabled={locationLoading}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            📍 Or search near your current location
          </button>
        </div>
      )}
    </div>
  );
};
