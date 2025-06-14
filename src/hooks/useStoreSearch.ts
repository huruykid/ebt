
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { sortStores } from '@/utils/storeSorting';
import { calculateDistance } from '@/utils/distanceCalculation';
import { 
  applyFarmersMarketExclusion, 
  applyGroceryExclusion, 
  applyLocationFiltering 
} from '@/utils/storeFiltering';
import { buildBaseQuery } from '@/utils/searchQueryBuilder';
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

  // Adjust radius based on category
  useEffect(() => {
    if (activeCategory === 'farmers') {
      setRadius(40); // Increase radius for farmers markets
    } else if (activeCategory === 'hotmeals') {
      setRadius(25); // Increase radius for restaurants
    } else {
      setRadius(10); // Default radius for other categories
    }
  }, [activeCategory]);

  const { data: stores, isLoading, error } = useQuery({
    queryKey: ['stores', searchQuery, activeCategory, selectedStoreTypes, selectedNamePatterns, locationSearch, radius],
    queryFn: async (): Promise<StoreWithDistance[]> => {
      console.log('🔍 Starting store search with params:', {
        searchQuery,
        activeCategory,
        selectedStoreTypes,
        selectedNamePatterns,
        locationSearch,
        radius
      });

      const query = buildBaseQuery(
        searchQuery,
        activeCategory,
        selectedStoreTypes,
        selectedNamePatterns,
        locationSearch
      );

      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching stores:', error);
        throw error;
      }
      
      let results: StoreWithDistance[] = data || [];
      console.log('📊 Initial database results:', {
        totalResults: results.length,
        category: activeCategory,
        radius: radius,
        locationActive: !!locationSearch,
        sampleResults: results.slice(0, 3).map(r => ({ 
          name: r.Store_Name, 
          type: r.Store_Type,
          coordinates: { lat: r.Latitude, lng: r.Longitude }
        }))
      });

      // Apply category-specific exclusions BEFORE location filtering
      if (activeCategory === 'farmers' && results.length > 0) {
        console.log('🥕 Applying farmers market exclusions...');
        const beforeExclusion = results.length;
        results = applyFarmersMarketExclusion(results);
        console.log(`🥕 Farmers market filtering: ${beforeExclusion} → ${results.length} stores`);
      }

      if (activeCategory === 'grocery' && results.length > 0) {
        console.log('🏪 Applying grocery exclusions...');
        const beforeExclusion = results.length;
        results = applyGroceryExclusion(results);
        console.log(`🏪 Grocery filtering: ${beforeExclusion} → ${results.length} stores`);
      }

      // Apply location filtering if active (this should be AFTER category filtering)
      if (locationSearch && results.length > 0) {
        console.log(`📍 Applying location filtering with ${radius} mile radius...`);
        const beforeLocationFilter = results.length;
        results = applyLocationFiltering(results, locationSearch, radius, calculateDistance);
        console.log(`📍 Location filtering: ${beforeLocationFilter} → ${results.length} stores within ${radius} miles`);
      } else if (locationSearch) {
        console.log('⚠️ No results to filter by location');
      } else {
        console.log('🌍 No location search active');
      }

      console.log('✅ Final search results:', {
        category: activeCategory,
        storeTypes: selectedStoreTypes,
        namePatterns: selectedNamePatterns,
        locationActive: !!locationSearch,
        radius: radius,
        totalResults: results.length,
        sampleResults: results.slice(0, 3).map(r => ({ 
          name: r.Store_Name, 
          type: r.Store_Type,
          distance: r.distance ? r.distance.toFixed(1) + ' miles' : 'no distance calculated'
        }))
      });

      return results;
    },
  });

  // Sort the stores based on the selected option
  const sortedStores = stores ? sortStores(stores, sortBy) : [];

  const handleCategoryChange = (categoryId: string, storeTypes: string[] = [], namePatterns: string[] = []) => {
    console.log('🔄 Category change called with:', { categoryId, storeTypes, namePatterns });
    
    setActiveCategory(categoryId);
    setSelectedStoreTypes(storeTypes);
    setSelectedNamePatterns(namePatterns);
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
