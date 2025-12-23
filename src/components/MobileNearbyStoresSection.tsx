
import React from 'react';
import { LoadingSpinner } from './LoadingSpinner';
import { NearbyStores } from './NearbyStores';
import NoLocationExperience from './NoLocationExperience';

interface Props {
  loading: boolean;
  latitude: number | null;
  longitude: number | null;
  activeCategory: string;
  selectedStoreTypes: string[];
  onSmartSearch: (query: string) => void;
  onRequestLocation: () => void;
}

export const MobileNearbyStoresSection: React.FC<Props> = ({
  loading,
  latitude,
  longitude,
  activeCategory,
  selectedStoreTypes,
  onRequestLocation,
}) => {
  if (loading) {
    return (
      <div className="py-8">
        <LoadingSpinner />
        <p className="text-center text-gray-600 mt-4">Getting your location...</p>
      </div>
    );
  }

  if (latitude && longitude) {
    return (
      <div className="w-full">
        <NearbyStores
          latitude={latitude}
          longitude={longitude}
          radius={10}
          limit={20}
          category={activeCategory}
          storeTypes={selectedStoreTypes}
        />
      </div>
    );
  }

  // Show helpful content when no location - not a blocker
  return (
    <div className="w-full py-4">
      <div className="bg-card rounded-xl border p-4 mb-4">
        <div className="flex items-start gap-3">
          <div className="text-2xl">💡</div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-foreground mb-1">
              Search by ZIP Code Above
            </h3>
            <p className="text-xs text-muted-foreground">
              Enter a ZIP code to find EBT-accepting stores in any area.
            </p>
          </div>
        </div>
      </div>
      
      <div className="bg-muted/50 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="text-2xl">📍</div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-foreground mb-1">
              Want Nearby Results?
            </h3>
            <p className="text-xs text-muted-foreground mb-2">
              Enable location to see stores closest to you.
            </p>
            <button
              onClick={onRequestLocation}
              className="text-xs text-primary font-medium hover:underline"
            >
              Enable Location →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileNearbyStoresSection;
