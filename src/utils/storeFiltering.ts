/**
 * Re-export from core library for backward compatibility
 * Plus Supabase-specific filtering functions
 */

export {
  filterFarmersMarkets,
  filterGroceryStores,
  filterByStoreType,
  filterByNamePatterns,
  filterWithValidCoordinates,
  filterByLocation,
  applyFilters,
} from '@/lib/core/store-filtering';

import type { Tables } from '@/integrations/supabase/types';

type Store = Tables<'snap_stores'>;

interface StoreWithDistance extends Store {
  distance?: number;
}

/**
 * Apply farmers market filtering (alias for backward compatibility)
 */
export const applyFarmersMarketFiltering = (stores: StoreWithDistance[]): StoreWithDistance[] => {
  const includePatterns = ['farmers', 'farm market', 'farmers market', 'farmers and markets'];
  const excludePatterns = ['cvs', 'walgreens', 'rite aid', 'convenience store', 'gas station'];

  return stores.filter((store) => {
    const storeName = store.Store_Name?.toLowerCase() || '';
    const storeType = store.Store_Type?.toLowerCase() || '';

    const hasValidPattern = includePatterns.some(
      (pattern) => storeName.includes(pattern) || storeType.includes(pattern)
    );

    const shouldExclude = excludePatterns.some(
      (pattern) => storeName.includes(pattern) || storeType.includes(pattern)
    );

    return hasValidPattern && !shouldExclude;
  });
};

/**
 * @deprecated Use applyFarmersMarketFiltering instead
 */
export const applyFarmersMarketExclusion = applyFarmersMarketFiltering;

/**
 * Apply grocery exclusion (excludes farmers markets from grocery results)
 */
export const applyGroceryExclusion = (stores: StoreWithDistance[]): StoreWithDistance[] => {
  const excludePatterns = ['farmers market', 'farm market', 'flea market', "farmer's market"];

  return stores.filter((store) => {
    const storeName = store.Store_Name?.toLowerCase() || '';
    const storeType = store.Store_Type?.toLowerCase() || '';
    return !excludePatterns.some(
      (pattern) => storeName.includes(pattern) || storeType.includes(pattern)
    );
  });
};

/**
 * Apply location-based filtering with distance calculation
 */
export const applyLocationFiltering = (
  stores: StoreWithDistance[],
  location: { lat: number; lng: number },
  radius: number,
  calculateDistanceFn: (lat1: number, lon1: number, lat2: number, lon2: number) => number
): StoreWithDistance[] => {
  const { lat, lng } = location;

  const storesWithDistance = stores
    .filter((store) => store.Latitude != null && store.Longitude != null)
    .map((store) => ({
      ...store,
      distance: calculateDistanceFn(lat, lng, store.Latitude!, store.Longitude!),
    }));

  return storesWithDistance
    .filter((store) => store.distance! <= radius)
    .sort((a, b) => a.distance! - b.distance!);
};
