
import React, { useState, useMemo } from 'react';
import { LoadingSpinner } from './LoadingSpinner';
import { SortDropdown, SortOption } from './SortDropdown';
import { StoreList } from './StoreList';
import { MapPin, AlertCircle } from 'lucide-react';
import { useNearbyStores } from '@/hooks/useNearbyStores';
import { useStoreGoogleData } from '@/hooks/useStoreGoogleData';
import { sortStores } from '@/utils/storeSorting';

interface NearbyStoresProps {
  latitude: number;
  longitude: number;
  radius?: number; // in miles
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

  const storesWithGoogleData = useStoreGoogleData(stores);

  // Sort stores based on selected criteria
  const sortedStores = useMemo(() => {
    return sortStores(storesWithGoogleData, sortBy);
  }, [storesWithGoogleData, sortBy]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600">Error loading nearby stores. Please try again.</p>
      </div>
    );
  }

  if (!stores || stores.length === 0) {
    const categoryText = category === 'trending' ? 'SNAP stores' : storeTypes.join(', ').toLowerCase();
    return (
      <div className="text-center py-8">
        <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No {categoryText} found within {radius} miles of your location.</p>
        <p className="text-sm text-gray-500 mt-2">Try a different category or expand your search radius.</p>
      </div>
    );
  }

  const getHeaderText = () => {
    if (category === 'trending') {
      return `${stores.length} stores near you`;
    }
    const categoryName = storeTypes.length > 0 ? storeTypes.join(', ') : 'SNAP Stores';
    return `${stores.length} ${categoryName.toLowerCase()} nearby`;
  };

  const getSubtext = () => {
    const closestDistance = stores[0]?.distance;
    if (closestDistance !== undefined) {
      return `Starting ${closestDistance.toFixed(1)} mi away`;
    }
    return `Within ${radius} miles`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          <MapPin className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              {getHeaderText()}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {getSubtext()}
            </p>
          </div>
        </div>
        <SortDropdown currentSort={sortBy} onSortChange={setSortBy} />
      </div>
      <StoreList stores={sortedStores} />
    </div>
  );
};
