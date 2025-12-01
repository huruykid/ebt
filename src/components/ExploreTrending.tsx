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
        
        {/* SNAP Tips Section - Desktop Only with SEO optimization */}
        <section className="bg-gradient-to-r from-success/5 to-primary/5 py-16" itemScope itemType="https://schema.org/Article">
          <div className="max-w-4xl mx-auto px-6">
            <Card className="bg-white/80 backdrop-blur-sm border-success/20 shadow-lg">
              <CardContent className="p-8">
                <header className="text-center mb-6">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <Utensils className="h-8 w-8 text-success" aria-hidden="true" />
                    <h2 className="text-3xl font-bold text-foreground" itemProp="headline">
                      Maximize Your SNAP Benefits in 2025
                    </h2>
                  </div>
                  <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-6" itemProp="description">
                    Discover money-saving programs, eligible items, and insider tips to get the most out of your EBT benefits. Learn about Double Up Food Bucks, Restaurant Meals Program, and 2025 policy updates.
                  </p>
                </header>
                
                <div className="bg-white rounded-xl p-6 border border-success/20 shadow-sm" itemScope itemType="https://schema.org/HowTo">
                  <div className="flex items-start gap-6">
                    <div className="bg-success/10 p-4 rounded-xl" aria-hidden="true">
                      <Star className="h-8 w-8 text-success" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-foreground mb-3 text-xl" itemProp="name">
                        Complete 2025 SNAP Tips & Tricks Guide
                      </h3>
                      <div className="text-muted-foreground mb-4 space-y-2" itemProp="description">
                        <p itemProp="step" itemScope itemType="https://schema.org/HowToStep">
                          • <strong>Double Up Food Bucks:</strong> <span itemProp="text">Match your SNAP dollars on fresh produce up to $30 per day at participating farmers markets</span>
                        </p>
                        <p itemProp="step" itemScope itemType="https://schema.org/HowToStep">
                          • <strong>Surprising eligible items:</strong> <span itemProp="text">Purchase birthday cakes, coffee, seeds, plants, and frozen prepared meals with EBT</span>
                        </p>
                        <p itemProp="step" itemScope itemType="https://schema.org/HowToStep">
                          • <strong>Restaurant Meals Program:</strong> <span itemProp="text">Use EBT at participating restaurants in select states for prepared meals</span>
                        </p>
                        <p itemProp="step" itemScope itemType="https://schema.org/HowToStep">
                          • <strong>2025 policy updates:</strong> <span itemProp="text">New work requirements and benefit changes affecting eligibility</span>
                        </p>
                      </div>
                      <Button 
                        asChild 
                        size="lg"
                        className="bg-success hover:bg-success/90 text-white hover:scale-105 transition-all duration-200 shadow-md"
                      >
                        <a 
                          href="/snap-tips" 
                          className="flex items-center gap-2"
                          aria-label="View complete SNAP benefits guide and money-saving tips"
                          title="Complete 2025 SNAP Tips Guide - Double Up Food Bucks & More"
                        >
                          View Complete Guide
                          <ArrowRight className="h-5 w-5" aria-hidden="true" />
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Schema.org structured data for SNAP tips */}
            <script 
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "HowTo",
                  "name": "How to Maximize Your SNAP Benefits in 2025",
                  "description": "Complete guide to getting the most out of your EBT benefits including Double Up Food Bucks, eligible items, and policy updates",
                  "image": "https://ebtfinder.org/ebt-logo.png",
                  "totalTime": "PT10M",
                  "supply": [
                    {
                      "@type": "HowToSupply",
                      "name": "EBT Card"
                    }
                  ],
                  "step": [
                    {
                      "@type": "HowToStep",
                      "name": "Use Double Up Food Bucks Programs",
                      "text": "Match your SNAP dollars on fresh produce up to $30 per day at participating farmers markets across multiple states including Michigan, Colorado, and Arizona."
                    },
                    {
                      "@type": "HowToStep", 
                      "name": "Know What You Can Buy",
                      "text": "Purchase surprising eligible items like birthday cakes, coffee, seeds, plants, frozen prepared meals, and food-producing plants with your EBT card."
                    },
                    {
                      "@type": "HowToStep",
                      "name": "Access Restaurant Meals Program",
                      "text": "Use EBT at participating restaurants in select states like California, New York, Arizona, Illinois, Virginia, and Michigan if you qualify."
                    },
                    {
                      "@type": "HowToStep",
                      "name": "Stay Updated on Policy Changes", 
                      "text": "Be aware of 2025 policy updates including new work requirements for able-bodied adults and potential benefit changes."
                    }
                  ],
                  "url": "https://ebtfinder.org/snap-tips"
                })
              }}
            />
          </div>
        </section>
        
        {/* FAQ Section */}
        <FAQSection />
        
        {/* SEO Footer */}
        <SEOFooter />
      </div>
    </div>
  );
};

export default ExploreTrending;
