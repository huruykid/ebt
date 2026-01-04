import React from 'react';
import { LoadingSpinner } from './LoadingSpinner';
import { NearbyStores } from './NearbyStores';
import { FeaturedStores, PopularCities, TrustSignals } from './home';
import { Info, MapPin } from 'lucide-react';
import { Button } from './ui/button';

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
  // Show engaging content while loading OR when no location
  // This ensures users always see value immediately
  if (!latitude || !longitude) {
    return (
      <div className="space-y-8">
        {/* Trust signals bar */}
        <TrustSignals />
        
        {loading && (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground py-2">
            <LoadingSpinner />
            <span>Checking for nearby stores...</span>
          </div>
        )}
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Featured stores - show value immediately */}
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Popular EBT Stores
              </h2>
              <p className="text-sm text-muted-foreground">
                Top-rated stores accepting SNAP benefits nationwide
              </p>
            </div>
            <FeaturedStores />
          </div>
          
          {/* Browse by city + location prompt */}
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Browse by City
              </h2>
              <p className="text-sm text-muted-foreground">
                Find EBT stores in major cities across the US
              </p>
            </div>
            <PopularCities variant="full" />
            
            {/* Location prompt card - only show when not loading */}
            {!loading && onRequestLocation && (
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 mt-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1">
                      Get Personalized Results
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Enable location to see stores closest to you with real-time distance.
                    </p>
                    <Button onClick={onRequestLocation} size="sm">
                      <MapPin className="h-4 w-4 mr-2" />
                      Enable Location
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (latitude && longitude) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-semibold text-foreground">
              Nearby Stores
            </h2>
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
            Showing results within 10 miles
          </p>
        </div>
        <NearbyStores 
          latitude={latitude} 
          longitude={longitude} 
          radius={10} 
          limit={20} 
          category={activeCategory} 
          storeTypes={selectedStoreTypes}
          locationSource={locationSource}
          onRequestLocation={onRequestLocation}
        />
      </div>
    );
  }

  return null;
};

export default DesktopNearbyStoresSection;
