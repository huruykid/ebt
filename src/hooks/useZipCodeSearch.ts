
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { applyGroceryExclusion } from '@/utils/storeFiltering';
import { CATEGORY_EXCLUSIONS } from '@/constants/storeSearchConstants';
import type { Tables } from '@/integrations/supabase/types';

type Store = Tables<'snap_stores'>;

interface StoreWithDistance extends Store {
  distance?: number;
}

interface UseZipCodeSearchProps {
  activeCategory?: string;
  selectedStoreTypes?: string[];
  selectedNamePatterns?: string[];
}

export const useZipCodeSearch = (props: UseZipCodeSearchProps = {}) => {
  const { activeCategory = 'trending', selectedStoreTypes = [], selectedNamePatterns = [] } = props;
  const [activeZipCode, setActiveZipCode] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const { data: zipStores, isLoading, error } = useQuery({
    queryKey: ['zip-stores', activeZipCode, activeCategory, selectedStoreTypes, selectedNamePatterns],
    queryFn: async (): Promise<StoreWithDistance[]> => {
      if (!activeZipCode) return [];

      console.log('🔍 ZIP search with filters:', {
        zipCode: activeZipCode,
        category: activeCategory,
        storeTypes: selectedStoreTypes,
        namePatterns: selectedNamePatterns
      });

      let query = supabase
        .from('snap_stores')
        .select('*')
        .eq('Zip_Code', activeZipCode)
        .not('Store_Name', 'is', null)
        .not('Store_Name', 'eq', '');

      // Apply store type filters if specified
      if (selectedStoreTypes && selectedStoreTypes.length > 0) {
        query = query.in('Store_Type', selectedStoreTypes);
      }

      const { data, error } = await query.limit(100);

      if (error) {
        console.error('Error fetching stores by ZIP:', error);
        throw error;
      }

      let results: StoreWithDistance[] = data || [];

      // Apply name pattern filters
      if (selectedNamePatterns && selectedNamePatterns.length > 0) {
        results = results.filter(store => {
          const storeName = store.Store_Name?.toLowerCase() || '';
          return selectedNamePatterns.some(pattern => 
            storeName.includes(pattern.toLowerCase())
          );
        });
      }

      // Apply category-specific exclusions
      if (activeCategory === 'grocery') {
        console.log('🏪 Applying grocery exclusions to ZIP results...');
        const beforeExclusion = results.length;
        results = applyGroceryExclusion(results);
        console.log(`🏪 Grocery filtering: ${beforeExclusion} → ${results.length} stores`);
      }

      // Apply general exclusions for trending category
      const excludePatterns = CATEGORY_EXCLUSIONS[activeCategory] || [];
      if (excludePatterns.length > 0) {
        results = results.filter(store => {
          const storeName = store.Store_Name?.toLowerCase() || '';
          const storeType = store.Store_Type?.toLowerCase() || '';
          
          return !excludePatterns.some(pattern => {
            const patternLower = pattern.toLowerCase();
            return storeName.includes(patternLower) || storeType.includes(patternLower);
          });
        });
      }

      console.log('✅ Final ZIP search results:', {
        category: activeCategory,
        totalResults: results.length,
        sampleResults: results.slice(0, 3).map(r => ({ 
          name: r.Store_Name, 
          type: r.Store_Type
        }))
      });

      return results;
    },
    enabled: !!activeZipCode,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handleZipSearch = (zipCode: string) => {
    setErrorMessage('');
    const zipRegex = /^\d{5}$/;
    
    if (!zipRegex.test(zipCode)) {
      setErrorMessage('Please enter a valid 5-digit ZIP code.');
      return;
    }

    setActiveZipCode(zipCode);
  };

  const handleClearSearch = () => {
    setActiveZipCode(null);
    setErrorMessage('');
  };

  const noResultsMessage = activeZipCode && zipStores && zipStores.length === 0 && !isLoading
    ? "No EBT-accepting locations found in that ZIP code. Try another nearby."
    : '';

  return {
    activeZipCode,
    zipStores: zipStores || [],
    isLoading,
    error,
    errorMessage,
    noResultsMessage,
    handleZipSearch,
    handleClearSearch,
    isSearchActive: !!activeZipCode
  };
};
