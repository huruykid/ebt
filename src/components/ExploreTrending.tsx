
import React, { useState } from 'react';
import { CategoryTabs } from './CategoryTabs';
import { NearbyStores } from './NearbyStores';
import { StoreList } from './StoreList';
import { ZipCodeSearch } from './ZipCodeSearch';
import { LocationPrompt } from './LocationPrompt';
import { LoadingSpinner } from './LoadingSpinner';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useZipCodeSearch } from '@/hooks/useZipCodeSearch';
import { useNavigate } from 'react-router-dom';
import { MapPin, Heart, Navigation, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MobileNearbyStoresSection from './MobileNearbyStoresSection';
import DesktopNearbyStoresSection from './DesktopNearbyStoresSection';
import NoLocationExperience from './NoLocationExperience';

export const ExploreTrending: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('trending');
  const [selectedStoreTypes, setSelectedStoreTypes] = useState<string[]>([]);
  const navigate = useNavigate();
  const {
    latitude,
    longitude,
    error,
    loading
  } = useGeolocation();

  const {
    activeZipCode,
    zipStores,
    isLoading: zipLoading,
    errorMessage,
    noResultsMessage,
    handleZipSearch,
    handleClearSearch,
    isSearchActive
  } = useZipCodeSearch();

  const handleLocationSearch = (lat: number, lng: number) => {
    console.log('Location search:', lat, lng);
    navigate('/search');
  };

  const handleCurrentLocationSearch = () => {
    if (latitude && longitude) {
      handleLocationSearch(latitude, longitude);
    }
  };

  const handleCategoryChange = (categoryId: string, storeTypes?: string[]) => {
    setActiveCategory(categoryId);
    setSelectedStoreTypes(storeTypes || []);
    console.log('Category changed to:', categoryId, 'Store types:', storeTypes);
  };

  const handleRequestLocation = () => {
    // Trigger a page reload to re-request location permission
    window.location.reload();
  };

  // Show ZIP search results if active, otherwise show location-based results
  const showZipResults = isSearchActive;
  const showLocationResults = !isSearchActive && latitude && longitude;

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Layout */}
      <div className="md:hidden bg-neutral-100 flex max-w-[480px] w-full flex-col overflow-hidden items-stretch mx-auto min-h-screen">
        <div className="flex w-full flex-col items-stretch px-3.5 pt-3">
          <div className="text-center mb-4">
            <h1 className="text-2xl font-bold text-foreground mb-2">Find SNAP / EBT Stores</h1>
            <p className="text-sm text-muted-foreground px-2">
              Discover grocery stores, restaurants, and retailers that accept EBT/SNAP benefits near your location.
            </p>
          </div>
          
          {/* ZIP Code Search - Mobile - More prominent placement */}
          <div className="mb-6 bg-white rounded-lg p-4 shadow-sm border">
            <h3 className="text-sm font-medium text-foreground mb-3">Search by ZIP Code</h3>
            <ZipCodeSearch
              onZipSearch={handleZipSearch}
              onClearSearch={handleClearSearch}
              isSearchActive={isSearchActive}
              activeZip={activeZipCode || undefined}
              errorMessage={errorMessage}
              noResultsMessage={noResultsMessage}
            />
          </div>
          
          {/* Current Location Search Button - Mobile */}
          {!isSearchActive && latitude && longitude && (
            <div className="mb-4">
              <Button
                onClick={handleCurrentLocationSearch}
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
                onClick={handleRequestLocation}
                size="sm"
                className="w-full"
              >
                <MapPin className="h-4 w-4 mr-2" />
                Enable Location Access
              </Button>
            </div>
          )}
        </div>

        <CategoryTabs onCategoryChange={handleCategoryChange} className="mt-4 px-3.5" />

        <main className="flex-1 self-center flex w-full max-w-[400px] flex-col items-center mt-4 px-4">
          {showZipResults ? (
            <div className="w-full">
              {zipLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : (
                <StoreList stores={zipStores} />
              )}
            </div>
          ) : (
            <MobileNearbyStoresSection
              loading={loading}
              latitude={latitude}
              longitude={longitude}
              activeCategory={activeCategory}
              selectedStoreTypes={selectedStoreTypes}
              onSmartSearch={() => {}} // Remove search functionality
              onRequestLocation={handleRequestLocation}
            />
          )}
        </main>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:block">
        {/* Hero Section */}
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
                  onZipSearch={handleZipSearch}
                  onClearSearch={handleClearSearch}
                  isSearchActive={isSearchActive}
                  activeZip={activeZipCode || undefined}
                  errorMessage={errorMessage}
                  noResultsMessage={noResultsMessage}
                />
              </div>
              
              {/* Current Location Search Button - Desktop */}
              {!isSearchActive && latitude && longitude && (
                <div className="max-w-2xl mx-auto">
                  <Button
                    onClick={handleCurrentLocationSearch}
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

        {/* Category Tabs - Desktop */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <CategoryTabs onCategoryChange={handleCategoryChange} className="flex justify-center" />
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          {showZipResults ? (
            <div className="space-y-4">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  EBT Stores in ZIP {activeZipCode}
                </h2>
                <p className="text-muted-foreground">
                  {zipStores.length} store{zipStores.length !== 1 ? 's' : ''} found
                </p>
              </div>
              {zipLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : (
                <StoreList stores={zipStores} />
              )}
            </div>
          ) : (
            <>
              <DesktopNearbyStoresSection
                loading={loading}
                latitude={latitude}
                longitude={longitude}
                activeCategory={activeCategory}
                selectedStoreTypes={selectedStoreTypes}
              />
              {(!latitude && !longitude && !loading) && (
                <NoLocationExperience
                  onSmartSearch={() => {}} // Remove search functionality
                  onRequestLocation={handleRequestLocation}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExploreTrending;
