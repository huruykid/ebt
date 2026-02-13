import React, { useState, useRef } from 'react';
import { CategoryTabs } from './CategoryTabs';
import { LoadingSpinner } from './LoadingSpinner';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useZipCodeSearch } from '@/hooks/useZipCodeSearch';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { UnifiedStoreCard } from './UnifiedStoreCard';
import { SEOFooter } from './SEOFooter';
import { FAQSection } from './FAQSection';
import { HeroSearch, SnapTipsSection, PersonalizedDashboard } from './home';
import { useAuth } from '@/contexts/AuthContext';
import { MapPin } from 'lucide-react';
import { Button } from './ui/button';

export const ExploreTrending: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('trending');
  const [selectedStoreTypes, setSelectedStoreTypes] = useState<string[]>([]);
  const navigate = useNavigate();
  const resultsRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  
  const { latitude, longitude, loading, source, city, requestBrowserLocation } = useGeolocation();

  // Fetch nearby stores when location is available
  const { data: nearbyStores = [], isLoading: nearbyLoading } = useQuery({
    queryKey: ['home-nearby-stores', latitude, longitude, activeCategory, selectedStoreTypes],
    queryFn: async () => {
      if (!latitude || !longitude) return [];
      
      const storeTypesParam = selectedStoreTypes.length > 0 ? selectedStoreTypes : undefined;
      
      const { data, error } = await supabase.rpc('get_nearby_stores', {
        user_lat: latitude,
        user_lng: longitude,
        radius_miles: 10,
        result_limit: 20,
        store_types: storeTypesParam,
      });
      
      if (error) {
        console.error('Error fetching nearby stores:', error);
        return [];
      }
      
      // Map RPC lowercase fields to PascalCase for UI components
      return (data || []).map((s: any) => ({
        id: s.id,
        Store_Name: s.store_name,
        Store_Street_Address: s.store_street_address,
        City: s.city,
        State: s.state,
        Zip_Code: s.zip_code,
        Store_Type: s.store_type,
        Latitude: s.latitude,
        Longitude: s.longitude,
        distance: s.distance_miles,
      }));
    },
    enabled: !!latitude && !!longitude,
    staleTime: 5 * 60 * 1000,
  });

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
    // Always request browser GPS for precise location
    requestBrowserLocation();
    handleClearSearch();
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleCategoryChange = (categoryId: string, storeTypes?: string[]) => {
    setActiveCategory(categoryId);
    setSelectedStoreTypes(storeTypes || []);
  };

  const showZipResults = isSearchActive;

  const StoreListSimple = ({ stores }: { stores: any[] }) => (
    <div className="grid grid-cols-1 gap-3">
      {stores.map((store) => (
        <UnifiedStoreCard key={store.id} store={store} />
      ))}
    </div>
  );

  const ExactLocationPrompt = () => {
    if (source === 'browser' || !latitude || !longitude) return null;
    return (
      <div className="flex items-center justify-between bg-muted/50 rounded-lg px-3 py-2 mb-3">
        <p className="text-xs text-muted-foreground">
          Showing stores near {city || 'your area'} (approximate)
        </p>
        <Button variant="ghost" size="sm" className="text-xs h-7 px-2" onClick={requestBrowserLocation}>
          <MapPin className="h-3 w-3 mr-1" />
          Use exact location
        </Button>
      </div>
    );
  };

  const NoLocationPrompt = () => (
    <div className="text-center py-16">
      <MapPin className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
      <h3 className="text-base font-semibold mb-1.5">Find stores near you</h3>
      <p className="text-sm text-muted-foreground mb-4">Enable location or search by ZIP code</p>
      <Button onClick={requestBrowserLocation} size="sm">
        <MapPin className="h-4 w-4 mr-2" />
        Use My Location
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Layout */}
      <div className="md:hidden flex flex-col min-h-screen">
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
          onRequestLocation={requestBrowserLocation}
          variant="mobile"
        />

        {user && !showZipResults && (
          <div className="px-4 mt-2">
            <PersonalizedDashboard latitude={latitude} longitude={longitude} />
          </div>
        )}

        <div className="px-4 mt-3">
          <CategoryTabs onCategoryChange={handleCategoryChange} />
        </div>

        <main ref={resultsRef} className="flex-1 px-4 py-4 space-y-6">
          {showZipResults ? (
            <div className="animate-fade-in">
              {zipLoading ? <LoadingSpinner /> : <StoreListSimple stores={zipStores} />}
            </div>
          ) : latitude && longitude ? (
            <div className="animate-fade-in">
              <ExactLocationPrompt />
              {nearbyLoading ? <LoadingSpinner /> : (
                <>
                  <StoreListSimple stores={nearbyStores} />
                  {nearbyStores.length >= 20 && (
                    <Button variant="ghost" size="sm" className="w-full mt-2" onClick={() => navigate('/search')}>
                      <MapPin className="h-4 w-4 mr-1.5" />
                      View all nearby stores
                    </Button>
                  )}
                </>
              )}
            </div>
          ) : (
            <NoLocationPrompt />
          )}
          
          <SnapTipsSection />
          <FAQSection />
          <SEOFooter />
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

        <div className="border-b border-border">
          <div className="max-w-3xl mx-auto px-6 py-3">
            <CategoryTabs onCategoryChange={handleCategoryChange} className="flex justify-center" />
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-6 py-8">
          {user && !showZipResults && (
            <div className="mb-8">
              <PersonalizedDashboard latitude={latitude} longitude={longitude} />
            </div>
          )}

          {showZipResults ? (
            <div className="space-y-4 animate-fade-in">
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold text-foreground">
                  EBT Stores in {activeZipCode}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {zipStores.length} store{zipStores.length !== 1 ? 's' : ''} found
                </p>
              </div>
              {zipLoading ? <LoadingSpinner /> : <StoreListSimple stores={zipStores} />}
            </div>
          ) : latitude && longitude ? (
            <div className="space-y-4 animate-fade-in">
              <ExactLocationPrompt />
              {nearbyLoading ? <LoadingSpinner /> : (
                <>
                  <StoreListSimple stores={nearbyStores} />
                  {nearbyStores.length >= 20 && (
                    <div className="text-center pt-2">
                      <Button onClick={() => navigate('/search')} size="sm">
                        <MapPin className="h-4 w-4 mr-2" />
                        View all nearby stores
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            <NoLocationPrompt />
          )}
        </div>
        
        <div className="max-w-3xl mx-auto px-6 space-y-8 pb-8">
          <SnapTipsSection />
          <FAQSection />
        </div>
        <SEOFooter />
      </div>
    </div>
  );
};

export default ExploreTrending;
