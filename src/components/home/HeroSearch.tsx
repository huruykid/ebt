import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ZipCodeSearch } from '@/components/ZipCodeSearch';
import { CheckBalanceModal } from '@/components/CheckBalanceModal';
import { Navigation, CreditCard, Calculator } from 'lucide-react';
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
      <div className="px-4 pt-5 pb-3 animate-fade-in">
        <h1 className="text-xl font-bold text-foreground text-center mb-1">
          Find EBT Stores Near You
        </h1>
        <p className="text-xs text-muted-foreground text-center mb-4">
          300,000+ grocery stores, restaurants & markets
        </p>
        
        <ZipCodeSearch
          onZipSearch={onZipSearch}
          onClearSearch={onClearSearch}
          isSearchActive={isSearchActive}
          activeZip={activeZip}
          errorMessage={errorMessage}
          noResultsMessage={noResultsMessage}
        />
        
        {!isSearchActive && (
          <div className="flex justify-center gap-2 mt-3">
            <Button
              onClick={() => {
                trackLocationSearch(!latitude || !longitude);
                onCurrentLocationSearch();
              }}
              variant="secondary"
              size="sm"
              disabled={loading}
              className="text-xs"
            >
              <Navigation className={cn("h-3.5 w-3.5 mr-1.5", loading && "animate-pulse")} />
              {loading ? 'Locating...' : 'Use my location'}
            </Button>
            <CheckBalanceModal 
              trigger={
                <Button variant="ghost" size="sm" className="text-xs">
                  <CreditCard className="h-3.5 w-3.5 mr-1.5" />
                  Balance
                </Button>
              }
            />
            <Button asChild variant="ghost" size="sm" className="text-xs">
              <Link to="/benefits-calculator">
                <Calculator className="h-3.5 w-3.5 mr-1.5" />
                Calculator
              </Link>
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="border-b border-border">
      <div className="max-w-2xl mx-auto px-6 py-16 text-center animate-fade-in">
        <h1 className="font-bold text-foreground text-3xl mb-3">
          Find Stores That Accept EBT
        </h1>
        <p className="text-muted-foreground text-base mb-8 max-w-lg mx-auto">
          Search 300,000+ grocery stores, restaurants, and markets that accept SNAP/EBT benefits.
        </p>
        
        <div className="max-w-md mx-auto mb-6">
          <ZipCodeSearch
            onZipSearch={onZipSearch}
            onClearSearch={onClearSearch}
            isSearchActive={isSearchActive}
            activeZip={activeZip}
            errorMessage={errorMessage}
            noResultsMessage={noResultsMessage}
          />
        </div>
        
        {!isSearchActive && (
          <div className="flex justify-center gap-3">
            <Button
              onClick={() => {
                trackLocationSearch(!latitude || !longitude);
                onCurrentLocationSearch();
              }}
              variant="outline"
              size="sm"
              disabled={loading}
            >
              <Navigation className={cn("h-4 w-4 mr-2", loading && "animate-pulse")} />
              {loading ? 'Locating...' : 'Use current location'}
            </Button>
            <CheckBalanceModal 
              trigger={
                <Button variant="ghost" size="sm">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Check balance
                </Button>
              }
            />
          </div>
        )}
      </div>
    </div>
  );
};
