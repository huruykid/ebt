
import type { NominatimReverseResult } from '@/hooks/useNominatimSearch';

// Compatibility interface to bridge Nominatim data with existing Google Places components
export interface GooglePlacesCompatibleData {
  formatted_phone_number?: string;
  international_phone_number?: string;
  opening_hours?: {
    open_now: boolean;
    weekday_text: string[];
  };
  rating?: number;
  user_ratings_total?: number;
  website?: string;
  business_status?: string;
  // Additional fields from Nominatim
  display_name?: string;
  address?: {
    house_number?: string;
    road?: string;
    suburb?: string;
    city?: string;
    county?: string;
    state?: string;
    postcode?: string;
    country?: string;
    country_code?: string;
  };
}

// Convert Nominatim data to Google Places compatible format
export const convertNominatimToGooglePlaces = (nominatimData: NominatimReverseResult | null): GooglePlacesCompatibleData | null => {
  if (!nominatimData) return null;
  
  return {
    display_name: nominatimData.display_name,
    address: nominatimData.address,
    // Leave other fields undefined since OSM doesn't provide them
    formatted_phone_number: undefined,
    opening_hours: undefined,
    rating: undefined,
    user_ratings_total: undefined,
    website: undefined,
    business_status: undefined
  };
};
