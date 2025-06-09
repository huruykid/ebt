
import { useMemo } from 'react';
import { useGooglePlacesSearch } from '@/hooks/useGooglePlaces';
import type { Tables } from '@/integrations/supabase/types';

type Store = Tables<'snap_stores'>;

interface StoreWithDistance extends Store {
  distance?: number;
}

export interface GoogleData {
  rating?: number;
  user_ratings_total?: number;
}

export interface StoreWithGoogleData extends StoreWithDistance {
  googleData?: GoogleData;
}

export const useStoreGoogleData = (stores: StoreWithDistance[] | undefined) => {
  // Get Google Places data for the first 10 stores (to avoid hitting API limits)
  const storeQueries = useMemo(() => {
    if (!stores) return [];
    return stores.slice(0, 10).map(store => {
      const searchQuery = [
        store.store_name,
        store.store_street_address,
        store.city,
        store.state
      ].filter(Boolean).join(' ');
      return { query: searchQuery, storeId: store.id };
    });
  }, [stores]);

  // Fetch Google Places data for each store
  const googlePlacesQueries = storeQueries.map(({ query, storeId }) => 
    useGooglePlacesSearch(query, !!query)
  );

  // Create a map of Google Places data for each store
  const googlePlacesDataMap = useMemo(() => {
    const dataMap = new Map<number, GoogleData>();
    storeQueries.forEach(({ storeId }, index) => {
      const googleData = googlePlacesQueries[index]?.data?.[0];
      if (googleData) {
        dataMap.set(storeId, {
          rating: googleData.rating,
          user_ratings_total: googleData.user_ratings_total
        });
      }
    });
    return dataMap;
  }, [storeQueries, googlePlacesQueries]);

  // Enhance stores with Google Places data
  const storesWithGoogleData = useMemo(() => {
    if (!stores) return [];
    return stores.map(store => ({
      ...store,
      googleData: googlePlacesDataMap.get(store.id)
    }));
  }, [stores, googlePlacesDataMap]);

  return storesWithGoogleData;
};
