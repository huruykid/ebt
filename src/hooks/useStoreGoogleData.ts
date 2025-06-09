
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
  // Create stable search queries for the first 10 stores
  const searchQueries = useMemo(() => {
    if (!stores || !Array.isArray(stores) || stores.length === 0) return [];
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

  // Use individual hooks for each query (up to 10)
  const query0 = useGooglePlacesSearch(searchQueries[0]?.query || '', !!searchQueries[0]?.query);
  const query1 = useGooglePlacesSearch(searchQueries[1]?.query || '', !!searchQueries[1]?.query);
  const query2 = useGooglePlacesSearch(searchQueries[2]?.query || '', !!searchQueries[2]?.query);
  const query3 = useGooglePlacesSearch(searchQueries[3]?.query || '', !!searchQueries[3]?.query);
  const query4 = useGooglePlacesSearch(searchQueries[4]?.query || '', !!searchQueries[4]?.query);
  const query5 = useGooglePlacesSearch(searchQueries[5]?.query || '', !!searchQueries[5]?.query);
  const query6 = useGooglePlacesSearch(searchQueries[6]?.query || '', !!searchQueries[6]?.query);
  const query7 = useGooglePlacesSearch(searchQueries[7]?.query || '', !!searchQueries[7]?.query);
  const query8 = useGooglePlacesSearch(searchQueries[8]?.query || '', !!searchQueries[8]?.query);
  const query9 = useGooglePlacesSearch(searchQueries[9]?.query || '', !!searchQueries[9]?.query);

  // Collect all query results
  const queryResults = [query0, query1, query2, query3, query4, query5, query6, query7, query8, query9];

  // Create a map of Google Places data for each store
  const googlePlacesDataMap = useMemo(() => {
    const dataMap = new Map<number, GoogleData>();
    searchQueries.forEach(({ storeId }, index) => {
      const queryResult = queryResults[index];
      const googleData = queryResult?.data?.[0];
      if (googleData) {
        dataMap.set(storeId, {
          rating: googleData.rating,
          user_ratings_total: googleData.user_ratings_total
        });
      }
    });
    return dataMap;
  }, [searchQueries, queryResults]);

  // Enhance stores with Google Places data
  const storesWithGoogleData = useMemo(() => {
    if (!stores || !Array.isArray(stores)) return [];
    return stores.map(store => ({
      ...store,
      googleData: googlePlacesDataMap.get(store.id)
    }));
  }, [stores, googlePlacesDataMap]);

  return storesWithGoogleData;
};
