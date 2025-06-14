
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
  const [radius, setRadius] = useState(10);

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
    queryKey: ['stores', searchQuery, activeCategory, selectedStoreTypes, selectedNamePatterns, locationSearch, radius],
    queryFn: async (): Promise<StoreWithDistance[]> => {
      let query = supabase
        .from('snap_stores')
        .select('*')
        .order('Store_Name');

      // Apply search query first
      if (searchQuery.trim()) {
        query = query.or(`Store_Name.ilike.%${searchQuery}%,City.ilike.%${searchQuery}%,Zip_Code.ilike.%${searchQuery}%,State.ilike.%${searchQuery}%`);
      }

      // Apply category filters - combine store types AND name patterns
      if ((selectedStoreTypes.length > 0 || selectedNamePatterns.length > 0) && activeCategory !== 'trending') {
        const filters = [];
        
        // Add store type filters
        if (selectedStoreTypes.length > 0) {
          const typeFilters = selectedStoreTypes.map(type => `Store_Type.ilike.%${type}%`);
          filters.push(...typeFilters);
        }
        
        // Add name pattern filters
        if (selectedNamePatterns.length > 0) {
          const nameFilters = selectedNamePatterns.map(pattern => `Store_Name.ilike.%${pattern}%`);
          filters.push(...nameFilters);
        }
        
        if (filters.length > 0) {
          query = query.or(filters.join(','));
        }

        console.log('Applied category filters:', filters);
      }

      // If location search is active, we'll filter by distance after getting results
      // But first ensure we have latitude/longitude data
      if (locationSearch) {
        query = query
          .not('Latitude', 'is', null)
          .not('Longitude', 'is', null);
      }

      query = query.limit(500); // Increased limit to get more results before distance filtering

      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching stores:', error);
        throw error;
      }
      
      let results = data || [];

      // If location search is active, calculate distances and filter by radius
      if (locationSearch && results.length > 0) {
        const { lat, lng } = locationSearch;
        results = results
          .map(store => ({
            ...store,
            distance: calculateDistance(lat, lng, store.Latitude!, store.Longitude!)
          }))
          .filter(store => store.distance <= radius) // Use dynamic radius
          .sort((a, b) => a.distance - b.distance);
      }

      console.log('Search results for category:', activeCategory, 'Store types:', selectedStoreTypes, 'Name patterns:', selectedNamePatterns, 'Results:', results.length);
      console.log('Sample results:', results.slice(0, 3).map(r => ({ name: r.Store_Name, type: r.Store_Type })));
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
    radius,
    setRadius,
    stores: sortedStores,
    isLoading,
    error,
    handleCategoryChange,
  };
};
