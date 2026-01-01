import React, { useState, useCallback } from 'react';
import { Search, MapPin, Navigation, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { EnhancedSearchBar } from './EnhancedSearchBar';
import { EnhancedSearchResults } from './EnhancedSearchResults';
import { useIsMobile } from '@/hooks/use-mobile';
import { useGeolocation } from '@/hooks/useGeolocation';
import { cn } from '@/lib/utils';
import type { StoreWithDistance } from '@/types/storeTypes';

interface MobileSearchInterfaceProps {
  className?: string;
}

export const MobileSearchInterface: React.FC<MobileSearchInterfaceProps> = ({
  className
}) => {
  const isMobile = useIsMobile();
  const [showSearchSheet, setShowSearchSheet] = useState(false);
  const [quickSearchValue, setQuickSearchValue] = useState('');
  const { latitude, longitude } = useGeolocation();
  const [locationValue, setLocationValue] = useState('');
  
  // Shared search state - updated by EnhancedSearchBar via callback
  const [searchState, setSearchState] = useState<{
    results: StoreWithDistance[];
    isLoading: boolean;
    hasSearched: boolean;
    activeQuery: string;
    activeLocation: string;
    useCurrentLocation: boolean;
  }>({
    results: [],
    isLoading: false,
    hasSearched: false,
    activeQuery: '',
    activeLocation: '',
    useCurrentLocation: false
  });

  // Callback to receive search state from EnhancedSearchBar
  const handleSearchChange = useCallback((
    results: StoreWithDistance[], 
    isLoading: boolean, 
    hasSearched: boolean
  ) => {
    setSearchState(prev => ({
      ...prev,
      results,
      isLoading,
      hasSearched
    }));
  }, []);

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickSearchValue.trim() || locationValue.trim()) {
      setSearchState(prev => ({
        ...prev,
        activeQuery: quickSearchValue,
        activeLocation: locationValue,
        hasSearched: true
      }));
      setShowSearchSheet(true);
    }
  };

  const handleClearSearch = () => {
    setQuickSearchValue('');
    setLocationValue('');
    setSearchState({
      results: [],
      isLoading: false,
      hasSearched: false,
      activeQuery: '',
      activeLocation: '',
      useCurrentLocation: false
    });
  };

  const hasCurrentLocation = !!(latitude && longitude);

  if (!isMobile) {
    // Desktop fallback - show regular search
    return (
      <div className={className}>
        <EnhancedSearchBar 
          onSearchChange={handleSearchChange}
          initialQuery={searchState.activeQuery}
          initialLocation={searchState.activeLocation}
          initialUseCurrentLocation={searchState.useCurrentLocation}
        />
        <div className="mt-6">
          <EnhancedSearchResults
            stores={searchState.results}
            isLoading={searchState.isLoading}
            error={null}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search Card with Store & Location inputs */}
      <Card className="p-4">
        <form onSubmit={handleQuickSearch} className="space-y-3">
          {/* Store Name Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              value={quickSearchValue}
              onChange={(e) => setQuickSearchValue(e.target.value)}
              placeholder="Store name (e.g. Walmart, McDonald's)"
              className="pl-10 h-12 text-base rounded-xl"
            />
          </div>

          {/* Location Input */}
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              value={locationValue}
              onChange={(e) => setLocationValue(e.target.value)}
              placeholder="City, State or ZIP code"
              className="pl-10 pr-12 h-12 text-base rounded-xl"
            />
            {hasCurrentLocation && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setLocationValue('');
                  setSearchState(prev => ({
                    ...prev,
                    useCurrentLocation: true,
                    hasSearched: true
                  }));
                  setShowSearchSheet(true);
                }}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                title="Use my location"
              >
                <Navigation className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Search Button */}
          <Button type="submit" className="w-full h-11">
            <Search className="h-4 w-4 mr-2" />
            Search Stores
          </Button>
        </form>

        {/* Advanced Search Sheet */}
        <Sheet open={showSearchSheet} onOpenChange={setShowSearchSheet}>
          <SheetContent side="bottom" className="h-[90vh] overflow-hidden">
            <SheetHeader>
              <SheetTitle>Search Results</SheetTitle>
            </SheetHeader>
            <div className="mt-4 h-full overflow-y-auto pb-20">
              <EnhancedSearchBar 
                onSearchChange={handleSearchChange}
                initialQuery={searchState.activeQuery}
                initialLocation={searchState.activeLocation}
                initialUseCurrentLocation={searchState.useCurrentLocation}
              />
              <div className="mt-6">
                <EnhancedSearchResults
                  stores={searchState.results}
                  isLoading={searchState.isLoading}
                  error={null}
                />
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </Card>


      {/* Current Search Status */}
      {searchState.hasSearched && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Active Search</span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleClearSearch}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {searchState.activeQuery && (
              <Badge variant="secondary">
                "{searchState.activeQuery}"
              </Badge>
            )}
            {searchState.activeLocation && (
              <Badge variant="secondary">
                <MapPin className="h-3 w-3 mr-1" />
                {searchState.activeLocation}
              </Badge>
            )}
            {searchState.useCurrentLocation && (
              <Badge variant="secondary">
                <Navigation className="h-3 w-3 mr-1" />
                Current Location
              </Badge>
            )}
          </div>

          <div className="mt-3 text-sm text-muted-foreground">
            {searchState.isLoading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-3 w-3 border border-primary border-t-transparent"></div>
                Searching...
              </div>
            ) : (
              <>
                {searchState.results.length} store{searchState.results.length !== 1 ? 's' : ''} found
              </>
            )}
          </div>
        </Card>
      )}

      {/* Quick Results Preview */}
      {searchState.results.length > 0 && !showSearchSheet && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium">Search Results</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSearchSheet(true)}
            >
              View All ({searchState.results.length})
            </Button>
          </div>
          
          <div className="space-y-2">
            {searchState.results.slice(0, 3).map((store) => (
              <div
                key={store.id}
                className="flex items-center justify-between p-2 bg-muted/50 rounded-lg"
              >
                <div>
                  <div className="font-medium text-sm">{store.Store_Name}</div>
                  <div className="text-xs text-muted-foreground">
                    {store.Store_Street_Address}
                  </div>
                </div>
                {store.distance && (
                  <Badge variant="outline" className="text-xs">
                    {store.distance.toFixed(1)} mi
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};