import React, { useState, useRef } from 'react';
import { CategoryTabs } from './CategoryTabs';
import { LoadingSpinner } from './LoadingSpinner';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useZipCodeSearch } from '@/hooks/useZipCodeSearch';
import { useNavigate } from 'react-router-dom';
import { UnifiedStoreCard } from './UnifiedStoreCard';
import { SEOFooter } from './SEOFooter';
import { FAQSection } from './FAQSection';
import { HeroSearch, SnapTipsSection, PersonalizedDashboard } from './home';
import { useAuth } from '@/contexts/AuthContext';
import { useLocationBasedSearch } from '@/hooks/useLocationBasedSearch';
import { MapPin } from 'lucide-react';
import { Button } from './ui/button';

export const ExploreTrending: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('trending');
  const [selectedStoreTypes, setSelectedStoreTypes] = useState<string[]>([]);
  const navigate = useNavigate();
  const resultsRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  
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
    if (!latitude || !longitude) {
      requestBrowserLocation();
      return;
    }
    handleClearSearch();
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleCategoryChange = (categoryId: string, storeTypes?: string[]) => {
    setActiveCategory(categoryId);
    setSelectedStoreTypes(storeTypes || []);
  };

  const handleRequestLocation = () => {
    requestBrowserLocation();
  };

  const showZipResults = isSearchActive;

  const StoreListSimple = ({ stores }: { stores: any[] }) => (
    <div className="grid grid-cols-1 gap-4">
      {stores.map((store) => (
        <UnifiedStoreCard key={store.id} store={store} />
      ))}
    </div>
  );

  const NoLocationPrompt = () => (
    <div className="text-center py-12">
      <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
      <h3 className="text-lg font-semibold mb-2">Find stores near you</h3>
      <p className="text-muted-foreground mb-4">Enable location or search by ZIP code to find nearby EBT stores.</p>
      <Button onClick={handleRequestLocation}>
        <MapPin className="h-4 w-4 mr-2" />
        Use My Location
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Mobile Layout */}
      <div className="md:hidden bg-white flex w-full flex-col overflow-hidden items-stretch mx-auto min-h-screen">
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

        {user && !showZipResults && (
          <div className="px-3 mt-3">
            <PersonalizedDashboard latitude={latitude} longitude={longitude} />
          </div>
        )}

        <div className="min-h-[100px]">
          <CategoryTabs onCategoryChange={handleCategoryChange} className="mt-2 px-3" />
        </div>

        <main ref={resultsRef} className="flex-1 self-center flex w-full flex-col items-center mt-2 px-4 pb-6">
          {showZipResults ? (
            <div className="w-full animate-fade-in">
              {zipLoading ? (
                <div className="flex justify-center py-6">
                  <LoadingSpinner />
                </div>
              ) : (
                <StoreListSimple stores={zipStores} />
              )}
            </div>
          ) : latitude && longitude ? (
            <div className="w-full">
              <Button variant="ghost" size="sm" className="mb-3" onClick={() => navigate('/search')}>
                <MapPin className="h-4 w-4 mr-1" />
                View all nearby stores
              </Button>
            </div>
          ) : (
            <NoLocationPrompt />
          )}
          
          <div className="w-full mt-6 space-y-4">
            <SnapTipsSection />
            <FAQSection />
            <SEOFooter />
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

        <div className="bg-background border-b">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <CategoryTabs onCategoryChange={handleCategoryChange} className="flex justify-center" />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">
          {user && !showZipResults && (
            <div className="mb-8">
              <PersonalizedDashboard latitude={latitude} longitude={longitude} />
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
                <StoreListSimple stores={zipStores} />
              )}
            </div>
          ) : latitude && longitude ? (
            <div className="text-center py-8">
              <Button onClick={() => navigate('/search')}>
                <MapPin className="h-4 w-4 mr-2" />
                Search nearby stores
              </Button>
            </div>
          ) : (
            <NoLocationPrompt />
          )}
        </div>
        
        <SnapTipsSection />
        <FAQSection />
        <SEOFooter />
      </div>
    </div>
  );
};

export default ExploreTrending;
