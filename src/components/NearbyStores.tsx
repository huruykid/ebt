
import React, { useState } from 'react';
import { useNearbyStores } from '@/hooks/useNearbyStores';
import { StoreList } from './StoreList';
import { LoadingSpinner } from './LoadingSpinner';
import { SortDropdown, type SortOption } from './SortDropdown';
import { sortStores } from '@/utils/storeSorting';
import { MapPin } from 'lucide-react';

interface NearbyStoresProps {
  latitude: number;
  longitude: number;
  radius?: number;
  limit?: number;
  category?: string;
  storeTypes?: string[];
}

export const NearbyStores: React.FC<NearbyStoresProps> = ({
  latitude,
  longitude,
  radius = 10,
  limit = 20,
  category = 'trending',
  storeTypes = []
}) => {
  const [sortBy, setSortBy] = useState<SortOption>('distance');
  
  const { data: stores, isLoading, error } = useNearbyStores({
    latitude,
    longitude,
    radius,
    limit,
    category,
    storeTypes
  });

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
        <p className="text-destructive">Error loading stores. Please try again.</p>
      </div>
    );
  }

  if (!stores || stores.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-6xl mb-4">📍</div>
        <p className="text-muted-foreground">No stores found in this area.</p>
      </div>
    );
  }

  // Sort the stores based on the selected option
  const sortedStores = sortStores(stores, sortBy);

  return (
    <div className="space-y-4">
      {/* Header with sort dropdown */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">
            {stores.length} store{stores.length !== 1 ? 's' : ''} found
          </h3>
        </div>
        <SortDropdown 
          currentSort={sortBy} 
          onSortChange={setSortBy} 
        />
      </div>

      {/* Store list */}
      <StoreList stores={sortedStores} />
    </div>
  );
};
