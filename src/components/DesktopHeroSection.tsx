
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
          <h1 className="text-5xl font-bold text-foreground mb-5 leading-tight">
            Find EBT & SNAP Stores Near You
          </h1>
          <p className="text-xl text-muted-foreground mb-6 leading-relaxed">
            Search 300,000+ grocery stores, restaurants, and farmers markets that accept EBT cards and SNAP benefits across all 50 states.
          </p>
          <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
            Whether you're looking for supermarkets, convenience stores, farmers markets with fresh produce, or{" "}
            <a 
              href="https://www.fns.usda.gov/snap/retailer/restaurant-meals-program"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors underline font-medium"
            >
              Restaurant Meals Program (RMP)
            </a>
            {" "}locations serving hot meals, EBT Finder helps you discover authorized SNAP retailers near you. Get directions, read reviews, and find store hours instantly.
          </p>

          {/* ZIP Code Search - Desktop */}
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Search by ZIP Code or Location</h2>
            <p className="text-muted-foreground mb-4">
              Enter your ZIP code to find SNAP-approved stores, or enable location access for real-time results based on where you are right now.
            </p>
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
          <div className="flex flex-wrap justify-center gap-6 mt-10 text-sm">
            <div className="flex items-center gap-2 bg-background/50 px-4 py-2 rounded-full">
              <MapPin className="h-5 w-5 text-primary" />
              <span className="font-medium">Nationwide Coverage</span>
            </div>
            <div className="flex items-center gap-2 bg-background/50 px-4 py-2 rounded-full">
              <Heart className="h-5 w-5 text-primary" />
              <span className="font-medium">Save Favorites</span>
            </div>
            <div className="flex items-center gap-2 bg-background/50 px-4 py-2 rounded-full">
              <Navigation className="h-5 w-5 text-primary" />
              <span className="font-medium">Live Directions</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
