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
import { MobileHeader } from './MobileHeader';
import { DesktopHeroSection } from './DesktopHeroSection';
import { SEOFooter } from './SEOFooter';
import { FAQSection } from './FAQSection';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, ArrowRight, Utensils } from 'lucide-react';

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
    console.log('Category changed to:', categoryId, 'Store types:', storeTypes);
  };

  const handleRequestLocation = () => {
    window.location.reload();
  };

  // Show ZIP search results if active, otherwise show location-based results
  const showZipResults = isSearchActive;
  const showLocationResults = !isSearchActive && latitude && longitude;

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Layout */}
      <div className="md:hidden bg-neutral-100 flex max-w-[480px] w-full flex-col overflow-hidden items-stretch mx-auto min-h-screen">
        <MobileHeader
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
        />

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
              onSmartSearch={() => {}}
              onRequestLocation={handleRequestLocation}
            />
          )}
        </main>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:block">
        <DesktopHeroSection
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
        />

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
                  onSmartSearch={() => {}}
                  onRequestLocation={handleRequestLocation}
                />
              )}
            </>
          )}
        </div>
        
        {/* SNAP Tips Section - Desktop Only */}
        <div className="bg-gradient-to-r from-success/5 to-primary/5 py-16">
          <div className="max-w-4xl mx-auto px-6">
            <Card className="bg-white/80 backdrop-blur-sm border-success/20 shadow-lg">
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <Utensils className="h-8 w-8 text-success" />
                    <h2 className="text-3xl font-bold text-foreground">Maximize Your SNAP Benefits</h2>
                  </div>
                  <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-6">
                    Discover money-saving programs, eligible items, and insider tips to get the most out of your EBT benefits in 2025.
                  </p>
                </div>
                
                <div className="bg-white rounded-xl p-6 border border-success/20 shadow-sm">
                  <div className="flex items-start gap-6">
                    <div className="bg-success/10 p-4 rounded-xl">
                      <Star className="h-8 w-8 text-success" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-foreground mb-3 text-xl">Complete 2025 SNAP Tips & Tricks Guide</h3>
                      <div className="text-muted-foreground mb-4 space-y-2">
                        <p>• <strong>Double Up Food Bucks:</strong> Match your SNAP dollars on produce (up to $30/day)</p>
                        <p>• <strong>Surprising eligible items:</strong> Birthday cakes, coffee, seeds, and more</p>
                        <p>• <strong>Restaurant Meals Program:</strong> Use EBT at participating restaurants</p>
                        <p>• <strong>2025 policy updates:</strong> New work requirements and benefit changes</p>
                      </div>
                      <Button 
                        asChild 
                        size="lg"
                        className="bg-success hover:bg-success/90 text-white hover:scale-105 transition-all duration-200 shadow-md"
                      >
                        <a href="/snap-tips" className="flex items-center gap-2">
                          View Complete Guide
                          <ArrowRight className="h-5 w-5" />
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* FAQ Section */}
        <FAQSection />
        
        {/* SEO Footer */}
        <SEOFooter />
      </div>
    </div>
  );
};

export default ExploreTrending;
