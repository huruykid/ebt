import React from 'react';
import { MapPin, Navigation, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RadiusDropdown } from './RadiusDropdown';

interface NoStoresFoundProps {
  radius: number;
  onRadiusChange: (radius: number) => void;
  onRequestLocation?: () => void;
  locationSource?: 'ip' | 'browser' | 'fallback' | null;
  showZipSearch?: boolean;
}

export const NoStoresFound: React.FC<NoStoresFoundProps> = ({
  radius,
  onRadiusChange,
  onRequestLocation,
  locationSource,
  showZipSearch = true,
}) => {
  const isApproximateLocation = locationSource === 'ip' || locationSource === 'fallback';

  return (
    <div className="text-center py-8 px-4">
      <div className="text-6xl mb-4">🔍</div>
      <h3 className="text-lg font-semibold text-foreground mb-2">
        No stores found within {radius} miles
      </h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
        {isApproximateLocation 
          ? "Your location is approximate. Try one of these options to find stores near you:"
          : "Try expanding your search radius or search by ZIP code."}
      </p>

      <div className="space-y-4 max-w-xs mx-auto">
        {/* Expand radius option */}
        <div className="flex items-center justify-center gap-3">
          <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span className="text-sm text-muted-foreground">Expand search:</span>
          <RadiusDropdown value={radius} onChange={onRadiusChange} />
        </div>

        {/* GPS option - show if location is approximate */}
        {isApproximateLocation && onRequestLocation && (
          <Button
            variant="default"
            size="sm"
            onClick={onRequestLocation}
            className="w-full gap-2"
          >
            <Navigation className="h-4 w-4" />
            Enable Precise GPS Location
          </Button>
        )}

        {/* ZIP code search option */}
        {showZipSearch && (
          <div className="pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground mb-3">
              Or search by ZIP code for exact results
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const searchInput = document.querySelector('input[placeholder*="ZIP"]') as HTMLInputElement
                  || document.querySelector('input[type="search"]') as HTMLInputElement;
                if (searchInput) {
                  searchInput.focus();
                  searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
              }}
              className="w-full gap-2"
            >
              <Search className="h-4 w-4" />
              Search by ZIP Code
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
