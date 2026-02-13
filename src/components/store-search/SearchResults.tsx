// Search results with List/Map toggle and Open Now filtering
import React, { useState, useMemo, lazy, Suspense } from 'react';
import { UnifiedStoreCard } from '@/components/UnifiedStoreCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { SortDropdown, type SortOption } from '@/components/SortDropdown';
import { RadiusDropdown } from '@/components/RadiusDropdown';
import { List, Map } from 'lucide-react';
import { OpenNowFilter } from '@/components/OpenNowFilter';
import { filterOpenNowStores } from '@/utils/storeHoursUtils';
import type { Tables } from '@/integrations/supabase/types';

const StoreMapView = lazy(() => import('@/components/store-search/StoreMapView').then(m => ({ default: m.StoreMapView })));

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
  openNowFilter?: boolean;
  onOpenNowChange?: (enabled: boolean) => void;
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
  onRadiusChange,
  openNowFilter: externalOpenNowFilter,
  onOpenNowChange: externalOnOpenNowChange
}) => {
  // Use internal state if external props not provided
  const [internalOpenNowFilter, setInternalOpenNowFilter] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  
  const openNowFilter = externalOpenNowFilter ?? internalOpenNowFilter;
  const onOpenNowChange = externalOnOpenNowChange ?? setInternalOpenNowFilter;
  
  // Filter stores based on open now status
  const filteredStores = useMemo(() => {
    if (!openNowFilter) return stores;
    return filterOpenNowStores(stores);
  }, [stores, openNowFilter]);
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
        <div className="bg-card rounded-xl p-6 border-2 border-destructive/20">
          <p className="text-destructive font-semibold">⚠️ Error loading stores. Please try again.</p>
        </div>
      </div>
    );
  }

  if (stores.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="bg-card rounded-xl p-8 border-2 border-muted/20">
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

  // Calculate stats for display
  const openNowCount = filterOpenNowStores(stores).length;
  const hasOpenNowData = openNowCount > 0 || stores.some(s => s.google_opening_hours);

  return (
    <div className="space-y-4">
      {/* Search Summary and Controls */}
      <div className="bg-card rounded-lg p-4 border-2 border-success/20">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-sm text-muted-foreground">
              Found {filteredStores.length} store{filteredStores.length !== 1 ? 's' : ''}
              {openNowFilter && ` open now`}
              {locationSearch && ` within ${radius} miles`}
              {activeCategory !== 'trending' && selectedStoreTypes.length > 0 && (
                <span> in {activeCategory}</span>
              )}
              {openNowFilter && filteredStores.length < stores.length && (
                <span className="text-muted-foreground/70"> ({stores.length} total)</span>
              )}
            </p>
          </div>
          
          <div className="flex items-center gap-3 flex-wrap">
            {/* View Mode Toggle */}
            <div className="flex items-center rounded-lg border border-border overflow-hidden">
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium transition-colors ${
                  viewMode === 'list'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card text-muted-foreground hover:text-foreground'
                }`}
              >
                <List className="h-3.5 w-3.5" />
                List
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium transition-colors ${
                  viewMode === 'map'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card text-muted-foreground hover:text-foreground'
                }`}
              >
                <Map className="h-3.5 w-3.5" />
                Map
              </button>
            </div>

            {/* Open Now Filter */}
            {hasOpenNowData && (
              <OpenNowFilter
                isEnabled={openNowFilter}
                onToggle={onOpenNowChange}
              />
            )}
            
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

      {/* No stores open message */}
      {openNowFilter && filteredStores.length === 0 && stores.length > 0 && (
        <div className="text-center py-6">
          <div className="bg-card rounded-lg p-6 border-2 border-warning/20">
            <div className="text-4xl mb-3">🕐</div>
            <h3 className="text-lg font-semibold mb-2">No stores currently open</h3>
            <p className="text-sm text-muted-foreground mb-3">
              {stores.length} store{stores.length !== 1 ? 's' : ''} found, but none appear to be open right now.
            </p>
            <button
              onClick={() => onOpenNowChange(false)}
              className="text-sm text-primary hover:text-primary/80 font-medium"
            >
              Show all stores →
            </button>
          </div>
        </div>
      )}

      {viewMode === 'map' ? (
        <Suspense fallback={<div className="flex justify-center py-8"><LoadingSpinner /></div>}>
          <StoreMapView stores={filteredStores} locationSearch={locationSearch} />
        </Suspense>
      ) : (
        <div className="grid gap-4 grid-cols-1">
          {filteredStores.map((store) => (
            <UnifiedStoreCard 
              key={store.id}
              store={store}
              enhanced
            />
          ))}
        </div>
      )}
    </div>
  );
};
