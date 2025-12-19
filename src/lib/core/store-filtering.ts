/**
 * Core store filtering library - browser-independent, fully testable
 */

import type { BaseStore, StoreWithDistance, LocationCoordinates, StoreFilterOptions } from './store-types';
import { calculateDistance, isValidCoordinate, getBoundingBox } from './distance';

/**
 * Filter stores by farmers market category
 * Uses inclusion patterns to find actual farmers markets and excludes false positives
 */
export const filterFarmersMarkets = <T extends BaseStore>(stores: T[]): T[] => {
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
 * Filter stores for grocery category (excludes farmers markets)
 */
export const filterGroceryStores = <T extends BaseStore>(stores: T[]): T[] => {
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
 * Filter stores by store type
 */
export const filterByStoreType = <T extends BaseStore>(
  stores: T[],
  storeTypes: string[]
): T[] => {
  if (!storeTypes.length) return stores;

  const normalizedTypes = storeTypes.map((t) => t.toLowerCase());

  return stores.filter((store) => {
    const storeType = store.Store_Type?.toLowerCase() || '';
    return normalizedTypes.some((type) => storeType.includes(type));
  });
};

/**
 * Filter stores by name patterns (inclusion)
 */
export const filterByNamePatterns = <T extends BaseStore>(
  stores: T[],
  patterns: string[]
): T[] => {
  if (!patterns.length) return stores;

  const normalizedPatterns = patterns.map((p) => p.toLowerCase());

  return stores.filter((store) => {
    const storeName = store.Store_Name?.toLowerCase() || '';
    return normalizedPatterns.some((pattern) => storeName.includes(pattern));
  });
};

/**
 * Filter stores that have valid coordinates
 */
export const filterWithValidCoordinates = <T extends BaseStore>(stores: T[]): T[] => {
  return stores.filter(
    (store) =>
      store.Latitude !== null &&
      store.Longitude !== null &&
      isValidCoordinate(store.Latitude, store.Longitude)
  );
};

/**
 * Add distance to stores and filter by radius
 */
export const filterByLocation = <T extends BaseStore>(
  stores: T[],
  location: LocationCoordinates,
  radiusMiles: number
): StoreWithDistance[] => {
  const { lat, lng } = location;

  // Pre-filter using bounding box for performance
  const boundingBox = getBoundingBox(lat, lng, radiusMiles);

  const storesInBoundingBox = stores.filter((store) => {
    if (store.Latitude === null || store.Longitude === null) return false;
    return (
      store.Latitude >= boundingBox.minLat &&
      store.Latitude <= boundingBox.maxLat &&
      store.Longitude >= boundingBox.minLon &&
      store.Longitude <= boundingBox.maxLon
    );
  });

  // Calculate exact distance for remaining stores
  const storesWithDistance: StoreWithDistance[] = storesInBoundingBox
    .map((store) => ({
      ...store,
      distance: calculateDistance(lat, lng, store.Latitude!, store.Longitude!),
    }))
    .filter((store) => store.distance! <= radiusMiles)
    .sort((a, b) => a.distance! - b.distance!);

  return storesWithDistance;
};

/**
 * Apply multiple filters in sequence
 */
export const applyFilters = <T extends BaseStore>(
  stores: T[],
  options: StoreFilterOptions
): T[] => {
  let result = stores;

  if (options.storeTypes?.length) {
    result = filterByStoreType(result, options.storeTypes);
  }

  if (options.namePatterns?.length) {
    result = filterByNamePatterns(result, options.namePatterns);
  }

  return result;
};
