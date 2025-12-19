/**
 * Core store utility functions - browser-independent, fully testable
 */

import type { BaseStore } from './store-types';

/**
 * Format store address from parts
 */
export const formatStoreAddress = (store: {
  Store_Street_Address?: string | null;
  City?: string | null;
  State?: string | null;
  Zip_Code?: string | null;
}): string => {
  const parts = [store.Store_Street_Address, store.City, store.State].filter(Boolean);
  return parts.join(', ');
};

/**
 * Format full store address including zip code
 */
export const formatFullAddress = (store: {
  Store_Street_Address?: string | null;
  City?: string | null;
  State?: string | null;
  Zip_Code?: string | null;
}): string => {
  const cityState = [store.City, store.State].filter(Boolean).join(', ');
  const cityStateZip = store.Zip_Code ? `${cityState} ${store.Zip_Code}` : cityState;
  
  if (store.Store_Street_Address) {
    return `${store.Store_Street_Address}, ${cityStateZip}`;
  }
  return cityStateZip;
};

/**
 * Check if store is enrolled in Restaurant Meals Program (RMP)
 */
export const isRmpEnrolled = (incentiveProgram: string | null | undefined): boolean => {
  if (!incentiveProgram) return false;
  const program = incentiveProgram.toLowerCase();
  return program.includes('rmp') || program.includes('restaurant meals program');
};

/**
 * Get opening status string from opening hours data
 */
export const getOpeningStatus = (
  openingHours: { open_now?: boolean } | null | undefined
): string => {
  if (openingHours?.open_now !== undefined) {
    return openingHours.open_now ? 'Open Now' : 'Closed';
  }
  return 'Hours not available';
};

/**
 * Normalize store name for comparison
 */
export const normalizeStoreName = (name: string | null | undefined): string => {
  if (!name) return '';
  return name.toLowerCase().trim().replace(/\s+/g, ' ');
};

/**
 * Check if store matches search query
 */
export const matchesSearchQuery = (store: BaseStore, query: string): boolean => {
  if (!query.trim()) return true;

  const normalizedQuery = query.toLowerCase().trim();
  const searchFields = [
    store.Store_Name,
    store.Store_Type,
    store.City,
    store.State,
    store.Store_Street_Address,
    store.Zip_Code,
  ];

  return searchFields.some((field) => field?.toLowerCase().includes(normalizedQuery));
};

/**
 * Get store type display name
 */
export const getStoreTypeDisplayName = (storeType: string | null | undefined): string => {
  if (!storeType) return 'Store';

  const typeMap: Record<string, string> = {
    'supermarket': 'Supermarket',
    'grocery store': 'Grocery Store',
    'convenience store': 'Convenience Store',
    'farmers market': "Farmer's Market",
    'farm market': "Farmer's Market",
    'super store': 'Super Store',
    'bakery specialty': 'Bakery',
    'meat/poultry specialty': 'Butcher',
  };

  const lowerType = storeType.toLowerCase();
  return typeMap[lowerType] || storeType;
};
