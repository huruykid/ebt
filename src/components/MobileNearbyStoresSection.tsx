import React from 'react';
import { NearbyStores } from './NearbyStores';
import { FeaturedStores, PopularCities, TrustSignals } from './home';
import { MapPin, Navigation } from 'lucide-react';
import { Button } from './ui/button';
import { Skeleton } from './ui/skeleton';

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
  // Use larger radius for approximate IP-based locations
  const defaultRadius = locationSource === 'ip' || locationSource === 'fallback' ? 25 : 10;
  const hasLocation = latitude !== null && longitude !== null;

  return (
    <div className="w-full space-y-4">
      {/* Always show trust signals first - instant value */}
      <TrustSignals />
      
      {/* Show content based on location state */}
      {loading && !hasLocation ? (
        // Skeleton loading while fetching location - shows intent without blocking
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Navigation className="h-3 w-3 animate-pulse" />
            <span>Finding stores near you...</span>
          </div>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      ) : hasLocation ? (
        // Location available - show nearby stores
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
      ) : (
        // No location - show featured content immediately
        <>
          <FeaturedStores />
          <PopularCities variant="compact" />
          
          {/* Inline location prompt - subtle, not blocking */}
          <div className="flex items-center gap-3 p-3 bg-primary/5 border border-primary/20 rounded-lg">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
              <MapPin className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">
                See stores closest to you
              </p>
            </div>
            <Button 
              onClick={onRequestLocation} 
              size="sm" 
              variant="ghost"
              className="text-xs h-7 px-2"
            >
              <Navigation className="h-3 w-3 mr-1" />
              Enable
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default MobileNearbyStoresSection;
