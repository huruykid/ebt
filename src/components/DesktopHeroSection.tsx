
import React from 'react';
import { Button } from '@/components/ui/button';
import { ZipCodeSearch } from './ZipCodeSearch';
import { MapPin, Heart, Navigation } from 'lucide-react';

interface DesktopHeroSectionProps {
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
}

export const DesktopHeroSection: React.FC<DesktopHeroSectionProps> = ({
  onZipSearch,
  onClearSearch,
  isSearchActive,
  activeZip,
  errorMessage,
  noResultsMessage,
  latitude,
  longitude,
  loading,
  onCurrentLocationSearch
}) => {
  return (
    <div className="bg-gradient-to-br from-primary/5 to-secondary/10 border-b">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-foreground mb-4">Find SNAP/EBT - Accepting Stores Near You</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Discover grocery stores, restaurants, and retailers that accept EBT/SNAP benefits near your location.
          </p>
          
          {/* ZIP Code Search - Desktop */}
          <div className="mb-6">
            <ZipCodeSearch
              onZipSearch={onZipSearch}
              onClearSearch={onClearSearch}
              isSearchActive={isSearchActive}
              activeZip={activeZip}
              errorMessage={errorMessage}
              noResultsMessage={noResultsMessage}
            />
          </div>
          
          {/* Current Location Search Button - Desktop */}
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
    </div>
  );
};
