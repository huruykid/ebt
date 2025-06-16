
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

  return (
    <div className="text-center py-8">
      <div className="text-6xl mb-4">📍</div>
      <h3 className="text-lg font-semibold text-foreground mb-2">Location Required</h3>
      <p className="text-muted-foreground mb-4">
        We need your location to show nearby stores that accept EBT/SNAP benefits.
      </p>
      <button
        onClick={onRequestLocation}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
      >
        Enable Location
      </button>
    </div>
  );
};

export default MobileNearbyStoresSection;
