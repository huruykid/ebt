
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { sortStores } from '@/utils/storeSorting';
import type { SortOption } from '@/components/SortDropdown';
import type { Tables } from '@/integrations/supabase/types';

type Store = Tables<'snap_stores'>;

interface StoreWithDistance extends Store {
  distance?: number;
}

export const useStoreSearch = () => {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [activeCategory, setActiveCategory] = useState('trending');
  const [selectedStoreTypes, setSelectedStoreTypes] = useState<string[]>([]);
  const [selectedNamePatterns, setSelectedNamePatterns] = useState<string[]>([]);
  const [locationSearch, setLocationSearch] = useState<{ lat: number; lng: number } | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('distance');

  // Update search query when URL parameter changes
  useEffect(() => {
    const queryParam = searchParams.get('q') || '';
    setSearchQuery(queryParam);
  }, [searchParams]);

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

  const { data: stores, isLoading, error } = useQuery({
    queryKey: ['stores', searchQuery, activeCategory, selectedStoreTypes, selectedNamePatterns, locationSearch],
    queryFn: async (): Promise<StoreWithDistance[]> => {
      let query = supabase
        .from('snap_stores')
        .select('*')
        .order('Store_Name');

      // If location search is active, prioritize nearby stores
      if (locationSearch) {
        const { lat, lng } = locationSearch;
        const radius = 25; // miles
        const latDelta = radius / 69;
        const lonDelta = radius / (69 * Math.cos(lat * Math.PI / 180));
        
        query = query
          .not('Latitude', 'is', null)
          .not('Longitude', 'is', null)
          .gte('Latitude', lat - latDelta)
          .lte('Latitude', lat + latDelta)
          .gte('Longitude', lng - lonDelta)
          .lte('Longitude', lng + lonDelta);
      }

      // Apply search query
      if (searchQuery.trim()) {
        query = query.or(`Store_Name.ilike.%${searchQuery}%,City.ilike.%${searchQuery}%,Zip_Code.ilike.%${searchQuery}%,State.ilike.%${searchQuery}%`);
      }

      // Apply category filters
      if ((selectedStoreTypes.length > 0 || selectedNamePatterns.length > 0) && activeCategory !== 'trending') {
        const filters = [];
        
        if (selectedStoreTypes.length > 0) {
          const typeFilters = selectedStoreTypes.map(type => `Store_Type.ilike.%${type}%`);
          filters.push(...typeFilters);
        }
        
        if (selectedNamePatterns.length > 0) {
          const nameFilters = selectedNamePatterns.map(pattern => `Store_Name.ilike.%${pattern}%`);
          filters.push(...nameFilters);
        }
        
        if (filters.length > 0) {
          query = query.or(filters.join(','));
        }
      }

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
            distance: calculateDistance(lat, lng, store.Latitude!, store.Longitude!)
          }))
          .filter(store => store.distance <= 25)
          .sort((a, b) => a.distance - b.distance);
      }

      return results;
    },
  });

  // Sort the stores based on the selected option
  const sortedStores = stores ? sortStores(stores, sortBy) : [];

  const handleCategoryChange = (categoryId: string, storeTypes?: string[], namePatterns?: string[]) => {
    setActiveCategory(categoryId);
    setSelectedStoreTypes(storeTypes || []);
    setSelectedNamePatterns(namePatterns || []);
    console.log('Category changed to:', categoryId, 'Store types:', storeTypes, 'Name patterns:', namePatterns);
  };

  return {
    searchQuery,
    setSearchQuery,
    activeCategory,
    selectedStoreTypes,
    selectedNamePatterns,
    locationSearch,
    setLocationSearch,
    sortBy,
    setSortBy,
    stores: sortedStores,
    isLoading,
    error,
    handleCategoryChange,
  };
};
