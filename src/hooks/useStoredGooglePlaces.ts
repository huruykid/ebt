import { useMemo } from 'react';
import type { Store } from '@/types/storeTypes';

export interface StoredGooglePlacesData {
  // Business info
  place_id?: string;
  name?: string;
  formatted_address?: string;
  formatted_phone_number?: string;
  website?: string;
  rating?: number;
  user_ratings_total?: number;
  price_level?: number;
  
  // Hours and status
  opening_hours?: {
    open_now?: boolean;
    weekday_text?: string[];
  };
  business_status?: string;
  
  // Photos and reviews
  photos?: Array<{
    photo_reference: string;
    photo_url?: string;
    width: number;
    height: number;
  }>;
  reviews?: any[];
  
  // Location and metadata
  geometry?: {
    location: { lat: number; lng: number };
  };
  vicinity?: string;
  types?: string[];
  
  // Cache metadata
  cached: boolean;
  data_source: 'database';
  last_updated?: string;
}

/**
 * Hook to retrieve Google Places data that's already stored in the database.
 * This hook does NOT make any API calls - it only uses cached data.
 */
export const useStoredGooglePlaces = (
  store: Store | null | undefined
): StoredGooglePlacesData | null => {
  return useMemo(() => {
    // If no store or no Google Place ID, we have no Google data
    if (!store || !store.google_place_id) {
      return null;
    }

    return {
      place_id: store.google_place_id || undefined,
      name: store.google_name || undefined,
      formatted_address: store.google_formatted_address || undefined,
      formatted_phone_number: store.google_formatted_phone_number || undefined,
      website: store.google_website || undefined,
      rating: store.google_rating ? Number(store.google_rating) : undefined,
      user_ratings_total: store.google_user_ratings_total || undefined,
      price_level: store.google_price_level || undefined,
      opening_hours: store.google_opening_hours as any || undefined,
      business_status: store.google_business_status || undefined,
      photos: store.google_photos as any || undefined,
      reviews: store.google_reviews as any || undefined,
      geometry: store.google_geometry as any || undefined,
      vicinity: store.google_vicinity || undefined,
      types: store.google_types as any || undefined,
      cached: true,
      data_source: 'database',
      last_updated: store.google_last_updated || undefined
    };
  }, [
    store?.id,
    store?.google_place_id,
    store?.google_last_updated
  ]);
};
