import React, { useState } from 'react';
import { SmartSearchBar } from './SmartSearchBar';
import { CategoryTabs } from './CategoryTabs';
import { NearbyStores } from './NearbyStores';
import { LocationPrompt } from './LocationPrompt';
import { LoadingSpinner } from './LoadingSpinner';
import { FeaturedStoreTypes } from './FeaturedStoreTypes';
import { SearchSuggestions } from './SearchSuggestions';
import { EbtInfoSection } from './EbtInfoSection';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useNavigate } from 'react-router-dom';
import { MapPin, Search, Heart, Navigation, Info } from 'lucide-react';
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

  const handleSmartSearch = (searchText: string, city?: string, zipCode?: string) => {
    // Build URL params for the search page
    const params = new URLSearchParams();
    if (searchText) params.set('q', searchText);
    if (city) params.set('city', city);
    if (zipCode) params.set('zip', zipCode);
    
    navigate(`/search?${params.toString()}`);
  };

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

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Layout */}
      <div className="md:hidden bg-neutral-100 flex max-w-[480px] w-full flex-col overflow-hidden items-stretch mx-auto min-h-screen">
        <div className="flex w-full flex-col items-stretch px-3.5 pt-3">
          <div className="text-center mb-4">
            <h1 className="text-2xl font-bold text-foreground mb-2">Find SNAP / EBT Stores</h1>
            <p className="text-sm text-muted-foreground px-2">
              Discover grocery stores, restaurants, and retailers that accept EBT/SNAP benefits in your area. 
              Save time and shop with confidence.
            </p>
          </div>
          
          <SmartSearchBar onSearch={handleSmartSearch} className="mt-4" />
          
          {/* Current Location Search Button - Mobile */}
          {latitude && longitude && (
            <Button
              onClick={handleCurrentLocationSearch}
              variant="outline"
              className="mt-3 w-full"
              disabled={loading}
            >
              <Navigation className="h-4 w-4 mr-2" />
              Search near your current location
            </Button>
          )}
        </div>

        <CategoryTabs onCategoryChange={handleCategoryChange} className="mt-4 px-3.5" />

        <main className="flex-1 self-center flex w-full max-w-[400px] flex-col items-center mt-4 px-4">
          <MobileNearbyStoresSection
            loading={loading}
            latitude={latitude}
            longitude={longitude}
            activeCategory={activeCategory}
            selectedStoreTypes={selectedStoreTypes}
            onSmartSearch={handleSmartSearch}
            onRequestLocation={handleRequestLocation}
          />
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
                Discover grocery stores, restaurants, and retailers that accept EBT/SNAP benefits in your area. 
                Save time and shop with confidence.
              </p>
              
              {/* Search Bar - Desktop */}
              <div className="max-w-2xl mx-auto space-y-4">
                <SmartSearchBar onSearch={handleSmartSearch} className="text-lg" />
                
                {/* Current Location Search Button - Desktop */}
                {latitude && longitude && (
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
                )}
              </div>

              {/* Quick Stats */}
              <div className="flex justify-center gap-8 mt-8 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>Location-based results</span>
                </div>
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  <span>Real-time store data</span>
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
          <DesktopNearbyStoresSection
            loading={loading}
            latitude={latitude}
            longitude={longitude}
            activeCategory={activeCategory}
            selectedStoreTypes={selectedStoreTypes}
          />
          {(!latitude && !longitude && !loading) && (
            <NoLocationExperience
              onSmartSearch={handleSmartSearch}
              onRequestLocation={handleRequestLocation}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ExploreTrending;
