
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { SearchBar } from './SearchBar';
import { StoreCard } from './StoreCard';
import { CategoryTabs } from './CategoryTabs';
import { LoadingSpinner } from './LoadingSpinner';
import { SyncStoresButton } from './SyncStoresButton';
import type { Tables } from '@/integrations/supabase/types';

type Store = Tables<'snap_stores'>;

export const StoreSearch: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [activeCategory, setActiveCategory] = useState('trending');
  const [selectedStoreTypes, setSelectedStoreTypes] = useState<string[]>([]);
  const [locationSearch, setLocationSearch] = useState<{ lat: number; lng: number } | null>(null);
  const navigate = useNavigate();

  // Update search query when URL parameter changes
  useEffect(() => {
    const queryParam = searchParams.get('q') || '';
    setSearchQuery(queryParam);
  }, [searchParams]);

  const { data: stores, isLoading, error } = useQuery({
    queryKey: ['stores', searchQuery, activeCategory, selectedStoreTypes, locationSearch],
    queryFn: async () => {
      let query = supabase
        .from('snap_stores')
        .select('*')
        .order('store_name');

      // If location search is active, prioritize nearby stores
      if (locationSearch) {
        const { lat, lng } = locationSearch;
        const radius = 25; // miles
        const latDelta = radius / 69;
        const lonDelta = radius / (69 * Math.cos(lat * Math.PI / 180));
        
        query = query
          .not('latitude', 'is', null)
          .not('longitude', 'is', null)
          .gte('latitude', lat - latDelta)
          .lte('latitude', lat + latDelta)
          .gte('longitude', lng - lonDelta)
          .lte('longitude', lng + lonDelta);
      }

      // Apply search query
      if (searchQuery.trim()) {
        query = query.or(`store_name.ilike.%${searchQuery}%,city.ilike.%${searchQuery}%,zip_code.ilike.%${searchQuery}%,state.ilike.%${searchQuery}%`);
      }

      // Apply category filters (store types)
      if (selectedStoreTypes.length > 0 && activeCategory !== 'trending') {
        query = query.in('store_type', selectedStoreTypes);
      }

      // Limit results for performance
      query = query.limit(100);

      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching stores:', error);
        throw error;
      }
      
      let results = data || [];

      // If location search is active, calculate distances and sort
      if (locationSearch && results.length > 0) {
        const { lat, lng } = locationSearch;
        results = results
          .map(store => ({
            ...store,
            distance: calculateDistance(lat, lng, store.latitude!, store.longitude!)
          }))
          .filter(store => store.distance <= 25)
          .sort((a, b) => a.distance - b.distance);
      }

      return results;
    },
  });

  // Calculate distance between two points using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setLocationSearch(null); // Clear location search when doing text search
    // Update URL to reflect the new search
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`, { replace: true });
    } else {
      navigate('/search', { replace: true });
    }
  };

  const handleLocationSearch = (latitude: number, longitude: number) => {
    setLocationSearch({ lat: latitude, lng: longitude });
    setSearchQuery(''); // Clear text search when doing location search
    navigate('/search', { replace: true });
  };

  const handleCategoryChange = (categoryId: string, storeTypes?: string[]) => {
    setActiveCategory(categoryId);
    setSelectedStoreTypes(storeTypes || []);
    console.log('Category changed to:', categoryId, 'Store types:', storeTypes);
  };

  const handleFindStoresClick = () => {
    navigate('/');
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <button 
            onClick={handleFindStoresClick}
            className="text-2xl font-bold text-gray-800 hover:text-blue-600 transition-colors cursor-pointer"
          >
            Find SNAP Stores
          </button>
          <SyncStoresButton />
        </div>
        <SearchBar 
          onSearch={handleSearch}
          onLocationSearch={handleLocationSearch}
          placeholder="Search by store name, city, or zip code..."
          className="mb-4"
          initialValue={searchQuery}
        />
      </div>

      {/* Use CategoryTabs instead of StoreFilters */}
      <div className="mb-6">
        <CategoryTabs 
          onCategoryChange={handleCategoryChange}
        />
      </div>

      {isLoading && <LoadingSpinner />}

      {error && (
        <div className="text-center py-8">
          <p className="text-red-600">Error loading stores. Please try again.</p>
        </div>
      )}

      {stores && stores.length === 0 && !isLoading && (
        <div className="text-center py-8">
          <p className="text-gray-600">No stores found. Try adjusting your search or filters.</p>
        </div>
      )}

      {stores && stores.length > 0 && (
        <div className="space-y-4">
          <p className="text-sm text-gray-600 mb-4">
            Found {stores.length} store{stores.length !== 1 ? 's' : ''}
            {locationSearch && (
              <span className="ml-2 text-blue-600">
                • Near your location
              </span>
            )}
            {activeCategory !== 'trending' && selectedStoreTypes.length > 0 && (
              <span className="ml-2 text-blue-600">
                • Filtered by: {activeCategory.replace(/([A-Z])/g, ' $1').trim()}
              </span>
            )}
          </p>
          {stores.map((store) => (
            <StoreCard 
              key={store.id}
              store={store}
            />
          ))}
        </div>
      )}
    </div>
  );
};
