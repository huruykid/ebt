
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
  onSmartSearch,
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
    <NoLocationExperience
      onSmartSearch={onSmartSearch}
      onRequestLocation={onRequestLocation}
    />
  );
};

export default MobileNearbyStoresSection;
