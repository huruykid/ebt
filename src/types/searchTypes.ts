// Re-export StoreWithDistance from storeTypes for backward compatibility
export type { StoreWithDistance } from './storeTypes';

export interface SearchSuggestion {
  type: 'store' | 'location' | 'recent';
  value: string;
  subtitle?: string;
  icon?: string;
}

export interface SearchParams {
  query: string;
  location?: string;
  useCurrentLocation?: boolean;
  radius?: number;
  storeType?: string[];
}

export interface SearchHistory {
  id: string;
  query: string;
  location?: string;
  timestamp: number;
}

export interface ParsedLocation {
  city: string;
  state: string;
  zip: string;
}

export interface GeoCoordinates {
  lat: number;
  lng: number;
}
