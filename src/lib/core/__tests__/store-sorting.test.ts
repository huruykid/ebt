import { describe, it, expect } from 'vitest';
import {
  sortByDistance,
  sortByName,
  sortByRating,
  sortByPopularity,
  sortStores,
} from '../store-sorting';
import type { StoreWithDistance } from '../store-types';

// Test fixtures
const createStore = (
  overrides: Partial<StoreWithDistance & { averageRating?: number; reviewCount?: number }> = {}
): StoreWithDistance & { averageRating?: number; reviewCount?: number } => ({
  id: '1',
  Store_Name: 'Test Store',
  Store_Type: 'Grocery Store',
  Store_Street_Address: '123 Main St',
  City: 'New York',
  State: 'NY',
  Zip_Code: '10001',
  Latitude: 40.7128,
  Longitude: -74.006,
  Incentive_Program: null,
  distance: 1,
  ...overrides,
});

describe('store sorting', () => {
  describe('sortByDistance', () => {
    it('sorts stores by distance ascending', () => {
      const stores = [
        createStore({ id: '1', distance: 5 }),
        createStore({ id: '2', distance: 1 }),
        createStore({ id: '3', distance: 3 }),
      ];

      const result = sortByDistance(stores);

      expect(result[0].id).toBe('2');
      expect(result[1].id).toBe('3');
      expect(result[2].id).toBe('1');
    });

    it('handles undefined distances', () => {
      const stores = [
        createStore({ id: '1', distance: 5 }),
        createStore({ id: '2', distance: undefined }),
        createStore({ id: '3', distance: 1 }),
      ];

      const result = sortByDistance(stores);

      expect(result[0].id).toBe('3');
      expect(result[1].id).toBe('1');
      expect(result[2].id).toBe('2'); // Undefined goes last (Infinity)
    });

    it('does not mutate original array', () => {
      const stores = [
        createStore({ id: '1', distance: 5 }),
        createStore({ id: '2', distance: 1 }),
      ];
      const originalOrder = [...stores.map((s) => s.id)];

      sortByDistance(stores);

      expect(stores.map((s) => s.id)).toEqual(originalOrder);
    });

    it('handles equal distances', () => {
      const stores = [
        createStore({ id: '1', distance: 2 }),
        createStore({ id: '2', distance: 2 }),
        createStore({ id: '3', distance: 1 }),
      ];

      const result = sortByDistance(stores);

      expect(result[0].id).toBe('3');
      // Order of equal distances should be stable
      expect(result.slice(1).map((s) => s.distance)).toEqual([2, 2]);
    });

    it('handles empty array', () => {
      expect(sortByDistance([])).toEqual([]);
    });
  });

  describe('sortByName', () => {
    it('sorts stores alphabetically', () => {
      const stores = [
        createStore({ id: '1', Store_Name: 'Walmart' }),
        createStore({ id: '2', Store_Name: 'Aldi' }),
        createStore({ id: '3', Store_Name: 'Kroger' }),
      ];

      const result = sortByName(stores);

      expect(result[0].Store_Name).toBe('Aldi');
      expect(result[1].Store_Name).toBe('Kroger');
      expect(result[2].Store_Name).toBe('Walmart');
    });

    it('is case insensitive', () => {
      const stores = [
        createStore({ id: '1', Store_Name: 'walmart' }),
        createStore({ id: '2', Store_Name: 'ALDI' }),
        createStore({ id: '3', Store_Name: 'Kroger' }),
      ];

      const result = sortByName(stores);

      expect(result[0].Store_Name).toBe('ALDI');
      expect(result[1].Store_Name).toBe('Kroger');
      expect(result[2].Store_Name).toBe('walmart');
    });

    it('handles null names', () => {
      const stores = [
        createStore({ id: '1', Store_Name: 'Walmart' }),
        createStore({ id: '2', Store_Name: null }),
        createStore({ id: '3', Store_Name: 'Aldi' }),
      ];

      const result = sortByName(stores);

      // Null names should sort to beginning (empty string)
      expect(result[0].Store_Name).toBe(null);
      expect(result[1].Store_Name).toBe('Aldi');
      expect(result[2].Store_Name).toBe('Walmart');
    });
  });

  describe('sortByRating', () => {
    it('sorts by rating descending', () => {
      const stores = [
        createStore({ id: '1', averageRating: 3.5, distance: 1 }),
        createStore({ id: '2', averageRating: 4.8, distance: 2 }),
        createStore({ id: '3', averageRating: 4.0, distance: 3 }),
      ];

      const result = sortByRating(stores);

      expect(result[0].id).toBe('2'); // 4.8
      expect(result[1].id).toBe('3'); // 4.0
      expect(result[2].id).toBe('1'); // 3.5
    });

    it('falls back to distance when ratings are equal', () => {
      const stores = [
        createStore({ id: '1', averageRating: 4.0, distance: 5 }),
        createStore({ id: '2', averageRating: 4.0, distance: 1 }),
        createStore({ id: '3', averageRating: 4.0, distance: 3 }),
      ];

      const result = sortByRating(stores);

      expect(result[0].id).toBe('2'); // Closest
      expect(result[1].id).toBe('3');
      expect(result[2].id).toBe('1');
    });

    it('handles undefined ratings', () => {
      const stores = [
        createStore({ id: '1', averageRating: undefined, distance: 1 }),
        createStore({ id: '2', averageRating: 4.0, distance: 2 }),
      ];

      const result = sortByRating(stores);

      expect(result[0].id).toBe('2'); // Has rating
      expect(result[1].id).toBe('1'); // No rating (0)
    });
  });

  describe('sortByPopularity', () => {
    it('sorts by review count descending', () => {
      const stores = [
        createStore({ id: '1', reviewCount: 10, distance: 1 }),
        createStore({ id: '2', reviewCount: 100, distance: 2 }),
        createStore({ id: '3', reviewCount: 50, distance: 3 }),
      ];

      const result = sortByPopularity(stores);

      expect(result[0].id).toBe('2'); // 100 reviews
      expect(result[1].id).toBe('3'); // 50 reviews
      expect(result[2].id).toBe('1'); // 10 reviews
    });

    it('falls back to distance when counts are equal', () => {
      const stores = [
        createStore({ id: '1', reviewCount: 50, distance: 5 }),
        createStore({ id: '2', reviewCount: 50, distance: 1 }),
        createStore({ id: '3', reviewCount: 50, distance: 3 }),
      ];

      const result = sortByPopularity(stores);

      expect(result[0].id).toBe('2'); // Closest
      expect(result[1].id).toBe('3');
      expect(result[2].id).toBe('1');
    });

    it('handles undefined review counts', () => {
      const stores = [
        createStore({ id: '1', reviewCount: undefined, distance: 1 }),
        createStore({ id: '2', reviewCount: 50, distance: 2 }),
      ];

      const result = sortByPopularity(stores);

      expect(result[0].id).toBe('2'); // Has reviews
      expect(result[1].id).toBe('1'); // No reviews (0)
    });
  });

  describe('sortStores', () => {
    it('delegates to sortByDistance for "distance" option', () => {
      const stores = [
        createStore({ id: '1', distance: 5 }),
        createStore({ id: '2', distance: 1 }),
      ];

      const result = sortStores(stores, 'distance');

      expect(result[0].id).toBe('2');
    });

    it('delegates to sortByName for "name" option', () => {
      const stores = [
        createStore({ id: '1', Store_Name: 'Walmart' }),
        createStore({ id: '2', Store_Name: 'Aldi' }),
      ];

      const result = sortStores(stores, 'name');

      expect(result[0].Store_Name).toBe('Aldi');
    });

    it('delegates to sortByRating for "rating" option', () => {
      const stores = [
        createStore({ id: '1', averageRating: 3.0 }),
        createStore({ id: '2', averageRating: 4.5 }),
      ];

      const result = sortStores(stores, 'rating');

      expect(result[0].id).toBe('2');
    });

    it('delegates to sortByPopularity for "popularity" option', () => {
      const stores = [
        createStore({ id: '1', reviewCount: 10 }),
        createStore({ id: '2', reviewCount: 100 }),
      ];

      const result = sortStores(stores, 'popularity');

      expect(result[0].id).toBe('2');
    });

    it('returns empty array for null input', () => {
      expect(sortStores(null as any, 'distance')).toEqual([]);
    });

    it('returns empty array for undefined input', () => {
      expect(sortStores(undefined as any, 'distance')).toEqual([]);
    });

    it('returns empty array for non-array input', () => {
      expect(sortStores({} as any, 'distance')).toEqual([]);
    });

    it('returns empty array for empty array', () => {
      expect(sortStores([], 'distance')).toEqual([]);
    });

    it('returns copy for unknown sort option', () => {
      const stores = [createStore({ id: '1' }), createStore({ id: '2' })];

      const result = sortStores(stores, 'unknown' as any);

      expect(result).toHaveLength(2);
      expect(result).not.toBe(stores); // Should be a copy
    });
  });
});
