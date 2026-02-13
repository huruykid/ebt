import { describe, it, expect } from 'vitest';
import {
  formatStoreAddress,
  formatFullAddress,
  isRmpEnrolled,
  getOpeningStatus,
  normalizeStoreName,
  matchesSearchQuery,
  getStoreTypeDisplayName,
} from '../store-utils';
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

describe('store utils', () => {
  describe('formatStoreAddress', () => {
    it('formats complete address', () => {
      const store = createStore();
      expect(formatStoreAddress(store)).toBe('123 Main St, New York, NY');
    });

    it('handles missing street address', () => {
      const store = createStore({ Store_Street_Address: null });
      expect(formatStoreAddress(store)).toBe('New York, NY');
    });

    it('handles missing city', () => {
      const store = createStore({ City: null });
      expect(formatStoreAddress(store)).toBe('123 Main St, NY');
    });

    it('handles missing state', () => {
      const store = createStore({ State: null });
      expect(formatStoreAddress(store)).toBe('123 Main St, New York');
    });

    it('handles all parts missing', () => {
      const store = createStore({
        Store_Street_Address: null,
        City: null,
        State: null,
      });
      expect(formatStoreAddress(store)).toBe('');
    });
  });

  describe('formatFullAddress', () => {
    it('formats complete address with zip', () => {
      const store = createStore();
      expect(formatFullAddress(store)).toBe('123 Main St, New York, NY 10001');
    });

    it('handles missing zip', () => {
      const store = createStore({ Zip_Code: null });
      expect(formatFullAddress(store)).toBe('123 Main St, New York, NY');
    });

    it('handles missing street address', () => {
      const store = createStore({ Store_Street_Address: null });
      expect(formatFullAddress(store)).toBe('New York, NY 10001');
    });

    it('handles only city and state', () => {
      const store = createStore({
        Store_Street_Address: null,
        Zip_Code: null,
      });
      expect(formatFullAddress(store)).toBe('New York, NY');
    });
  });

  describe('isRmpEnrolled', () => {
    it('returns true for RMP', () => {
      expect(isRmpEnrolled('RMP')).toBe(true);
    });

    it('returns true for "Restaurant Meals Program"', () => {
      expect(isRmpEnrolled('Restaurant Meals Program')).toBe(true);
    });

    it('is case insensitive', () => {
      expect(isRmpEnrolled('rmp')).toBe(true);
      expect(isRmpEnrolled('restaurant meals program')).toBe(true);
    });

    it('returns true for programs containing RMP', () => {
      expect(isRmpEnrolled('SNAP RMP Enrolled')).toBe(true);
    });

    it('returns false for null', () => {
      expect(isRmpEnrolled(null)).toBe(false);
    });

    it('returns false for undefined', () => {
      expect(isRmpEnrolled(undefined)).toBe(false);
    });

    it('returns false for non-RMP programs', () => {
      expect(isRmpEnrolled('SNAP')).toBe(false);
      expect(isRmpEnrolled('WIC')).toBe(false);
    });

    it('returns true for Waiver (Restaurant Meals Program)', () => {
      expect(isRmpEnrolled('Waiver')).toBe(true);
      expect(isRmpEnrolled('waiver')).toBe(true);
    });
  });

  describe('getOpeningStatus', () => {
    it('returns "Open Now" when open', () => {
      expect(getOpeningStatus({ open_now: true })).toBe('Open Now');
    });

    it('returns "Closed" when closed', () => {
      expect(getOpeningStatus({ open_now: false })).toBe('Closed');
    });

    it('returns "Hours not available" for null', () => {
      expect(getOpeningStatus(null)).toBe('Hours not available');
    });

    it('returns "Hours not available" for undefined', () => {
      expect(getOpeningStatus(undefined)).toBe('Hours not available');
    });

    it('returns "Hours not available" when open_now is undefined', () => {
      expect(getOpeningStatus({})).toBe('Hours not available');
    });
  });

  describe('normalizeStoreName', () => {
    it('converts to lowercase', () => {
      expect(normalizeStoreName('WALMART')).toBe('walmart');
    });

    it('trims whitespace', () => {
      expect(normalizeStoreName('  Walmart  ')).toBe('walmart');
    });

    it('normalizes multiple spaces', () => {
      expect(normalizeStoreName('Walmart   Supercenter')).toBe('walmart supercenter');
    });

    it('handles null', () => {
      expect(normalizeStoreName(null)).toBe('');
    });

    it('handles undefined', () => {
      expect(normalizeStoreName(undefined)).toBe('');
    });
  });

  describe('matchesSearchQuery', () => {
    it('matches store name', () => {
      const store = createStore({ Store_Name: 'Walmart Supercenter' });
      expect(matchesSearchQuery(store, 'walmart')).toBe(true);
    });

    it('matches store type', () => {
      const store = createStore({ Store_Type: 'Grocery Store' });
      expect(matchesSearchQuery(store, 'grocery')).toBe(true);
    });

    it('matches city', () => {
      const store = createStore({ City: 'New York' });
      expect(matchesSearchQuery(store, 'york')).toBe(true);
    });

    it('matches state', () => {
      const store = createStore({ State: 'NY' });
      expect(matchesSearchQuery(store, 'NY')).toBe(true);
    });

    it('matches street address', () => {
      const store = createStore({ Store_Street_Address: '123 Main St' });
      expect(matchesSearchQuery(store, 'main')).toBe(true);
    });

    it('matches zip code', () => {
      const store = createStore({ Zip_Code: '10001' });
      expect(matchesSearchQuery(store, '10001')).toBe(true);
    });

    it('is case insensitive', () => {
      const store = createStore({ Store_Name: 'WALMART' });
      expect(matchesSearchQuery(store, 'walmart')).toBe(true);
    });

    it('returns true for empty query', () => {
      const store = createStore();
      expect(matchesSearchQuery(store, '')).toBe(true);
      expect(matchesSearchQuery(store, '   ')).toBe(true);
    });

    it('returns false for non-matching query', () => {
      const store = createStore({ Store_Name: 'Walmart' });
      expect(matchesSearchQuery(store, 'target')).toBe(false);
    });

    it('handles null fields', () => {
      const store = createStore({ Store_Name: null, City: null });
      expect(matchesSearchQuery(store, 'test')).toBe(false);
    });
  });

  describe('getStoreTypeDisplayName', () => {
    it('returns "Store" for null', () => {
      expect(getStoreTypeDisplayName(null)).toBe('Store');
    });

    it('returns "Store" for undefined', () => {
      expect(getStoreTypeDisplayName(undefined)).toBe('Store');
    });

    it('maps known types correctly', () => {
      expect(getStoreTypeDisplayName('supermarket')).toBe('Supermarket');
      expect(getStoreTypeDisplayName('grocery store')).toBe('Grocery Store');
      expect(getStoreTypeDisplayName('convenience store')).toBe('Convenience Store');
      expect(getStoreTypeDisplayName('farmers market')).toBe("Farmer's Market");
      expect(getStoreTypeDisplayName('farm market')).toBe("Farmer's Market");
    });

    it('is case insensitive', () => {
      expect(getStoreTypeDisplayName('SUPERMARKET')).toBe('Supermarket');
      expect(getStoreTypeDisplayName('Grocery Store')).toBe('Grocery Store');
    });

    it('returns original for unknown types', () => {
      expect(getStoreTypeDisplayName('Specialty Shop')).toBe('Specialty Shop');
    });
  });
});
