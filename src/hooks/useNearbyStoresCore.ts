/**
 * Core utility functions for nearby stores hooks
 * Shared between useNearbyStores and useInfiniteNearbyStores
 */

import { supabase } from '@/integrations/supabase/client';
import { calculateDistance } from '@/lib/core/distance';
import type { Tables } from '@/integrations/supabase/types';
import { applyGroceryExclusion, applyFarmersMarketFiltering } from '@/utils/storeFiltering';

type Store = Tables<'snap_stores'>;

export interface StoreWithDistance extends Store {
  distance?: number;
}

export interface OptimizedNearbyResult {
  id: string;
  store_name: string;
  store_street_address: string;
  city: string;
  state: string;
  zip_code: string;
  store_type: string;
  latitude: number;
  longitude: number;
  distance_miles: number;
}

/**
 * Convert RPC result to StoreWithDistance format
 */
export const mapOptimizedResult = (result: OptimizedNearbyResult): StoreWithDistance => ({
  id: result.id,
  Store_Name: result.store_name,
  Store_Street_Address: result.store_street_address,
  City: result.city,
  State: result.state,
  Zip_Code: result.zip_code,
  Store_Type: result.store_type,
  Latitude: result.latitude,
  Longitude: result.longitude,
  distance: result.distance_miles,
  // Default null fields
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
  google_icon_mask_base_uri: null,
});

/**
 * Calculate trending scores for stores based on recent clicks
 */
export const calculateTrendingScores = async (
  storeIds: string[],
  userLat: number,
  userLng: number
): Promise<Map<string, number>> => {
  const trendingScores = new Map<string, number>();
  
  if (storeIds.length === 0) return trendingScores;

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: clickData } = await supabase
    .from('store_clicks')
    .select('store_id, clicked_at, user_latitude, user_longitude')
    .in('store_id', storeIds)
    .gte('clicked_at', thirtyDaysAgo.toISOString());

  clickData?.forEach((click) => {
    const clickDistance = calculateDistance(
      userLat,
      userLng,
      parseFloat(click.user_latitude.toString()),
      parseFloat(click.user_longitude.toString())
    );

    if (clickDistance <= 25) {
      const daysSinceClick =
        (Date.now() - new Date(click.clicked_at).getTime()) / (1000 * 60 * 60 * 24);
      const recencyWeight = Math.max(0.1, 1 - daysSinceClick / 30);

      const currentScore = trendingScores.get(click.store_id) || 0;
      trendingScores.set(click.store_id, currentScore + recencyWeight);
    }
  });

  return trendingScores;
};

/**
 * Sort stores by trending score, incentive program, and distance
 */
export const sortByTrending = (
  stores: StoreWithDistance[],
  trendingScores: Map<string, number>
): StoreWithDistance[] => {
  return [...stores].sort((a, b) => {
    const aScore = trendingScores.get(a.id) || 0;
    const bScore = trendingScores.get(b.id) || 0;

    if (aScore !== bScore) {
      return bScore - aScore;
    }

    const aHasIncentive = a.Incentive_Program ? 1 : 0;
    const bHasIncentive = b.Incentive_Program ? 1 : 0;
    if (aHasIncentive !== bHasIncentive) {
      return bHasIncentive - aHasIncentive;
    }

    return (a.distance || 0) - (b.distance || 0);
  });
};

/**
 * Apply category-specific filtering to stores
 * This is the GLOBAL function for category filtering - used by all nearby store hooks
 */
export const applyCategoryFiltering = (
  stores: StoreWithDistance[],
  category?: string
): StoreWithDistance[] => {
  if (!category || category === 'trending' || stores.length === 0) {
    return stores;
  }

  if (category === 'grocery') {
    console.log(`🏪 [Global] Applying grocery exclusions: ${stores.length} stores`);
    const filtered = applyGroceryExclusion(stores);
    console.log(`🏪 [Global] After grocery filtering: ${filtered.length} stores`);
    return filtered;
  }

  if (category === 'farmersmarket') {
    console.log(`🥕 [Global] Applying farmers market filtering: ${stores.length} stores`);
    const filtered = applyFarmersMarketFiltering(stores);
    console.log(`🥕 [Global] After farmers market filtering: ${filtered.length} stores`);
    return filtered;
  }

  return stores;
};

/**
 * Fetch stores using optimized RPC
 */
export const fetchOptimizedStores = async (
  latitude: number,
  longitude: number,
  radius: number,
  limit: number,
  storeTypes: string[]
): Promise<StoreWithDistance[]> => {
  try {
    const { data, error } = await supabase.rpc('get_nearby_stores', {
      user_lat: latitude,
      user_lng: longitude,
      radius_miles: radius,
      store_types: storeTypes.length > 0 ? storeTypes : null,
      result_limit: limit,
    });

    if (error) {
      console.error('Optimized nearby stores error:', error);
      throw error;
    }

    return (data || []).map(mapOptimizedResult);
  } catch (err) {
    // Handle network errors gracefully
    if (err instanceof TypeError && err.message === 'Failed to fetch') {
      console.warn('Network error fetching stores - returning empty results');
      return [];
    }
    throw err;
  }
};

/**
 * Fetch stores using fallback query with bounding box
 */
export const fetchFallbackStores = async (
  latitude: number,
  longitude: number,
  radius: number,
  limit: number,
  storeTypes: string[],
  namePatterns: string[],
  offset = 0
): Promise<StoreWithDistance[]> => {
  const latDelta = radius / 69;
  const lonDelta = radius / (69 * Math.cos((latitude * Math.PI) / 180));

  const minLat = latitude - latDelta;
  const maxLat = latitude + latDelta;
  const minLon = longitude - lonDelta;
  const maxLon = longitude + lonDelta;

  let query = supabase
    .from('snap_stores')
    .select('*')
    .not('Latitude', 'is', null)
    .not('Longitude', 'is', null)
    .gte('Latitude', minLat)
    .lte('Latitude', maxLat)
    .gte('Longitude', minLon)
    .lte('Longitude', maxLon);

  // Apply filters
  if (storeTypes.length > 0 || namePatterns.length > 0) {
    const filters: string[] = [];

    if (storeTypes.length > 0) {
      filters.push(...storeTypes.map((type) => `Store_Type.ilike.%${type}%`));
    }

    if (namePatterns.length > 0) {
      filters.push(...namePatterns.map((pattern) => `Store_Name.ilike.%${pattern}%`));
    }

    if (filters.length > 0) {
      query = query.or(filters.join(','));
    }
  }

  if (offset > 0) {
    query = query.range(offset, offset + limit - 1);
  } else {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching nearby stores:', error);
    throw error;
  }

  if (!data || !Array.isArray(data)) {
    return [];
  }

  return data
    .map((store) => ({
      ...store,
      distance: calculateDistance(latitude, longitude, store.Latitude!, store.Longitude!),
    }))
    .filter((store) => store.distance <= radius)
    .sort((a, b) => a.distance - b.distance);
};
