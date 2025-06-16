
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CategorySearchResults } from './CategorySearchResults';
import { useStoreSearch } from '@/hooks/useStoreSearch';
import { useGeolocation } from '@/hooks/useGeolocation';
import type { Tables } from '@/integrations/supabase/types';

type Store = Tables<'snap_stores'>;

interface StoreWithDistance extends Store {
  distance?: number;
}

export const SearchContainer: React.FC = () => {
  const navigate = useNavigate();
  const { latitude, longitude, loading: locationLoading } = useGeolocation();
  
  const {
    activeCategory,
    selectedStoreTypes,
    locationSearch,
    setLocationSearch,
    sortBy,
    setSortBy,
    radius,
    setRadius,
    stores,
    isLoading: categoryLoading,
    error: categoryError,
    handleCategoryChange,
  } = useStoreSearch();

  // Automatically set location search when geolocation is available
  useEffect(() => {
    if (latitude && longitude && !locationSearch) {
      setLocationSearch({ lat: latitude, lng: longitude });
    }
  }, [latitude, longitude, locationSearch, setLocationSearch]);

  const handleLocationSearch = (latitude: number, longitude: number) => {
    setLocationSearch({ lat: latitude, lng: longitude });
    navigate('/search', { replace: true });
  };

  const handleCategorySelect = (categoryId: string, storeTypes?: string[], namePatterns?: string[]) => {
    handleCategoryChange(categoryId, storeTypes, namePatterns);
  };

  const currentStores: StoreWithDistance[] = stores || [];
  const isLoading = categoryLoading || locationLoading;

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">Find SNAP/EBT Stores</h1>
          <p className="text-muted-foreground">
            Discover stores near your current location that accept EBT/SNAP benefits
          </p>
        </div>

        {latitude && longitude && (
          <div className="text-center">
            <button
              onClick={() => handleLocationSearch(latitude, longitude)}
              disabled={locationLoading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Search near your current location
            </button>
          </div>
        )}
      </div>

      <CategorySearchResults
        stores={currentStores}
        isLoading={isLoading}
        error={categoryError}
        locationSearch={locationSearch}
        activeCategory={activeCategory}
        selectedStoreTypes={selectedStoreTypes}
        sortBy={sortBy}
        onSortChange={setSortBy}
        radius={radius}
        onRadiusChange={setRadius}
        onCategoryChange={handleCategorySelect}
      />
    </div>
  );
};
