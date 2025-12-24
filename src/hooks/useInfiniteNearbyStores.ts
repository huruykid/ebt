import { useInfiniteQuery } from '@tanstack/react-query';
import {
  fetchOptimizedStores,
  fetchFallbackStores,
  calculateTrendingScores,
  sortByTrending,
  type StoreWithDistance,
} from './useNearbyStoresCore';

interface UseInfiniteNearbyStoresProps {
  latitude: number;
  longitude: number;
  radius?: number;
  pageSize?: number;
  category?: string;
  storeTypes?: string[];
  useOptimized?: boolean;
}

export const useInfiniteNearbyStores = ({
  latitude,
  longitude,
  radius = 10,
  pageSize = 20,
  category = 'trending',
  storeTypes = [],
  useOptimized = true,
}: UseInfiniteNearbyStoresProps) => {
  return useInfiniteQuery({
    queryKey: [
      'infinite-nearby-stores',
      latitude,
      longitude,
      radius,
      pageSize,
      category,
      storeTypes,
      useOptimized,
    ],
    queryFn: async ({ pageParam = 0 }): Promise<StoreWithDistance[]> => {
      const offset = pageParam * pageSize;

      let stores: StoreWithDistance[];

      if (useOptimized) {
        // For optimized path, fetch all up to current page then slice
        const allStores = await fetchOptimizedStores(
          latitude,
          longitude,
          radius,
          pageSize + offset,
          storeTypes
        );
        stores = allStores.slice(offset, offset + pageSize);
      } else {
        stores = await fetchFallbackStores(
          latitude,
          longitude,
          radius,
          pageSize,
          storeTypes,
          [],
          offset
        );
      }

      // Apply trending sort if needed
      if (category === 'trending' && stores.length > 0) {
        const storeIds = stores.map((store) => store.id);
        const trendingScores = await calculateTrendingScores(storeIds, latitude, longitude);
        stores = sortByTrending(stores, trendingScores);
      }

      return stores;
    },
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      if (!lastPage || lastPage.length < pageSize) {
        return undefined;
      }
      return lastPageParam + 1;
    },
    initialPageParam: 0,
    enabled: !!(latitude && longitude),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};
