import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ZipCodeSearch } from '@/components/ZipCodeSearch';
import { CheckBalanceModal } from '@/components/CheckBalanceModal';
import { MapPin, Heart, Navigation, CreditCard, Calculator } from 'lucide-react';
import { cn } from '@/lib/utils';
import { trackLocationSearch } from '@/utils/analytics';

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
        
        {/* Action buttons */}
        {!isSearchActive && (
          <div className="flex flex-wrap justify-center gap-2 mt-3">
            <Button
              onClick={() => {
                trackLocationSearch(!latitude || !longitude);
                onCurrentLocationSearch();
              }}
              variant="secondary"
              size="sm"
              disabled={loading}
              className="text-sm"
            >
              <Navigation className={cn("h-4 w-4 mr-2", loading && "animate-pulse")} />
              {loading ? 'Getting location...' : 'Use current location'}
            </Button>
            <CheckBalanceModal 
              trigger={
                <Button variant="outline" size="sm" className="text-sm">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Check balance
                </Button>
              }
            />
            <Button asChild variant="outline" size="sm" className="text-sm">
              <Link to="/benefits-calculator">
                <Calculator className="h-4 w-4 mr-2" />
                Calculator
              </Link>
            </Button>
          </div>
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
        
        {/* Current Location Search Button - always visible */}
        {!isSearchActive && (
          <div className="max-w-2xl mx-auto flex justify-center">
            <Button
              onClick={() => {
                trackLocationSearch(!latitude || !longitude);
                onCurrentLocationSearch();
              }}
              variant="outline"
              size="lg"
              disabled={loading}
            >
              <Navigation className={cn("h-4 w-4 mr-2", loading && "animate-pulse")} />
              {loading ? 'Getting your location...' : 'Search near your current location'}
            </Button>
          </div>
        )}

        {/* Quick Stats & Actions */}
        <div className="flex flex-wrap justify-center gap-6 mt-8 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>Location-based results</span>
          </div>
          <div className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            <span>Save your favorites</span>
          </div>
          <CheckBalanceModal 
            trigger={
              <button className="flex items-center gap-2 hover:text-primary transition-colors cursor-pointer">
                <CreditCard className="h-4 w-4" />
                <span>Check EBT balance</span>
              </button>
            }
          />
          <Link 
            to="/benefits-calculator" 
            className="flex items-center gap-2 hover:text-primary transition-colors"
          >
            <Calculator className="h-4 w-4" />
            <span>Benefits calculator</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
