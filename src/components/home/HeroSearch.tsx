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

  return (
    <div className={cn(
      isMobile ? "flex w-full flex-col items-stretch px-3.5 pt-6" : "bg-gradient-to-br from-primary/5 to-secondary/10 border-b"
    )}>
      <div className={cn(
        isMobile ? "" : "max-w-7xl mx-auto px-6 py-12"
      )}>
        <div className={cn(
          "text-center",
          isMobile ? "mb-4" : "max-w-3xl mx-auto"
        )}>
          <h1 className={cn(
            "font-bold text-foreground",
            isMobile ? "text-2xl mb-2" : "text-4xl mb-4"
          )}>
            Find EBT & SNAP-Accepting Stores Near You
          </h1>
          <p className={cn(
            "text-muted-foreground",
            isMobile ? "text-sm px-2" : "text-lg mb-8"
          )}>
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
        <div className={cn(
          isMobile ? "mb-4 bg-card rounded-lg p-4 shadow-sm border" : "mb-6"
        )}>
          <h2 className={cn(
            "font-medium text-foreground",
            isMobile ? "text-sm mb-3" : "text-lg mb-3 text-center"
          )}>
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
          <div className={cn(
            isMobile ? "mb-4" : "max-w-2xl mx-auto"
          )}>
            <Button
              onClick={onCurrentLocationSearch}
              variant="outline"
              size={isMobile ? "default" : "lg"}
              disabled={loading}
              className={isMobile ? "w-full" : "w-full sm:w-auto"}
            >
              <Navigation className="h-4 w-4 mr-2" />
              Search near your current location
            </Button>
          </div>
        )}

        {/* Location prompt for mobile */}
        {isMobile && !isSearchActive && !latitude && !longitude && !loading && onRequestLocation && (
          <div className="mb-4 text-center py-4 bg-card rounded-lg border">
            <div className="text-4xl mb-2">📍</div>
            <h3 className="text-sm font-medium text-foreground mb-2">Enable Location</h3>
            <p className="text-xs text-muted-foreground mb-3">
              Get personalized results for stores near you
            </p>
            <Button onClick={onRequestLocation} size="sm" className="w-full">
              <MapPin className="h-4 w-4 mr-2" />
              Enable Location Access
            </Button>
          </div>
        )}

        {/* Quick Stats - Desktop only */}
        {!isMobile && (
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
        )}
      </div>
    </div>
  );
};
