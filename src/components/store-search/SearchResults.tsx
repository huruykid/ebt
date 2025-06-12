
import React from 'react';
import { MapPin } from 'lucide-react';
import { StoreCard } from '@/components/StoreCard';
import { SortDropdown, type SortOption } from '@/components/SortDropdown';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import type { Tables } from '@/integrations/supabase/types';

type Store = Tables<'snap_stores'>;

interface StoreWithDistance extends Store {
  distance?: number;
}

interface SearchResultsProps {
  stores: StoreWithDistance[] | undefined;
  isLoading: boolean;
  error: Error | null;
  locationSearch: { lat: number; lng: number } | null;
  activeCategory: string;
  selectedStoreTypes: string[];
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
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
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="relative">
          <LoadingSpinner />
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-info rounded-full blur-lg opacity-20 animate-glow"></div>
        </div>
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

  if (stores && stores.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="card-gradient rounded-spotify-xl p-8 border-2 border-muted/20">
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-muted-foreground text-lg">No stores found. Try adjusting your search or filters.</p>
        </div>
      </div>
    );
  }

  if (!stores || stores.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Results Header with Sort */}
      <div className="card-gradient rounded-spotify-lg p-4 border-2 border-success/20">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            {locationSearch && (
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4 text-info" />
                <span className="text-info font-medium">Near your location</span>
              </div>
            )}
            {activeCategory !== 'trending' && selectedStoreTypes.length > 0 && (
              <span className="px-3 py-1 bg-gradient-to-r from-primary/20 to-accent/20 text-primary font-semibold rounded-spotify-lg border border-primary/30">
                Filtered by: {activeCategory.replace(/([A-Z])/g, ' $1').trim()}
              </span>
            )}
          </div>
          <div className="flex justify-center sm:justify-end">
            <SortDropdown 
              currentSort={sortBy} 
              onSortChange={onSortChange} 
            />
          </div>
        </div>
      </div>
      
      {/* Enhanced Store Grid */}
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
