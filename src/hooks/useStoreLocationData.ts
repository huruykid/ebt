
import { useMemo } from 'react';
import { useNominatimSearch } from '@/hooks/useNominatimSearch';
import type { Tables } from '@/integrations/supabase/types';

type Store = Tables<'snap_stores'>;

interface StoreWithDistance extends Store {
  distance?: number;
}

export interface LocationData {
  formatted_address?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface StoreWithLocationData extends StoreWithDistance {
  locationData?: LocationData;
}

export const useStoreLocationData = (stores: StoreWithDistance[] | undefined) => {
  // Create stable search queries for the first 5 stores to reduce API calls
  const searchQueries = useMemo(() => {
    if (!stores || !Array.isArray(stores) || stores.length === 0) return [];
    return stores.slice(0, 5).map(store => {
      const searchQuery = [
        store.Store_Name,
        store.Store_Street_Address,
        store.City,
        store.State
      ].filter(Boolean).join(' ');
      return { query: searchQuery, storeId: store.id };
    });
  }, [stores]);

  // Use individual hooks for each query (up to 5)
  const query0 = useNominatimSearch(searchQueries[0]?.query || '', !!searchQueries[0]?.query);
  const query1 = useNominatimSearch(searchQueries[1]?.query || '', !!searchQueries[1]?.query);
  const query2 = useNominatimSearch(searchQueries[2]?.query || '', !!searchQueries[2]?.query);
  const query3 = useNominatimSearch(searchQueries[3]?.query || '', !!searchQueries[3]?.query);
  const query4 = useNominatimSearch(searchQueries[4]?.query || '', !!searchQueries[4]?.query);

  // Collect all query results
  const queryResults = [query0, query1, query2, query3, query4];

  // Create a map of location data for each store
  const locationDataMap = useMemo(() => {
    const dataMap = new Map<string, LocationData>();
    searchQueries.forEach(({ storeId }, index) => {
      const queryResult = queryResults[index];
      // Only process if the query was successful and has data
      if (queryResult?.data && !queryResult.error && queryResult.data.length > 0) {
        const locationResult = queryResult.data[0];
        if (locationResult) {
          dataMap.set(storeId, {
            formatted_address: locationResult.display_name,
            coordinates: {
              lat: parseFloat(locationResult.lat),
              lng: parseFloat(locationResult.lon)
            }
          });
        }
      }
    });
    return dataMap;
  }, [searchQueries, queryResults]);

  // Enhance stores with location data
  const storesWithLocationData = useMemo(() => {
    if (!stores || !Array.isArray(stores)) return [];
    return stores.map(store => ({
      ...store,
      locationData: locationDataMap.get(store.id)
    }));
  }, [stores, locationDataMap]);

  return storesWithLocationData;
};
