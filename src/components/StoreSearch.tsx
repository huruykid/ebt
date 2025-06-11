
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { SearchBar } from './SearchBar';
import { StoreCard } from './StoreCard';
import { CategoryTabs } from './CategoryTabs';
import { LoadingSpinner } from './LoadingSpinner';
import { SyncStoresButton } from './SyncStoresButton';
import { Search, MapPin, Sparkles, Users } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type Store = Tables<'snap_stores'>;

export const StoreSearch: React.FC = () => {
  const { user, isGuest } = useAuth();
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [activeCategory, setActiveCategory] = useState('trending');
  const [selectedStoreTypes, setSelectedStoreTypes] = useState<string[]>([]);
  const [selectedNamePatterns, setSelectedNamePatterns] = useState<string[]>([]);
  const [locationSearch, setLocationSearch] = useState<{ lat: number; lng: number } | null>(null);
  const navigate = useNavigate();

  // Update search query when URL parameter changes
  useEffect(() => {
    const queryParam = searchParams.get('q') || '';
    setSearchQuery(queryParam);
  }, [searchParams]);

  const { data: stores, isLoading, error } = useQuery({
    queryKey: ['stores', searchQuery, activeCategory, selectedStoreTypes, selectedNamePatterns, locationSearch],
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

      // Apply category filters (store types and name patterns)
      if ((selectedStoreTypes.length > 0 || selectedNamePatterns.length > 0) && activeCategory !== 'trending') {
        const filters = [];
        
        // Add store type filters
        if (selectedStoreTypes.length > 0) {
          const typeFilters = selectedStoreTypes.map(type => `store_type.ilike.%${type}%`);
          filters.push(...typeFilters);
        }
        
        // Add name pattern filters
        if (selectedNamePatterns.length > 0) {
          const nameFilters = selectedNamePatterns.map(pattern => `store_name.ilike.%${pattern}%`);
          filters.push(...nameFilters);
        }
        
        if (filters.length > 0) {
          query = query.or(filters.join(','));
        }
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

  const handleCategoryChange = (categoryId: string, storeTypes?: string[], namePatterns?: string[]) => {
    setActiveCategory(categoryId);
    setSelectedStoreTypes(storeTypes || []);
    setSelectedNamePatterns(namePatterns || []);
    console.log('Category changed to:', categoryId, 'Store types:', storeTypes, 'Name patterns:', namePatterns);
  };

  const handleFindStoresClick = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen">
      <div className="w-full max-w-4xl mx-auto p-4">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <button 
              onClick={handleFindStoresClick}
              className="heading-lg gradient-text hover:scale-105 transition-transform duration-300 cursor-pointer flex items-center gap-2"
            >
              <Search className="h-8 w-8 text-primary animate-bounce-gentle" />
              Find SNAP Stores
            </button>
            <div className="flex items-center gap-3">
              {isGuest && (
                <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm">
                  <Users className="h-4 w-4" />
                  Guest Mode
                </div>
              )}
              <SyncStoresButton />
            </div>
          </div>
          
          {/* Enhanced Search Bar Container */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-info/20 rounded-spotify-xl blur-lg"></div>
            <div className="relative card-gradient border-2 border-primary/20 rounded-spotify-xl p-1">
              <SearchBar 
                onSearch={handleSearch}
                onLocationSearch={handleLocationSearch}
                placeholder="🔍 Search by store name, city, or zip code..."
                className="border-0 bg-transparent"
                initialValue={searchQuery}
              />
            </div>
          </div>
        </div>

        {/* Enhanced Category Tabs */}
        <div className="mb-8">
          <div className="card-gradient rounded-spotify-xl p-4 border-2 border-accent/20">
            <CategoryTabs 
              onCategoryChange={handleCategoryChange}
            />
          </div>
        </div>

        {isLoading && (
          <div className="flex justify-center py-8">
            <div className="relative">
              <LoadingSpinner />
              <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-info rounded-full blur-lg opacity-20 animate-glow"></div>
            </div>
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <div className="card-gradient rounded-spotify-xl p-6 border-2 border-destructive/20">
              <p className="text-destructive font-semibold">⚠️ Error loading stores. Please try again.</p>
            </div>
          </div>
        )}

        {stores && stores.length === 0 && !isLoading && (
          <div className="text-center py-8">
            <div className="card-gradient rounded-spotify-xl p-8 border-2 border-muted/20">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-muted-foreground text-lg">No stores found. Try adjusting your search or filters.</p>
            </div>
          </div>
        )}

        {stores && stores.length > 0 && (
          <div className="space-y-6">
            {/* Enhanced Results Header */}
            <div className="card-gradient rounded-spotify-lg p-4 border-2 border-success/20">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-success animate-bounce-gentle" />
                <p className="body-md font-semibold text-success">
                  Found {stores.length} store{stores.length !== 1 ? 's' : ''}
                </p>
                {locationSearch && (
                  <div className="flex items-center gap-1 ml-2">
                    <MapPin className="h-4 w-4 text-info" />
                    <span className="text-info font-medium">Near your location</span>
                  </div>
                )}
                {activeCategory !== 'trending' && selectedStoreTypes.length > 0 && (
                  <span className="ml-2 px-3 py-1 bg-gradient-to-r from-primary/20 to-accent/20 text-primary font-semibold rounded-spotify-lg border border-primary/30">
                    Filtered by: {activeCategory.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                )}
              </div>
            </div>
            
            {/* Enhanced Store Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1">
              {stores.map((store) => (
                <StoreCard 
                  key={store.id}
                  store={store}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
