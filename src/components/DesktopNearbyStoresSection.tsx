
import React from 'react';
import { LoadingSpinner } from './LoadingSpinner';
import { NearbyStores } from './NearbyStores';
import { Info } from 'lucide-react';

interface Props {
  loading: boolean;
  latitude: number | null;
  longitude: number | null;
  activeCategory: string;
  selectedStoreTypes: string[];
}

export const DesktopNearbyStoresSection: React.FC<Props> = ({
  loading,
  latitude,
  longitude,
  activeCategory,
  selectedStoreTypes,
}) => {
  if (loading) {
    return (
      <div className="text-center py-12">
        <LoadingSpinner />
        <p className="text-muted-foreground mt-4">Getting your location...</p>
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
        />
      </div>
    );
  }

  return null;
};

export default DesktopNearbyStoresSection;
