
import type { Tables } from '@/integrations/supabase/types';
import type { LocationData } from '@/hooks/useStoreLocationData';

type Store = Tables<'snap_stores'>;

export interface StoreWithDistance extends Store {
  distance?: number;
}

export interface StoreWithLocationData extends StoreWithDistance {
  locationData?: LocationData;
}

// For compatibility with existing components
export type StoreWithGoogleData = StoreWithLocationData;
