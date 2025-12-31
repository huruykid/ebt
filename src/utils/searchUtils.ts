import type { ParsedLocation, GeoCoordinates } from '@/types/searchTypes';
import type { StoreWithDistance } from '@/types/storeTypes';

/**
 * Geocode a location string using Nominatim API
 */
export async function geocodeLocation(location: string): Promise<GeoCoordinates | null> {
  try {
    const params = new URLSearchParams({
      q: location.trim(),
      format: 'json',
      addressdetails: '1',
      limit: '1',
      countrycodes: 'us',
    });
    
    const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
      headers: {
        'Accept': 'application/json',
      },
    });
    if (!res.ok) return null;
    
    const data = await res.json();
    if (Array.isArray(data) && data[0]?.lat && data[0]?.lon) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    }
    return null;
  } catch (error) {
    console.error('Geocode failed:', error);
    return null;
  }
}

/**
 * Parse a location string into city, state, and zip components
 */
export function parseLocation(location: string): ParsedLocation {
  const trimmed = location.trim();
  
  // Check for ZIP code (5 digits)
  const zipMatch = trimmed.match(/^\d{5}$/);
  if (zipMatch) {
    return { city: '', state: '', zip: zipMatch[0] };
  }
  
  // Check for City, ST format (e.g., "Fresno, CA")
  const cityStateMatch = trimmed.match(/^([^,]+),\s*([A-Za-z]{2})$/i);
  if (cityStateMatch) {
    return { 
      city: cityStateMatch[1].trim(), 
      state: cityStateMatch[2].toUpperCase(), 
      zip: '' 
    };
  }
  
  // Check for City, State (full name) format
  const cityFullStateMatch = trimmed.match(/^([^,]+),\s*([A-Za-z\s]+)$/i);
  if (cityFullStateMatch) {
    return { city: cityFullStateMatch[1].trim(), state: '', zip: '' };
  }
  
  // Default: treat as city name
  return { city: trimmed, state: '', zip: '' };
}

/**
 * Map API response to StoreWithDistance format with null defaults
 */
export function mapToStoreWithDistance(store: any, includeDistance = false): StoreWithDistance {
  return {
    id: store.id,
    Store_Name: store.store_name,
    Store_Street_Address: store.store_street_address,
    City: store.city,
    State: store.state,
    Zip_Code: store.zip_code,
    Store_Type: store.store_type,
    Latitude: store.latitude,
    Longitude: store.longitude,
    distance: includeDistance ? store.distance_miles : undefined,
    // Null defaults for optional fields
    Additional_Address: null,
    Zip4: null,
    County: null,
    Record_ID: null,
    ObjectId: null,
    Grantee_Name: null,
    X: null,
    Y: null,
    Incentive_Program: null,
    google_place_id: null,
    google_name: null,
    google_formatted_address: null,
    google_website: null,
    google_formatted_phone_number: null,
    google_opening_hours: null,
    google_rating: null,
    google_user_ratings_total: null,
    google_photos: null,
    google_last_updated: null,
    google_reviews: null,
    google_types: null,
    google_price_level: null,
    google_plus_code: null,
    google_business_status: null,
    google_geometry: null,
    google_vicinity: null,
    google_icon: null,
    google_icon_background_color: null,
    google_icon_mask_base_uri: null
  };
}

/**
 * Filter stores by query string (fuzzy matching)
 */
export function filterStoresByQuery(stores: StoreWithDistance[], query: string): StoreWithDistance[] {
  if (!query.trim()) return stores;
  
  const queryLower = query.toLowerCase().replace(/[^a-z0-9\s]/g, '');
  
  return stores.filter(store => {
    const storeName = (store.Store_Name || '').toLowerCase().replace(/[^a-z0-9\s]/g, '');
    const storeType = (store.Store_Type || '').toLowerCase().replace(/[^a-z0-9\s]/g, '');
    return storeName.includes(queryLower) || storeType.includes(queryLower);
  });
}

/**
 * Normalize query for fuzzy matching
 */
export function normalizeQuery(query: string): string {
  return query.toLowerCase().replace(/[^a-z0-9\s]/g, '');
}
