
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type Store = Tables<'snap_stores'>;

interface StoreWithDistance extends Store {
  distance?: number;
}

export const useZipCodeSearch = () => {
  const [activeZipCode, setActiveZipCode] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const { data: zipStores, isLoading, error } = useQuery({
    queryKey: ['zip-stores', activeZipCode],
    queryFn: async (): Promise<StoreWithDistance[]> => {
      if (!activeZipCode) return [];

      const { data, error } = await supabase
        .from('snap_stores')
        .select('*')
        .eq('Zip_Code', activeZipCode)
        .not('Store_Name', 'is', null)
        .not('Store_Name', 'eq', '')
        .limit(50);

      if (error) {
        console.error('Error fetching stores by ZIP:', error);
        throw error;
      }

      return data || [];
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
