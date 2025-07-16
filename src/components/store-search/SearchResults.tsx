
import React from 'react';
import { StoreCard } from '@/components/StoreCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { SortDropdown, type SortOption } from '@/components/SortDropdown';
import { RadiusDropdown } from '@/components/RadiusDropdown';
import type { Tables } from '@/integrations/supabase/types';

type Store = Tables<'snap_stores'>;

interface StoreWithDistance extends Store {
  distance?: number;
}

interface SearchResultsProps {
  stores: StoreWithDistance[];
  isLoading: boolean;
  error: Error | null;
  locationSearch: { lat: number; lng: number } | null;
  activeCategory: string;
  selectedStoreTypes: string[];
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  radius?: number;
  onRadiusChange?: (radius: number) => void;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  stores,
  isLoading,
  error,
  locationSearch,
  activeCategory,
  selectedStoreTypes,
  sortBy,
  onSortChange,
  radius = 10,
  onRadiusChange
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="card-gradient rounded-spotify-xl p-6 border-2 border-destructive/20">
          <p className="text-destructive font-semibold">⚠️ Error loading stores. Please try again.</p>
        </div>
      </div>
    );
  }

  if (stores.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="card-gradient rounded-spotify-xl p-8 border-2 border-muted/20">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold mb-2">No stores found</h3>
          <p className="text-muted-foreground text-lg mb-4">
            {locationSearch 
              ? `No EBT-accepting stores found within ${radius} miles of your location.`
              : "No EBT-accepting stores found matching your search."
            }
          </p>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>Try:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Expanding your search radius{locationSearch ? '' : ' or adding your location'}</li>
              <li>Searching for specific store names (e.g., "Walmart", "Safeway")</li>
              <li>Using city names or ZIP codes (e.g., "Fresno" or "93722")</li>
              <li>Checking different store categories</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search Summary and Controls */}
      <div className="card-gradient rounded-spotify-lg p-4 border-2 border-success/20">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-sm text-muted-foreground">
              Found {stores.length} store{stores.length !== 1 ? 's' : ''}
              {locationSearch && ` within ${radius} miles`}
              {activeCategory !== 'trending' && selectedStoreTypes.length > 0 && (
                <span> in {activeCategory}</span>
              )}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {locationSearch && onRadiusChange && (
              <RadiusDropdown 
                value={radius} 
                onChange={onRadiusChange}
              />
            )}
            <SortDropdown 
              currentSort={sortBy} 
              onSortChange={onSortChange} 
            />
          </div>
        </div>
      </div>

      {/* Store Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1">
        {stores.map((store) => (
          <StoreCard 
            key={store.id}
            store={store}
          />
        ))}
      </div>
    </div>
  );
};
