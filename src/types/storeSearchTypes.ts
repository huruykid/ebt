
import type { Tables } from '@/integrations/supabase/types';

export type Store = Tables<'snap_stores'>;

export interface StoreWithDistance extends Store {
  distance?: number;
}

export interface LocationSearch {
  lat: number;
  lng: number;
}

export interface SearchParams {
  searchQuery: string;
  activeCategory: string;
  selectedStoreTypes: string[];
  selectedNamePatterns: string[];
  locationSearch: LocationSearch | null;
  userZipCode: string | null;
  radius: number;
  selectedCity?: string;
  selectedState?: string;
}
