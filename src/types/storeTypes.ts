
import type { Tables } from '@/integrations/supabase/types';
import type { LocationData } from '@/hooks/useStoreLocationData';
import type { GooglePlacesBusiness } from '@/hooks/useGooglePlaces';

// Use Supabase-generated types directly
export type Store = Tables<'snap_stores'>;

export interface StoreWithDistance extends Store {
  distance?: number;
  distance_miles?: number;
}

export interface StoreWithLocationData extends StoreWithDistance {
  locationData?: LocationData;
  // Add our internal review data
  reviewCount?: number;
  averageRating?: number;
}

export interface StoreWithGooglePlacesData extends StoreWithLocationData {
  googlePlacesData?: GooglePlacesBusiness;
}

// For compatibility with existing components
export type StoreWithGoogleData = StoreWithLocationData;
