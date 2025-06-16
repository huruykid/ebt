import React, { useState } from 'react';
import { useNearbyStores } from '@/hooks/useNearbyStores';
import { StoreList } from './StoreList';
import { LoadingSpinner } from './LoadingSpinner';
import { SortDropdown, type SortOption } from './SortDropdown';
import { RadiusDropdown } from './RadiusDropdown';
import { sortStores } from '@/utils/storeSorting';
import { MapPin, Zap } from 'lucide-react';
interface NearbyStoresProps {
  latitude: number;
  longitude: number;
  radius?: number;
  limit?: number;
  category?: string;
  storeTypes?: string[];
  useOptimized?: boolean;
}
export const NearbyStores: React.FC<NearbyStoresProps> = ({
  latitude,
  longitude,
  radius: initialRadius = 10,
  limit = 20,
  category = 'trending',
  storeTypes = [],
  useOptimized = true
}) => {
  const [sortBy, setSortBy] = useState<SortOption>('distance');
  const [radius, setRadius] = useState(initialRadius);
  const {
    data: stores,
    isLoading,
    error
  } = useNearbyStores({
    latitude,
    longitude,
    radius,
    limit,
    category,
    storeTypes,
    useOptimized
  });
  if (isLoading) {
    return <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>;
  }
  if (error) {
    return <div className="text-center py-8">
        <p className="text-destructive">Error loading stores. Please try again.</p>
      </div>;
  }
  if (!stores || stores.length === 0) {
    return <div className="text-center py-8">
        <div className="text-6xl mb-4">📍</div>
        <p className="text-muted-foreground">No stores found within {radius} miles.</p>
        <div className="mt-4">
          <RadiusDropdown value={radius} onChange={setRadius} />
        </div>
      </div>;
  }

  // Sort the stores based on the selected option
  const sortedStores = sortStores(stores, sortBy);
  return <div className="space-y-4">
      {/* Header with sort dropdown and radius selector */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground text-base text-center">
            {stores.length} store{stores.length !== 1 ? 's' : ''} found within {radius} miles
          </h3>
        </div>
        <div className="flex items-center gap-4">
          <RadiusDropdown value={radius} onChange={setRadius} />
          <SortDropdown currentSort={sortBy} onSortChange={setSortBy} />
        </div>
      </div>

      {/* Performance indicator when using optimized search */}
      {useOptimized && <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground py-1">
          <Zap className="h-3 w-3" />
          <span>Optimized database search</span>
        </div>}

      {/* Store list */}
      <StoreList stores={sortedStores} />
    </div>;
};