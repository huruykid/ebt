/**
 * Core store sorting library - browser-independent, fully testable
 */

import type { StoreWithDistance, SortOption } from './store-types';

/**
 * Sort stores by distance (closest first)
 */
export const sortByDistance = <T extends StoreWithDistance>(stores: T[]): T[] => {
  return [...stores].sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
};

/**
 * Sort stores by name alphabetically
 */
export const sortByName = <T extends { Store_Name: string | null }>(stores: T[]): T[] => {
  return [...stores].sort((a, b) => {
    const nameA = a.Store_Name?.toLowerCase() || '';
    const nameB = b.Store_Name?.toLowerCase() || '';
    return nameA.localeCompare(nameB);
  });
};

/**
 * Sort stores by rating (highest first)
 * Falls back to distance if ratings are equal or unavailable
 */
export const sortByRating = <T extends StoreWithDistance & { averageRating?: number }>(
  stores: T[]
): T[] => {
  return [...stores].sort((a, b) => {
    const ratingA = a.averageRating ?? 0;
    const ratingB = b.averageRating ?? 0;

    if (ratingA !== ratingB) {
      return ratingB - ratingA; // Higher rating first
    }

    // Fall back to distance if ratings are equal
    return (a.distance ?? Infinity) - (b.distance ?? Infinity);
  });
};

/**
 * Sort stores by popularity (most reviews first)
 * Falls back to distance if review counts are equal or unavailable
 */
export const sortByPopularity = <T extends StoreWithDistance & { reviewCount?: number }>(
  stores: T[]
): T[] => {
  return [...stores].sort((a, b) => {
    const countA = a.reviewCount ?? 0;
    const countB = b.reviewCount ?? 0;

    if (countA !== countB) {
      return countB - countA; // More reviews first
    }

    // Fall back to distance if review counts are equal
    return (a.distance ?? Infinity) - (b.distance ?? Infinity);
  });
};

/**
 * Main sort function that handles all sort options
 */
export const sortStores = <T extends StoreWithDistance & { averageRating?: number; reviewCount?: number }>(
  stores: T[],
  sortBy: SortOption
): T[] => {
  if (!stores || !Array.isArray(stores) || stores.length === 0) {
    return [];
  }

  switch (sortBy) {
    case 'distance':
      return sortByDistance(stores);
    case 'name':
      return sortByName(stores);
    case 'rating':
      return sortByRating(stores);
    case 'popularity':
      return sortByPopularity(stores);
    default:
      return [...stores];
  }
};
