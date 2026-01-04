import React from 'react';
import { LoadingSpinner } from './LoadingSpinner';
import { NearbyStores } from './NearbyStores';
import { FeaturedStores, PopularCities, TrustSignals } from './home';

interface Props {
  loading: boolean;
  latitude: number | null;
  longitude: number | null;
  activeCategory: string;
  selectedStoreTypes: string[];
  onSmartSearch: (query: string) => void;
  onRequestLocation: () => void;
  locationSource?: 'ip' | 'browser' | 'fallback' | null;
}

export const MobileNearbyStoresSection: React.FC<Props> = ({
  loading,
  latitude,
  longitude,
  activeCategory,
  selectedStoreTypes,
  onRequestLocation,
  locationSource,
}) => {
  if (loading) {
    return (
      <div className="py-8">
        <LoadingSpinner />
        <p className="text-center text-muted-foreground mt-4 text-sm">Finding stores near you...</p>
      </div>
    );
  }

  // Use larger radius for approximate IP-based locations
  const defaultRadius = locationSource === 'ip' || locationSource === 'fallback' ? 25 : 10;

  if (latitude && longitude) {
    return (
      <div className="w-full">
        <NearbyStores
          latitude={latitude}
          longitude={longitude}
          radius={defaultRadius}
          limit={20}
          category={activeCategory}
          storeTypes={selectedStoreTypes}
          locationSource={locationSource}
          onRequestLocation={onRequestLocation}
        />
      </div>
    );
  }

  // Show engaging content when no location - NOT an empty state
  return (
    <div className="w-full space-y-4">
      {/* Trust signals */}
      <TrustSignals />
      
      {/* Featured stores - show value immediately */}
      <FeaturedStores />
      
      {/* Popular cities for quick browsing */}
      <PopularCities variant="compact" />
      
      {/* Subtle location prompt - not blocking */}
      <div className="bg-muted/30 rounded-lg p-3 mt-4">
        <div className="flex items-start gap-3">
          <div className="text-xl">📍</div>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground mb-1.5">
              Want personalized nearby results?
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
