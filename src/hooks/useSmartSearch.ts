
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type Store = Tables<'snap_stores'>;

interface StoreWithDistance extends Store {
  distance?: number;
}

interface SmartSearchResult {
  id: string;
  store_name: string;
  store_street_address: string;
  city: string;
  state: string;
  zip_code: string;
  store_type: string;
  latitude: number;
  longitude: number;
  similarity_score: number;
}

interface SmartSearchParams {
  searchText: string;
  city?: string;
  zipCode?: string;
  similarityThreshold?: number;
  limit?: number;
}

export const useSmartSearch = () => {
  const [searchParams, setSearchParams] = useState<SmartSearchParams>({
    searchText: '',
    city: '',
    zipCode: '',
    similarityThreshold: 0.3,
    limit: 50
  });

  const { data: results, isLoading, error } = useQuery({
    queryKey: ['smart-search', searchParams],
    queryFn: async (): Promise<StoreWithDistance[]> => {
      if (!searchParams.searchText.trim() && !searchParams.city?.trim() && !searchParams.zipCode?.trim()) {
        return [];
      }

      console.log('Using optimized smart_store_search function with params:', searchParams);

      const { data, error } = await supabase.rpc('smart_store_search', {
        search_text: searchParams.searchText || '',
        search_city: searchParams.city || '',
        search_zip: searchParams.zipCode || '',
        similarity_threshold: searchParams.similarityThreshold || 0.3,
        result_limit: searchParams.limit || 50
      });

      if (error) {
        console.error('Optimized smart search error:', error);
        throw error;
      }

      console.log('Optimized smart search results:', data?.length || 0, 'stores found');
      console.log('Search params:', searchParams);
      
      // Convert the raw results to the correct format
      const convertedResults: StoreWithDistance[] = (data || []).map((result: SmartSearchResult) => ({
        id: result.id,
        Store_Name: result.store_name,
        Store_Street_Address: result.store_street_address,
        City: result.city,
        State: result.state,
        Zip_Code: result.zip_code,
        Store_Type: result.store_type,
        Latitude: result.latitude,
        Longitude: result.longitude,
        // Map other required fields with defaults
        Additional_Address: null,
        Zip4: null,
        County: null,
        Record_ID: null,
        ObjectId: null,
        Grantee_Name: null,
        X: null,
        Y: null,
        Incentive_Program: null
      }));
      
      return convertedResults;
    },
    enabled: !!(searchParams.searchText.trim() || searchParams.city?.trim() || searchParams.zipCode?.trim()),
    staleTime: 3 * 60 * 1000, // 3 minutes cache for search results
    cacheTime: 5 * 60 * 1000, // 5 minutes
  });

  const performSearch = (params: SmartSearchParams) => {
    console.log('Performing optimized smart search:', params);
    setSearchParams(params);
  };

  const clearSearch = () => {
    setSearchParams({
      searchText: '',
      city: '',
      zipCode: '',
      similarityThreshold: 0.3,
      limit: 50
    });
  };

  return {
    results,
    isLoading,
    error,
    performSearch,
    clearSearch,
    searchParams
  };
};
