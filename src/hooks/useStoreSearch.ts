
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

// Define exclusion patterns for each category
const categoryExclusions: Record<string, string[]> = {
  grocery: ['CVS', 'Walgreens', 'Rite Aid', 'Dollar'],
  convenience: ['CVS', 'Walgreens', 'Rite Aid', 'Dollar'],
  dollar: ['CVS', 'Walgreens', 'Rite Aid', 'Pharmacy', 'Drug Store'],
  pharmacy: ['Dollar', 'Market'],
  farmers: ['CVS', 'Walgreens', 'Dollar', 'Whole Foods', 'Super Market', 'Food Market', 'Meat Market', 'Fish Market', 'Flea Market'],
  hotmeals: ['CVS', 'Walgreens', 'Dollar', 'Market']
};

export const useStoreSearch = () => {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [activeCategory, setActiveCategory] = useState('trending');
  const [selectedStoreTypes, setSelectedStoreTypes] = useState<string[]>([]);
  const [selectedNamePatterns, setSelectedNamePatterns] = useState<string[]>([]);
  const [locationSearch, setLocationSearch] = useState<{ lat: number; lng: number } | null>(null);
  const [userZipCode, setUserZipCode] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('distance');
  const [radius, setRadius] = useState(10);

  // Update search query when URL parameter changes
  useEffect(() => {
    const queryParam = searchParams.get('q') || '';
    setSearchQuery(queryParam);
  }, [searchParams]);

  // Get user's zip code from their location
  useEffect(() => {
    if (locationSearch && !userZipCode) {
      const getZipCodeFromCoordinates = async (lat: number, lng: number) => {
        try {
          console.log('🔍 Getting zip code for coordinates:', { lat, lng });
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
          );
          const data = await response.json();
          const zipCode = data.address?.postcode;
          if (zipCode) {
            console.log('📮 Found user zip code:', zipCode);
            setUserZipCode(zipCode);
          } else {
            console.log('⚠️ No zip code found in geocoding response');
          }
        } catch (error) {
          console.error('❌ Error getting zip code:', error);
        }
      };

      getZipCodeFromCoordinates(locationSearch.lat, locationSearch.lng);
    }
  }, [locationSearch, userZipCode]);

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
    queryKey: ['stores', searchQuery, activeCategory, selectedStoreTypes, selectedNamePatterns, locationSearch, radius, userZipCode],
    queryFn: async (): Promise<StoreWithDistance[]> => {
      console.log('🔍 Starting store search with params:', {
        searchQuery,
        activeCategory,
        selectedStoreTypes,
        selectedNamePatterns,
        locationSearch,
        radius,
        userZipCode
      });

      // Get exclusion patterns for the active category
      const excludePatterns = categoryExclusions[activeCategory] || [];

      // Build the query with exclusion patterns
      const query = buildBaseQuery(
        searchQuery,
        activeCategory,
        selectedStoreTypes,
        selectedNamePatterns,
        locationSearch,
        excludePatterns
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
        excludePatterns,
        sampleResults: results.slice(0, 3).map(r => ({ 
          name: r.Store_Name, 
          type: r.Store_Type,
          coordinates: { lat: r.Latitude, lng: r.Longitude }
        }))
      });

      // Apply additional category-specific exclusions if needed
      if (activeCategory === 'farmers' && results.length > 0) {
        console.log('🥕 Applying farmers market exclusions...');
        const beforeExclusion = results.length;
        results = applyFarmersMarketExclusion(results);
        console.log(`🥕 Farmers market filtering: ${beforeExclusion} → ${results.length} stores`);
      } else if (activeCategory === 'grocery' && results.length > 0) {
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
    
    // Force a fresh search by clearing the search query for category-based searches
    if (categoryId !== 'trending') {
      setSearchQuery('');
    }
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
    userZipCode, // Expose user zip code for debugging
  };
};
