import React, { useState } from 'react';
import { SearchBar } from './SearchBar';
import { CategoryTabs } from './CategoryTabs';
import { NearbyStores } from './NearbyStores';
import { LocationPrompt } from './LocationPrompt';
import { LoadingSpinner } from './LoadingSpinner';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useNavigate } from 'react-router-dom';
import { MapPin, Search, Heart } from 'lucide-react';
export const ExploreTrending: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('trending');
  const [selectedStoreTypes, setSelectedStoreTypes] = useState<string[]>([]);
  const navigate = useNavigate();
  const {
    latitude,
    longitude,
    error,
    loading
  } = useGeolocation();
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    console.log('Searching for:', query);
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };
  const handleLocationSearch = (lat: number, lng: number) => {
    console.log('Location search:', lat, lng);
    navigate('/search');
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
  return <div className="min-h-screen bg-background">
      {/* Mobile Layout */}
      <div className="md:hidden bg-neutral-100 flex max-w-[480px] w-full flex-col overflow-hidden items-stretch mx-auto min-h-screen">
        <div className="flex w-full flex-col items-stretch px-3.5 pt-3">
          <div className="text-center mb-4">
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Find SNAP Stores
            </h1>
            <p className="text-sm text-muted-foreground px-2">
              Discover grocery stores, restaurants, and retailers that accept EBT/SNAP benefits in your area. 
              Save time and shop with confidence.
            </p>
          </div>
          
          <SearchBar onSearch={handleSearch} onLocationSearch={handleLocationSearch} className="mt-4" placeholder="Search stores, food, or location..." />
        </div>

        <CategoryTabs onCategoryChange={handleCategoryChange} className="mt-4 px-3.5" />

        <main className="flex-1 self-center flex w-full max-w-[400px] flex-col items-center mt-4 px-4">
          {loading && <div className="py-8">
              <LoadingSpinner />
              <p className="text-center text-gray-600 mt-4">Getting your location...</p>
            </div>}

          {error && !loading && <LocationPrompt onRequestLocation={handleRequestLocation} error={error} />}

          {latitude && longitude && !loading && <div className="w-full">
              <NearbyStores latitude={latitude} longitude={longitude} radius={10} limit={20} category={activeCategory} storeTypes={selectedStoreTypes} />
            </div>}

          {!latitude && !longitude && !loading && !error && <LocationPrompt onRequestLocation={handleRequestLocation} />}
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
              <div className="max-w-2xl mx-auto">
                <SearchBar onSearch={handleSearch} onLocationSearch={handleLocationSearch} placeholder="Search stores, food, or enter an address..." className="text-lg" />
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

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar - Categories */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg border p-6 sticky top-8">
                <h3 className="font-semibold text-foreground mb-4">Store Categories</h3>
                <CategoryTabs onCategoryChange={handleCategoryChange} className="flex-col space-y-2" />
              </div>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-3">
              {loading && <div className="text-center py-12">
                  <LoadingSpinner />
                  <p className="text-muted-foreground mt-4">Getting your location...</p>
                </div>}

              {error && !loading && <div className="bg-white rounded-lg border p-8">
                  <LocationPrompt onRequestLocation={handleRequestLocation} error={error} />
                </div>}

              {latitude && longitude && !loading && <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-semibold text-foreground">
                      Nearby Stores
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Showing results within 10 miles
                    </p>
                  </div>
                  
                  <NearbyStores latitude={latitude} longitude={longitude} radius={10} limit={20} category={activeCategory} storeTypes={selectedStoreTypes} />
                </div>}

              {!latitude && !longitude && !loading && !error && <div className="bg-white rounded-lg border p-8">
                  <LocationPrompt onRequestLocation={handleRequestLocation} />
                </div>}
            </div>
          </div>
        </div>
      </div>
    </div>;
};
export default ExploreTrending;