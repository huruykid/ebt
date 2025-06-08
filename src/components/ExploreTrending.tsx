
import React, { useState } from 'react';
import { Header } from './Header';
import { SearchBar } from './SearchBar';
import { CategoryTabs } from './CategoryTabs';
import { BottomNavigation } from './BottomNavigation';
import { NearbyStores } from './NearbyStores';
import { LocationPrompt } from './LocationPrompt';
import { LoadingSpinner } from './LoadingSpinner';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useNavigate } from 'react-router-dom';

export const ExploreTrending: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('trending');
  const [selectedStoreTypes, setSelectedStoreTypes] = useState<string[]>([]);
  const navigate = useNavigate();
  const { latitude, longitude, error, loading } = useGeolocation();

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    console.log('Searching for:', query);
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  const handleCategoryChange = (categoryId: string, storeTypes?: string[]) => {
    setActiveCategory(categoryId);
    setSelectedStoreTypes(storeTypes || []);
    console.log('Category changed to:', categoryId, 'Store types:', storeTypes);
  };

  const handleNavigate = (itemId: string) => {
    console.log('Navigate to:', itemId);
    if (itemId === 'search') {
      navigate('/search');
    }
  };

  const handleRequestLocation = () => {
    // Trigger a page reload to re-request location permission
    window.location.reload();
  };

  return (
    <div className="bg-neutral-100 flex max-w-[480px] w-full flex-col overflow-hidden items-stretch mx-auto min-h-screen">
      <div className="flex w-full flex-col items-stretch px-3.5 pt-3">
        <Header className="self-center flex w-full max-w-[335px] items-stretch gap-5 justify-between" />
        
        <SearchBar 
          onSearch={handleSearch}
          className="mt-4"
          placeholder="Search stores, food, or location..."
        />
      </div>

      <CategoryTabs 
        onCategoryChange={handleCategoryChange}
        className="mt-4 px-3.5"
      />

      <main className="flex-1 self-center flex w-full max-w-[400px] flex-col items-center mt-4 px-4 pb-20">
        {loading && (
          <div className="py-8">
            <LoadingSpinner />
            <p className="text-center text-gray-600 mt-4">Getting your location...</p>
          </div>
        )}

        {error && !loading && (
          <LocationPrompt 
            onRequestLocation={handleRequestLocation} 
            error={error}
          />
        )}

        {latitude && longitude && !loading && (
          <div className="w-full">
            <NearbyStores 
              latitude={latitude} 
              longitude={longitude}
              radius={10}
              limit={20}
              category={activeCategory}
              storeTypes={selectedStoreTypes}
            />
          </div>
        )}

        {/* Fallback content when location is not available */}
        {!latitude && !longitude && !loading && !error && (
          <LocationPrompt 
            onRequestLocation={handleRequestLocation}
          />
        )}
      </main>

      <BottomNavigation onNavigate={handleNavigate} />
    </div>
  );
};

export default ExploreTrending;
