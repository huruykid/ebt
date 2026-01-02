import React, { useState, useRef } from 'react';
import { CategoryTabs } from './CategoryTabs';
import { StoreList } from './StoreList';
import { LoadingSpinner } from './LoadingSpinner';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useZipCodeSearch } from '@/hooks/useZipCodeSearch';
import { useNavigate } from 'react-router-dom';
import MobileNearbyStoresSection from './MobileNearbyStoresSection';
import DesktopNearbyStoresSection from './DesktopNearbyStoresSection';
import NoLocationExperience from './NoLocationExperience';
import { SEOFooter } from './SEOFooter';
import { FAQSection } from './FAQSection';
import { HeroSearch, SnapTipsSection } from './home';
import { LocationAccuracyBanner } from './LocationAccuracyBanner';

export const ExploreTrending: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('trending');
  const [selectedStoreTypes, setSelectedStoreTypes] = useState<string[]>([]);
  const navigate = useNavigate();
  const resultsRef = useRef<HTMLDivElement>(null);
  
  const { latitude, longitude, loading, source, city, region, requestBrowserLocation } = useGeolocation();

  const {
    activeZipCode,
    zipStores,
    isLoading: zipLoading,
    errorMessage,
    noResultsMessage,
    handleZipSearch,
    handleClearSearch,
    isSearchActive
  } = useZipCodeSearch({
    activeCategory,
    selectedStoreTypes,
    selectedNamePatterns: []
  });

  const handleCurrentLocationSearch = () => {
    // If we don't have location yet, request it
    if (!latitude || !longitude) {
      requestBrowserLocation();
      return;
    }
    
    // Already have location - clear any active ZIP search to show nearby stores
    handleClearSearch();
    // Smooth scroll to results
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleCategoryChange = (categoryId: string, storeTypes?: string[]) => {
    setActiveCategory(categoryId);
    setSelectedStoreTypes(storeTypes || []);
  };

  const handleRequestLocation = () => {
    // Request browser location - will fallback to IP if denied
    requestBrowserLocation();
  };

  const showZipResults = isSearchActive;

  return (
    <div className="min-h-screen bg-white">
      {/* Mobile Layout */}
      <div className="md:hidden bg-white flex max-w-[480px] w-full flex-col overflow-hidden items-stretch mx-auto min-h-screen">
        <HeroSearch
          onZipSearch={handleZipSearch}
          onClearSearch={handleClearSearch}
          isSearchActive={isSearchActive}
          activeZip={activeZipCode || undefined}
          errorMessage={errorMessage}
          noResultsMessage={noResultsMessage}
          latitude={latitude}
          longitude={longitude}
          loading={loading}
          onCurrentLocationSearch={handleCurrentLocationSearch}
          onRequestLocation={handleRequestLocation}
          variant="mobile"
        />

        {/* Compact category tabs */}
        <div className="min-h-[100px]">
          <CategoryTabs onCategoryChange={handleCategoryChange} className="mt-2 px-3" />
        </div>

        <main ref={resultsRef} className="flex-1 self-center flex w-full max-w-[400px] flex-col items-center mt-2 px-3 pb-6">
          {/* Location accuracy banner - mobile */}
          {!showZipResults && (
            <div className="w-full mb-3">
              <LocationAccuracyBanner
                source={source}
                loading={loading}
                onUpgradeLocation={requestBrowserLocation}
                city={city}
                region={region}
              />
            </div>
          )}
          
          {showZipResults ? (
            <div className="w-full animate-fade-in">
              {zipLoading ? (
                <div className="flex justify-center py-6">
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
              onSmartSearch={() => {}}
              onRequestLocation={handleRequestLocation}
            />
          )}
          
          {/* Mobile SNAP Tips & FAQ */}
          <div className="w-full mt-6 space-y-4">
            <SnapTipsSection />
            <FAQSection />
          </div>
        </main>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:block">
        <HeroSearch
          onZipSearch={handleZipSearch}
          onClearSearch={handleClearSearch}
          isSearchActive={isSearchActive}
          activeZip={activeZipCode || undefined}
          errorMessage={errorMessage}
          noResultsMessage={noResultsMessage}
          latitude={latitude}
          longitude={longitude}
          loading={loading}
          onCurrentLocationSearch={handleCurrentLocationSearch}
          variant="desktop"
        />

        {/* Category Tabs - Desktop */}
        <div className="bg-background border-b">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <CategoryTabs onCategoryChange={handleCategoryChange} className="flex justify-center" />
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Location accuracy banner - desktop */}
          {!showZipResults && (
            <div className="mb-6">
              <LocationAccuracyBanner
                source={source}
                loading={loading}
                onUpgradeLocation={requestBrowserLocation}
                city={city}
                region={region}
              />
            </div>
          )}
          
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
                onRequestLocation={handleRequestLocation}
              />
            </>
          )}
        </div>
        
        {/* SNAP Tips Section */}
        <SnapTipsSection />
        
        {/* FAQ Section */}
        <FAQSection />
        
        {/* SEO Footer */}
        <SEOFooter />
      </div>
    </div>
  );
};

export default ExploreTrending;
