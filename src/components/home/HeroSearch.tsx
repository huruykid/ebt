import React from 'react';
import { Button } from '@/components/ui/button';
import { ZipCodeSearch } from '@/components/ZipCodeSearch';
import { MapPin, Heart, Navigation } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeroSearchProps {
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
  onRequestLocation?: () => void;
  variant?: 'desktop' | 'mobile';
}

export const HeroSearch: React.FC<HeroSearchProps> = ({
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
  onRequestLocation,
  variant = 'desktop'
}) => {
  const isMobile = variant === 'mobile';

  if (isMobile) {
    return (
      <div className="flex w-full flex-col items-stretch px-4 pt-4 pb-2">
        {/* Compact mobile header */}
        <h1 className="text-xl font-bold text-foreground text-center mb-1">
          Find EBT Stores Near You
        </h1>
        <p className="text-xs text-muted-foreground text-center mb-4">
          Search by ZIP code to find SNAP-accepting stores
        </p>
        
        {/* Prominent search box */}
        <div className="bg-card rounded-xl p-3 shadow-sm border">
          <ZipCodeSearch
            onZipSearch={onZipSearch}
            onClearSearch={onClearSearch}
            isSearchActive={isSearchActive}
            activeZip={activeZip}
            errorMessage={errorMessage}
            noResultsMessage={noResultsMessage}
          />
        </div>
        
        {/* Current location button - shown as secondary option, not intrusive */}
        {!isSearchActive && latitude && longitude && (
          <Button
            onClick={onCurrentLocationSearch}
            variant="ghost"
            size="sm"
            disabled={loading}
            className="mt-2 text-xs text-muted-foreground"
          >
            <Navigation className="h-3 w-3 mr-1.5" />
            Or use current location
          </Button>
        )}

        {/* Subtle location hint - no blocking prompt */}
        {!isSearchActive && !latitude && !longitude && !loading && (
          <button
            onClick={onRequestLocation}
            className="mt-2 text-xs text-muted-foreground hover:text-primary transition-colors flex items-center justify-center gap-1"
          >
            <MapPin className="h-3 w-3" />
            Enable location for nearby stores
          </button>
        )}
      </div>
    );
  }

  // Desktop layout (unchanged)
  return (
    <div className="bg-background border-b">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="font-bold text-foreground text-4xl mb-4">
            Find EBT & SNAP-Accepting Stores Near You
          </h1>
          <p className="text-muted-foreground text-lg mb-8">
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
        
        {/* ZIP Code Search */}
        <div className="mb-6">
          <h2 className="font-medium text-foreground text-lg mb-3 text-center">
            Enter your ZIP code or use your current location to find EBT-accepting businesses
          </h2>
          <ZipCodeSearch
            onZipSearch={onZipSearch}
            onClearSearch={onClearSearch}
            isSearchActive={isSearchActive}
            activeZip={activeZip}
            errorMessage={errorMessage}
            noResultsMessage={noResultsMessage}
          />
        </div>
        
        {/* Current Location Search Button */}
        {!isSearchActive && latitude && longitude && (
          <div className="max-w-2xl mx-auto">
            <Button
              onClick={onCurrentLocationSearch}
              variant="outline"
              size="lg"
              disabled={loading}
              className="w-full sm:w-auto"
            >
              <Navigation className="h-4 w-4 mr-2" />
              Search near your current location
            </Button>
          </div>
        )}

        {/* Quick Stats */}
        <div className="flex justify-center gap-8 mt-8 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>Location-based results</span>
          </div>
          <div className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            <span>Save your favorites</span>
          </div>
        </div>
      </div>
    </div>
  );
};
