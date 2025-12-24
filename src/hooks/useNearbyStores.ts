import { useQuery } from '@tanstack/react-query';
import {
  fetchOptimizedStores,
  fetchFallbackStores,
  calculateTrendingScores,
  sortByTrending,
  type StoreWithDistance,
} from './useNearbyStoresCore';

interface UseNearbyStoresProps {
  latitude: number;
  longitude: number;
  radius?: number;
  limit?: number;
  category?: string;
  storeTypes?: string[];
  namePatterns?: string[];
  useOptimized?: boolean;
}

export const useNearbyStores = ({
  latitude,
  longitude,
  radius = 10,
  limit = 20,
  category = 'trending',
  storeTypes = [],
  namePatterns = [],
  useOptimized = true,
}: UseNearbyStoresProps) => {
  return useQuery({
    queryKey: [
      'nearby-stores',
      latitude,
      longitude,
      radius,
      limit,
      category,
      storeTypes,
      namePatterns,
      useOptimized,
    ],
    queryFn: async (): Promise<StoreWithDistance[]> => {
      // Use optimized RPC when possible (no name patterns)
      const shouldUseOptimized = useOptimized && namePatterns.length === 0;

      let stores: StoreWithDistance[];

      if (shouldUseOptimized) {
        stores = await fetchOptimizedStores(latitude, longitude, radius, limit * 2, storeTypes);
      } else {
        stores = await fetchFallbackStores(
          latitude,
          longitude,
          radius,
          limit * 2,
          category !== 'trending' ? storeTypes : [],
          category !== 'trending' ? namePatterns : []
        );
      }

      // Apply trending sort if needed
      if (category === 'trending' && stores.length > 0) {
        const storeIds = stores.map((store) => store.id);
        const trendingScores = await calculateTrendingScores(storeIds, latitude, longitude);
        stores = sortByTrending(stores, trendingScores);
      }

      return stores.slice(0, limit);
    },
    enabled: !!(latitude && longitude),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};
