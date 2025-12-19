/**
 * Core library exports - browser-independent, fully testable
 */

// Distance calculations
export {
  calculateDistance,
  toRadians,
  toDegrees,
  isValidCoordinate,
  getBoundingBox,
} from './distance';

// Store types
export type {
  BaseStore,
  StoreWithDistance,
  LocationCoordinates,
  SortOption,
  StoreFilterOptions,
  LocationFilterOptions,
} from './store-types';

// Store filtering
export {
  filterFarmersMarkets,
  filterGroceryStores,
  filterByStoreType,
  filterByNamePatterns,
  filterWithValidCoordinates,
  filterByLocation,
  applyFilters,
} from './store-filtering';

// Store sorting
export {
  sortByDistance,
  sortByName,
  sortByRating,
  sortByPopularity,
  sortStores,
} from './store-sorting';

// Store utilities
export {
  formatStoreAddress,
  formatFullAddress,
  isRmpEnrolled,
  getOpeningStatus,
  normalizeStoreName,
  matchesSearchQuery,
  getStoreTypeDisplayName,
} from './store-utils';
