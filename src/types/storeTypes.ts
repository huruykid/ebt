
import type { Tables } from '@/integrations/supabase/types';
import type { LocationData } from '@/hooks/useStoreLocationData';
import type { YelpBusiness } from '@/hooks/useYelp';

type Store = Tables<'snap_stores'>;

export interface StoreWithDistance extends Store {
  distance?: number;
}

export interface StoreWithLocationData extends StoreWithDistance {
  locationData?: LocationData;
  // Add our internal review data
  reviewCount?: number;
  averageRating?: number;
}

export interface StoreWithYelpData extends StoreWithLocationData {
  yelpData?: YelpBusiness;
}

// For compatibility with existing components
export type StoreWithGoogleData = StoreWithLocationData;
