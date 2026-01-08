import React from 'react';
import { NearbyStores } from './NearbyStores';
import { FeaturedStores, PopularCities, TrustSignals } from './home';
import { Info, MapPin, Navigation } from 'lucide-react';
import { Button } from './ui/button';
import { Skeleton } from './ui/skeleton';

interface Props {
  loading: boolean;
  latitude: number | null;
  longitude: number | null;
  activeCategory: string;
  selectedStoreTypes: string[];
  onRequestLocation?: () => void;
  locationSource?: 'ip' | 'browser' | 'fallback' | null;
}

export const DesktopNearbyStoresSection: React.FC<Props> = ({
  loading,
  latitude,
  longitude,
  activeCategory,
  selectedStoreTypes,
  onRequestLocation,
  locationSource,
}) => {
  const defaultRadius = locationSource === 'ip' || locationSource === 'fallback' ? 25 : 10;
  const hasLocation = latitude !== null && longitude !== null;

  // Always show engaging content - either nearby stores or featured content
  return (
    <div className="space-y-8">
      {/* Trust signals - always visible */}
      <TrustSignals />
      
      {loading && !hasLocation ? (
        // Loading skeleton while fetching location
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Navigation className="h-4 w-4 animate-pulse" />
              <span>Finding stores near you...</span>
            </div>
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-lg" />
            ))}
          </div>
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-2">Browse by City</h2>
              <p className="text-sm text-muted-foreground">Find EBT stores in major cities</p>
            </div>
            <PopularCities variant="full" />
          </div>
        </div>
      ) : hasLocation ? (
        // Has location - show nearby stores
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-semibold text-foreground">Nearby Stores</h2>
              {activeCategory === 'hotmeals' && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg">
                  <Info className="h-4 w-4 text-blue-600 flex-shrink-0" />
                  <div className="text-sm">
                    <span className="text-blue-800 font-medium">RMP:</span>
                    <span className="text-blue-700 ml-1">State-specific program.</span>
                    <a 
                      href="https://www.fns.usda.gov/snap/retailer/restaurant-meals-program"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline ml-1 font-medium"
                    >
                      Learn more →
                    </a>
                  </div>
                </div>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Showing results within {defaultRadius} miles
            </p>
          </div>
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
      ) : (
        // No location - show featured content with inline location prompt
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-2">Popular EBT Stores</h2>
              <p className="text-sm text-muted-foreground">Top-rated stores accepting SNAP benefits</p>
            </div>
            <FeaturedStores />
            
            {/* Inline location prompt */}
            {onRequestLocation && (
              <div className="flex items-center gap-4 p-4 bg-primary/5 border border-primary/20 rounded-xl">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Get personalized results</p>
                  <p className="text-xs text-muted-foreground">See stores closest to you</p>
                </div>
                <Button onClick={onRequestLocation} size="sm">
                  <Navigation className="h-4 w-4 mr-2" />
                  Enable
                </Button>
              </div>
            )}
          </div>
          
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-2">Browse by City</h2>
              <p className="text-sm text-muted-foreground">Find EBT stores in major cities</p>
            </div>
            <PopularCities variant="full" />
          </div>
        </div>
      )}
    </div>
  );
};

export default DesktopNearbyStoresSection;
