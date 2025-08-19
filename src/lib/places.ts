import { supabase } from '@/integrations/supabase/client';

export interface PlacesResponse {
  from: 'cache' | 'google' | 'error';
  budget_exceeded: boolean;
  data: any;
  error?: string;
}

export interface TextSearchParams {
  query: string;
  region?: string;
  radius?: number;
}

export interface PlaceDetailsParams {
  place_id: string;
  fields?: string[];
}

/**
 * Default fields for Place Details to minimize costs
 * Only request what we actually use in the UI
 */
export const DEFAULT_PLACE_FIELDS = [
  'place_id',
  'name', 
  'formatted_address',
  'geometry',
  'opening_hours',
  'website',
  'formatted_phone_number',
  'rating',
  'user_ratings_total'
];

/**
 * Main client SDK function for Google Places API with caching and budget controls
 */
export async function places(
  action: 'search_text' | 'place_details', 
  payload: TextSearchParams | PlaceDetailsParams
): Promise<PlacesResponse> {
  try {
    const { data, error } = await supabase.functions.invoke('places-proxy', {
      body: { action, payload }
    });
    
    if (error) {
      throw new Error(error.message || 'Places API call failed');
    }
    
    return data as PlacesResponse;
    
  } catch (error) {
    console.error('Places API error:', error);
    return {
      from: 'error',
      budget_exceeded: false,
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Search for places using text query
 */
export async function searchPlacesByText(
  query: string, 
  options: { region?: string; radius?: number } = {}
): Promise<PlacesResponse> {
  return places('search_text', {
    query,
    ...options
  });
}

/**
 * Get detailed information about a specific place
 */
export async function getPlaceDetails(
  placeId: string, 
  fields: string[] = DEFAULT_PLACE_FIELDS
): Promise<PlacesResponse> {
  return places('place_details', {
    place_id: placeId,
    fields
  });
}

/**
 * Extract useful information from Google Places API response
 */
export function extractPlaceInfo(placeData: any) {
  if (!placeData?.result && !placeData?.candidates?.[0]) {
    return null;
  }
  
  const place = placeData.result || placeData.candidates[0];
  
  return {
    placeId: place.place_id,
    name: place.name,
    address: place.formatted_address,
    location: place.geometry?.location,
    phone: place.formatted_phone_number,
    website: place.website,
    rating: place.rating,
    userRatingsTotal: place.user_ratings_total,
    openingHours: place.opening_hours?.weekday_text,
    isOpen: place.opening_hours?.open_now
  };
}

/**
 * Hook for showing budget exceeded warnings in UI
 */
export function usePlacesBudgetWarning(budgetExceeded: boolean) {
  return {
    showWarning: budgetExceeded,
    warningMessage: "Using cached results due to monthly API budget limit. Data may be slightly outdated."
  };
}