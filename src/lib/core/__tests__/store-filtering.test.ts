import { describe, it, expect } from 'vitest';
import {
  filterFarmersMarkets,
  filterGroceryStores,
  filterByStoreType,
  filterByNamePatterns,
  filterWithValidCoordinates,
  filterByLocation,
  applyFilters,
} from '../store-filtering';
import type { BaseStore } from '../store-types';

// Test fixtures
const createStore = (overrides: Partial<BaseStore> = {}): BaseStore => ({
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
  ...overrides,
});

describe('store filtering', () => {
  describe('filterFarmersMarkets', () => {
    it('includes stores with "farmers market" in name', () => {
      const stores = [
        createStore({ id: '1', Store_Name: 'Downtown Farmers Market' }),
        createStore({ id: '2', Store_Name: 'Regular Grocery' }),
      ];
      
      const result = filterFarmersMarkets(stores);
      
      expect(result).toHaveLength(1);
      expect(result[0].Store_Name).toBe('Downtown Farmers Market');
    });

    it('includes stores with "farmers" in name', () => {
      const stores = [
        createStore({ id: '1', Store_Name: 'Local Farmers' }),
        createStore({ id: '2', Store_Name: 'CVS Pharmacy' }),
      ];
      
      const result = filterFarmersMarkets(stores);
      
      expect(result).toHaveLength(1);
      expect(result[0].Store_Name).toBe('Local Farmers');
    });

    it('includes stores with "farm market" in type', () => {
      const stores = [
        createStore({ id: '1', Store_Name: 'Fresh Produce', Store_Type: 'Farm Market' }),
        createStore({ id: '2', Store_Name: 'Walmart', Store_Type: 'Super Store' }),
      ];
      
      const result = filterFarmersMarkets(stores);
      
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });

    it('excludes CVS and Walgreens even if they have "farm" pattern', () => {
      const stores = [
        createStore({ id: '1', Store_Name: 'CVS Farmacy' }), // Typo, but should still be excluded
        createStore({ id: '2', Store_Name: 'Walgreens Farmers Section' }),
        createStore({ id: '3', Store_Name: 'Real Farmers Market' }),
      ];
      
      const result = filterFarmersMarkets(stores);
      
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('3');
    });

    it('excludes convenience stores', () => {
      const stores = [
        createStore({ id: '1', Store_Name: 'Farm Fresh', Store_Type: 'Convenience Store' }),
        createStore({ id: '2', Store_Name: 'Local Farmers Market' }),
      ];
      
      const result = filterFarmersMarkets(stores);
      
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('2');
    });

    it('handles empty array', () => {
      expect(filterFarmersMarkets([])).toEqual([]);
    });

    it('handles null store names', () => {
      const stores = [
        createStore({ id: '1', Store_Name: null }),
        createStore({ id: '2', Store_Name: 'Farmers Market' }),
      ];
      
      const result = filterFarmersMarkets(stores);
      
      expect(result).toHaveLength(1);
    });
  });

  describe('filterGroceryStores', () => {
    it('excludes farmers markets', () => {
      const stores = [
        createStore({ id: '1', Store_Name: 'Downtown Farmers Market' }),
        createStore({ id: '2', Store_Name: 'Kroger' }),
        createStore({ id: '3', Store_Name: 'Farm Market Fresh' }),
      ];
      
      const result = filterGroceryStores(stores);
      
      expect(result).toHaveLength(1);
      expect(result[0].Store_Name).toBe('Kroger');
    });

    it('excludes flea markets', () => {
      const stores = [
        createStore({ id: '1', Store_Name: 'Flea Market Store' }),
        createStore({ id: '2', Store_Name: 'Safeway' }),
      ];
      
      const result = filterGroceryStores(stores);
      
      expect(result).toHaveLength(1);
      expect(result[0].Store_Name).toBe('Safeway');
    });

    it('keeps regular grocery stores', () => {
      const stores = [
        createStore({ id: '1', Store_Name: 'Whole Foods', Store_Type: 'Grocery Store' }),
        createStore({ id: '2', Store_Name: 'Trader Joes', Store_Type: 'Supermarket' }),
      ];
      
      const result = filterGroceryStores(stores);
      
      expect(result).toHaveLength(2);
    });
  });

  describe('filterByStoreType', () => {
    it('filters by single store type', () => {
      const stores = [
        createStore({ id: '1', Store_Type: 'Grocery Store' }),
        createStore({ id: '2', Store_Type: 'Convenience Store' }),
        createStore({ id: '3', Store_Type: 'Supermarket' }),
      ];
      
      const result = filterByStoreType(stores, ['grocery']);
      
      expect(result).toHaveLength(1);
      expect(result[0].Store_Type).toBe('Grocery Store');
    });

    it('filters by multiple store types', () => {
      const stores = [
        createStore({ id: '1', Store_Type: 'Grocery Store' }),
        createStore({ id: '2', Store_Type: 'Convenience Store' }),
        createStore({ id: '3', Store_Type: 'Supermarket' }),
      ];
      
      const result = filterByStoreType(stores, ['grocery', 'supermarket']);
      
      expect(result).toHaveLength(2);
    });

    it('returns all stores when no types specified', () => {
      const stores = [
        createStore({ id: '1', Store_Type: 'Grocery Store' }),
        createStore({ id: '2', Store_Type: 'Convenience Store' }),
      ];
      
      const result = filterByStoreType(stores, []);
      
      expect(result).toHaveLength(2);
    });

    it('is case insensitive', () => {
      const stores = [
        createStore({ id: '1', Store_Type: 'GROCERY STORE' }),
      ];
      
      const result = filterByStoreType(stores, ['grocery']);
      
      expect(result).toHaveLength(1);
    });
  });

  describe('filterByNamePatterns', () => {
    it('filters by single pattern', () => {
      const stores = [
        createStore({ id: '1', Store_Name: 'Walmart Supercenter' }),
        createStore({ id: '2', Store_Name: 'Target' }),
        createStore({ id: '3', Store_Name: 'Walmart Neighborhood Market' }),
      ];
      
      const result = filterByNamePatterns(stores, ['walmart']);
      
      expect(result).toHaveLength(2);
    });

    it('filters by multiple patterns', () => {
      const stores = [
        createStore({ id: '1', Store_Name: 'Walmart' }),
        createStore({ id: '2', Store_Name: 'Target' }),
        createStore({ id: '3', Store_Name: 'Costco' }),
      ];
      
      const result = filterByNamePatterns(stores, ['walmart', 'target']);
      
      expect(result).toHaveLength(2);
    });

    it('returns all when no patterns specified', () => {
      const stores = [
        createStore({ id: '1' }),
        createStore({ id: '2' }),
      ];
      
      const result = filterByNamePatterns(stores, []);
      
      expect(result).toHaveLength(2);
    });
  });

  describe('filterWithValidCoordinates', () => {
    it('keeps stores with valid coordinates', () => {
      const stores = [
        createStore({ id: '1', Latitude: 40.7128, Longitude: -74.006 }),
        createStore({ id: '2', Latitude: null, Longitude: -74.006 }),
        createStore({ id: '3', Latitude: 40.7128, Longitude: null }),
      ];
      
      const result = filterWithValidCoordinates(stores);
      
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });

    it('rejects invalid coordinates', () => {
      const stores = [
        createStore({ id: '1', Latitude: 91, Longitude: 0 }), // Invalid lat
        createStore({ id: '2', Latitude: 0, Longitude: 181 }), // Invalid lon
        createStore({ id: '3', Latitude: 45, Longitude: 90 }), // Valid
      ];
      
      const result = filterWithValidCoordinates(stores);
      
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('3');
    });
  });

  describe('filterByLocation', () => {
    it('filters stores within radius', () => {
      const stores = [
        createStore({ id: '1', Latitude: 40.7128, Longitude: -74.006 }), // Center
        createStore({ id: '2', Latitude: 40.7228, Longitude: -74.006 }), // ~0.7 miles north
        createStore({ id: '3', Latitude: 40.8128, Longitude: -74.006 }), // ~7 miles north
      ];
      
      const result = filterByLocation(stores, { lat: 40.7128, lng: -74.006 }, 5);
      
      expect(result).toHaveLength(2);
      expect(result.map(s => s.id)).toContain('1');
      expect(result.map(s => s.id)).toContain('2');
    });

    it('sorts results by distance', () => {
      const stores = [
        createStore({ id: '1', Latitude: 40.7328, Longitude: -74.006 }), // Farther
        createStore({ id: '2', Latitude: 40.7128, Longitude: -74.006 }), // Closest
        createStore({ id: '3', Latitude: 40.7228, Longitude: -74.006 }), // Middle
      ];
      
      const result = filterByLocation(stores, { lat: 40.7128, lng: -74.006 }, 10);
      
      expect(result[0].id).toBe('2'); // Closest first
      expect(result[0].distance).toBe(0);
    });

    it('adds distance property to stores', () => {
      const stores = [
        createStore({ id: '1', Latitude: 40.7228, Longitude: -74.006 }),
      ];
      
      const result = filterByLocation(stores, { lat: 40.7128, lng: -74.006 }, 10);
      
      expect(result[0].distance).toBeDefined();
      expect(result[0].distance).toBeGreaterThan(0);
    });

    it('excludes stores without coordinates', () => {
      const stores = [
        createStore({ id: '1', Latitude: null, Longitude: -74.006 }),
        createStore({ id: '2', Latitude: 40.7128, Longitude: -74.006 }),
      ];
      
      const result = filterByLocation(stores, { lat: 40.7128, lng: -74.006 }, 10);
      
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('2');
    });

    it('handles empty input', () => {
      const result = filterByLocation([], { lat: 40.7128, lng: -74.006 }, 10);
      expect(result).toEqual([]);
    });

    it('returns empty when no stores in radius', () => {
      const stores = [
        createStore({ id: '1', Latitude: 41.7128, Longitude: -74.006 }), // ~69 miles away
      ];
      
      const result = filterByLocation(stores, { lat: 40.7128, lng: -74.006 }, 5);
      
      expect(result).toHaveLength(0);
    });
  });

  describe('applyFilters', () => {
    it('applies multiple filters in sequence', () => {
      const stores = [
        createStore({ id: '1', Store_Name: 'Walmart', Store_Type: 'Super Store' }),
        createStore({ id: '2', Store_Name: 'Target', Store_Type: 'Super Store' }),
        createStore({ id: '3', Store_Name: 'Walmart Express', Store_Type: 'Convenience Store' }),
      ];
      
      const result = applyFilters(stores, {
        storeTypes: ['super'],
        namePatterns: ['walmart'],
      });
      
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });

    it('returns all stores when no filters specified', () => {
      const stores = [
        createStore({ id: '1' }),
        createStore({ id: '2' }),
      ];
      
      const result = applyFilters(stores, {});
      
      expect(result).toHaveLength(2);
    });
  });
});
