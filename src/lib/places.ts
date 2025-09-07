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
  store_id?: string; // Optional: if provided, will update the store record
  fields?: string[];
}

/**
 * Comprehensive fields for Place Details to maximize data in single API call
 * Google charges per API call, not per field, so get complete data upfront
 * Updated for new Google Places API (Field Mask format)
 */
export const DEFAULT_PLACE_FIELDS = [
  // Core identification
  'id',
  'displayName',
  'formattedAddress',
  'location',
  'viewport',
  
  // Contact & web presence
  'websiteUri',
  'nationalPhoneNumber',
  'internationalPhoneNumber',
  
  // Business details
  'regularOpeningHours',
  'rating',
  'userRatingCount',
  'reviews',
  'priceLevel',
  'types',
  'businessStatus',
  
  // Visual & location data
  'photos',
  'iconMaskBaseUri',
  'iconBackgroundColor',
  'plusCode',
  'shortFormattedAddress',
  
  // Additional useful fields
  'utcOffsetMinutes',
  'accessibilityOptions',
  'allowsDogs',
  'curbsidePickup',
  'delivery',
  'dineIn',
  'editorialSummary',
  'outdoorSeating',
  'reservable',
  'servesBeer',
  'servesBreakfast',
  'servesBrunch',
  'servesDinner',
  'servesLunch',
  'servesVegetarianFood',
  'servesWine',
  'takeout'
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
 * @param placeId - Google Place ID
 * @param storeId - Optional: UUID of store record to update with Google data
 * @param fields - Fields to request from Google Places API
 */
export async function getPlaceDetails(
  placeId: string, 
  storeId?: string,
  fields: string[] = DEFAULT_PLACE_FIELDS
): Promise<PlacesResponse> {
  return places('place_details', {
    place_id: placeId,
    store_id: storeId,
    fields
  });
}

/**
 * Extract useful information from Google Places API response
 * Handles both old and new API response formats
 */
export function extractPlaceInfo(placeData: any) {
  if (!placeData && !placeData?.result && !placeData?.candidates?.[0]) {
    return null;
  }
  
  // Handle new API format (direct object) vs old API format (nested in result/candidates)
  const place = placeData?.result || placeData?.candidates?.[0] || placeData;
  
  return {
    placeId: place.id || place.place_id,
    name: place.displayName?.text || place.name,
    address: place.formattedAddress || place.formatted_address,
    location: place.location || place.geometry?.location,
    phone: place.nationalPhoneNumber || place.formatted_phone_number,
    website: place.websiteUri || place.website,
    rating: place.rating,
    userRatingsTotal: place.userRatingCount || place.user_ratings_total,
    openingHours: place.regularOpeningHours?.weekdayDescriptions || place.opening_hours?.weekday_text,
    isOpen: place.regularOpeningHours?.openNow || place.opening_hours?.open_now,
    photos: place.photos
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