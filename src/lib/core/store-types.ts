/**
 * Core store types - browser-independent, fully testable
 * These types are decoupled from Supabase for testing purposes
 */

export interface BaseStore {
  id: string;
  Store_Name: string | null;
  Store_Type: string | null;
  Store_Street_Address: string | null;
  City: string | null;
  State: string | null;
  Zip_Code: string | null;
  Latitude: number | null;
  Longitude: number | null;
  Incentive_Program: string | null;
}

export interface StoreWithDistance extends BaseStore {
  distance?: number;
}

export interface LocationCoordinates {
  lat: number;
  lng: number;
}

export type SortOption = 'distance' | 'popularity' | 'rating' | 'name';

export interface StoreFilterOptions {
  storeTypes?: string[];
  namePatterns?: string[];
  excludePatterns?: string[];
  includePatterns?: string[];
}

export interface LocationFilterOptions {
  location: LocationCoordinates;
  radiusMiles: number;
}
