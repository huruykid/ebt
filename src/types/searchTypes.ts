import type { Tables } from '@/integrations/supabase/types';

export type Store = Tables<'snap_stores'>;

export interface StoreWithDistance extends Store {
  distance?: number;
}

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
