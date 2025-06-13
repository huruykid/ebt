
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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
    queryFn: async (): Promise<SmartSearchResult[]> => {
      if (!searchParams.searchText.trim() && !searchParams.city?.trim() && !searchParams.zipCode?.trim()) {
        return [];
      }

      const { data, error } = await supabase.rpc('smart_store_search', {
        search_text: searchParams.searchText || '',
        search_city: searchParams.city || '',
        search_zip: searchParams.zipCode || '',
        similarity_threshold: searchParams.similarityThreshold || 0.3,
        result_limit: searchParams.limit || 50
      });

      if (error) {
        console.error('Smart search error:', error);
        throw error;
      }

      console.log('Smart search results:', data?.length || 0, 'stores found');
      console.log('Search params:', searchParams);
      
      return data || [];
    },
    enabled: !!(searchParams.searchText.trim() || searchParams.city?.trim() || searchParams.zipCode?.trim())
  });

  const performSearch = (params: SmartSearchParams) => {
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
