import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { calculateDistance } from '@/utils/distanceCalculation';
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
  state?: string;
  zipCode?: string;
  similarityThreshold?: number;
  limit?: number;
  userLatitude?: number;
  userLongitude?: number;
  radius?: number;
}

export const useSmartSearch = () => {
  const [searchParams, setSearchParams] = useState<SmartSearchParams>({
    searchText: '',
    city: '',
    state: '',     // NOTE: default to blank, require user to pick
    zipCode: '',
    similarityThreshold: 0.3,
    limit: 50
  });

  const { data: results, isLoading, error } = useQuery({
    queryKey: ['smart-search', searchParams],
    queryFn: async (): Promise<StoreWithDistance[]> => {
      if (
        !searchParams.searchText.trim() &&
        !searchParams.city?.trim() &&
        !searchParams.zipCode?.trim()
      ) {
        return [];
      }

      console.log('Using optimized smart_store_search function with params:', searchParams);

      const { data, error } = await supabase.rpc('smart_store_search', {
        search_text: searchParams.searchText || '',
        search_city: searchParams.city || '',
        search_state: searchParams.state || '',
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
      let convertedResults = (data || []).map((result: SmartSearchResult) => ({
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
        Incentive_Program: null,
        // Google Places fields (optional)
        google_place_id: null,
        google_name: null,
        google_formatted_address: null,
        google_website: null,
        google_formatted_phone_number: null,
        google_opening_hours: null,
        google_rating: null,
        google_user_ratings_total: null,
        google_photos: null,
        google_last_updated: null,
        google_reviews: null,
        google_types: null,
        google_price_level: null,
        google_plus_code: null,
        google_business_status: null,
        google_geometry: null,
        google_vicinity: null,
        google_icon: null,
        google_icon_background_color: null,
        google_icon_mask_base_uri: null,
        distance_miles: 0 // SmartSearchResult doesn't have distance field
      })) as StoreWithDistance[];

      // Apply location filtering if user coordinates are available
      if (searchParams.userLatitude && searchParams.userLongitude && convertedResults.length > 0) {
        const radius = searchParams.radius || 10; // Default 10 mile radius
        console.log(`📍 Applying location filtering to smart search results with ${radius} mile radius...`);

        // Calculate distances and filter by radius
        convertedResults = convertedResults
          .map(store => {
            if (store.Latitude && store.Longitude) {
              const distance = calculateDistance(
                searchParams.userLatitude!,
                searchParams.userLongitude!,
                store.Latitude,
                store.Longitude
              );
              return { ...store, distance };
            }
            return store;
          })
          .filter(store => store.distance !== undefined && store.distance <= radius)
          .sort((a, b) => (a.distance || 0) - (b.distance || 0));

        console.log(
          `📍 Smart search location filtering: ${data?.length || 0} → ${
            convertedResults.length
          } stores within ${radius} miles`
        );
      }

      return convertedResults;
    },
    enabled: !!(
      searchParams.searchText.trim() ||
      searchParams.city?.trim() ||
      searchParams.zipCode?.trim()
    ),
    staleTime: 3 * 60 * 1000, // 3 minutes cache for search results
    gcTime: 5 * 60 * 1000 // 5 minutes
  });

  const performSearch = (params: SmartSearchParams) => {
    console.log('Performing optimized smart search:', params);
    setSearchParams(params);
  };

  const clearSearch = () => {
    setSearchParams({
      searchText: '',
      city: '',
      state: '',
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
