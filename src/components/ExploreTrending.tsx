import React, { useState } from 'react';
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

export const ExploreTrending: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('trending');
  const [selectedStoreTypes, setSelectedStoreTypes] = useState<string[]>([]);
  const navigate = useNavigate();
  
  const { latitude, longitude, loading } = useGeolocation();

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
  };

  const handleRequestLocation = () => {
    window.location.reload();
  };

  const showZipResults = isSearchActive;

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Layout */}
      <div className="md:hidden bg-muted flex max-w-[480px] w-full flex-col overflow-hidden items-stretch mx-auto min-h-screen">
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

        {/* Fixed height container prevents CLS */}
        <div className="min-h-[154px]">
          <CategoryTabs onCategoryChange={handleCategoryChange} className="mt-4 px-3.5" />
        </div>

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
              onSmartSearch={() => {}}
              onRequestLocation={handleRequestLocation}
            />
          )}
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
        <div className="bg-card border-b">
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
                  onSmartSearch={() => {}}
                  onRequestLocation={handleRequestLocation}
                />
              )}
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
