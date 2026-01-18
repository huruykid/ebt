import { useInfiniteQuery } from '@tanstack/react-query';
import {
  fetchOptimizedStores,
  fetchFallbackStores,
  calculateTrendingScores,
  sortByTrending,
  applyCategoryFiltering,
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
        // For optimized path, fetch extra to account for filtering, then slice after filtering
        const fetchLimit = (pageSize + offset) * 2; // Fetch 2x to account for category filtering
        const allStores = await fetchOptimizedStores(
          latitude,
          longitude,
          radius,
          fetchLimit,
          storeTypes
        );
        
        // GLOBAL: Apply category-specific filtering before slicing
        const filteredStores = applyCategoryFiltering(allStores, category);
        stores = filteredStores.slice(offset, offset + pageSize);
      } else {
        stores = await fetchFallbackStores(
          latitude,
          longitude,
          radius,
          pageSize * 2, // Fetch extra to account for filtering
          storeTypes,
          [],
          offset
        );
        
        // GLOBAL: Apply category-specific filtering
        stores = applyCategoryFiltering(stores, category);
        stores = stores.slice(0, pageSize);
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
