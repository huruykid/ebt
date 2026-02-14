import { useMemo } from 'react';
import type { Store } from '@/types/storeTypes';
import type { GooglePlacesBusiness } from '@/hooks/useGooglePlaces';

/** Typed representation of Google Places data stored in the database */
export interface StoredGooglePlacesData {
  place_id?: string;
  name?: string;
  formatted_address?: string;
  formatted_phone_number?: string;
  website?: string;
  rating?: number;
  user_ratings_total?: number;
  price_level?: number;
  opening_hours?: GooglePlacesBusiness['opening_hours'];
  business_status?: string;
  photos?: GooglePlacesBusiness['photos'];
  reviews?: GooglePlacesBusiness['reviews'];
  geometry?: GooglePlacesBusiness['geometry'];
  vicinity?: string;
  types?: string[];
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
      opening_hours: store.google_opening_hours as StoredGooglePlacesData['opening_hours'] || undefined,
      business_status: store.google_business_status || undefined,
      photos: store.google_photos as StoredGooglePlacesData['photos'] || undefined,
      reviews: store.google_reviews as StoredGooglePlacesData['reviews'] || undefined,
      geometry: store.google_geometry as StoredGooglePlacesData['geometry'] || undefined,
      vicinity: store.google_vicinity || undefined,
      types: store.google_types as string[] || undefined,
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
