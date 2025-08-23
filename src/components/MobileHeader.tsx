
import React from 'react';
import { Button } from '@/components/ui/button';
import { ZipCodeSearch } from './ZipCodeSearch';
import { MapPin, Navigation } from 'lucide-react';

interface MobileHeaderProps {
  onZipSearch: (zipCode: string) => void;
  onClearSearch: () => void;
  isSearchActive: boolean;
  activeZip?: string;
  errorMessage?: string;
  noResultsMessage?: string;
  latitude: number | null;
  longitude: number | null;
  loading: boolean;
  onCurrentLocationSearch: () => void;
  onRequestLocation: () => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  onZipSearch,
  onClearSearch,
  isSearchActive,
  activeZip,
  errorMessage,
  noResultsMessage,
  latitude,
  longitude,
  loading,
  onCurrentLocationSearch,
  onRequestLocation
}) => {
  return (
    <div className="flex w-full flex-col items-stretch px-3.5 pt-6">
      <div className="text-center mb-4">
        <h1 className="text-2xl font-bold text-foreground mb-2">Find EBT & SNAP-Accepting Stores Near You</h1>
        <p className="text-sm text-muted-foreground px-2">
          EBT Finder helps you quickly find nearby stores and restaurants that accept SNAP/EBT benefits. Search by ZIP code, filter by grocery, convenience, or{" "}
          <a 
            href="https://www.fns.usda.gov/snap/retailer/restaurant-meals-program"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors underline"
          >
            hot food (RMP)
          </a>
          , and read community reviews before you go.
        </p>
      </div>
      
      {/* ZIP Code Search - Mobile - Always visible */}
      <div className="mb-4 bg-white rounded-lg p-4 shadow-sm border">
        <h2 className="text-sm font-medium text-foreground mb-3">Enter your ZIP code or use your current location to find EBT-accepting businesses</h2>
        <ZipCodeSearch
          onZipSearch={onZipSearch}
          onClearSearch={onClearSearch}
          isSearchActive={isSearchActive}
          activeZip={activeZip}
          errorMessage={errorMessage}
          noResultsMessage={noResultsMessage}
        />
      </div>
      
      {/* Current Location Search Button - Mobile */}
      {!isSearchActive && latitude && longitude && (
        <div className="mb-4">
          <Button
            onClick={onCurrentLocationSearch}
            variant="outline"
            className="w-full"
            disabled={loading}
          >
            <Navigation className="h-4 w-4 mr-2" />
            Search near your current location
          </Button>
        </div>
      )}

      {/* Show location prompt for users without location */}
      {!isSearchActive && !latitude && !longitude && !loading && (
        <div className="mb-4 text-center py-4 bg-white rounded-lg border">
          <div className="text-4xl mb-2">📍</div>
          <h3 className="text-sm font-medium text-foreground mb-2">Enable Location</h3>
          <p className="text-xs text-muted-foreground mb-3">
            Get personalized results for stores near you
          </p>
          <Button
            onClick={onRequestLocation}
            size="sm"
            className="w-full"
          >
            <MapPin className="h-4 w-4 mr-2" />
            Enable Location Access
          </Button>
        </div>
      )}
    </div>
  );
};
