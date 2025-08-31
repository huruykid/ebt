import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Store } from '@/types/storeTypes';

export interface OptimizedGooglePlacesData {
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
  cached?: boolean;
  budget_exceeded?: boolean;
  data_source?: 'database' | 'places_api' | 'error';
}

// Check if cached Google data is still fresh (30 days)
const isCachedDataFresh = (lastUpdated?: string): boolean => {
  if (!lastUpdated) return false;
  const lastUpdate = new Date(lastUpdated);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  return lastUpdate > thirtyDaysAgo;
};

// Convert database google_* fields to consistent format
const formatDatabaseGoogleData = (store: Store): OptimizedGooglePlacesData | null => {
  // If no Google Place ID, we have no Google data
  if (!store.google_place_id) return null;

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
    data_source: 'database'
  };
};

export const useOptimizedGooglePlaces = (
  store: Store | null | undefined,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ['optimized-google-places', store?.id, store?.google_last_updated],
    queryFn: async (): Promise<OptimizedGooglePlacesData | null> => {
      if (!store || !store.Store_Name?.trim()) {
        console.warn('⚠️ No store data provided for Google Places lookup');
        return null;
      }

      // Step 1: Check if we have fresh cached data in the database
      if (store.google_place_id && isCachedDataFresh(store.google_last_updated)) {
        console.log('📦 Using fresh cached Google Places data from database for:', store.Store_Name);
        return formatDatabaseGoogleData(store);
      }

      // Step 2: If we have a place_id but stale data, fetch fresh details
      if (store.google_place_id) {
        console.log('🔄 Refreshing stale Google Places data via places-proxy for:', store.Store_Name);
        try {
          const response = await supabase.functions.invoke('places-proxy', {
            body: {
              action: 'place_details',
              payload: {
                place_id: store.google_place_id,
                store_id: store.id
              }
            }
          });
          
          if (response.error || !response.data?.data) {
            console.error('❌ Error refreshing Google Places data:', response.error);
            // Fallback to cached data even if stale
            return formatDatabaseGoogleData(store);
          }

          const placeData = response.data.data;
          if (!placeData) {
            // Fallback to cached data
            return formatDatabaseGoogleData(store);
          }

          return {
            place_id: placeData.id || placeData.place_id,
            name: placeData.displayName?.text || placeData.name,
            formatted_address: placeData.formattedAddress || placeData.formatted_address,
            formatted_phone_number: placeData.nationalPhoneNumber || placeData.formatted_phone_number,
            website: placeData.websiteUri || placeData.website,
            rating: placeData.rating,
            user_ratings_total: placeData.userRatingCount || placeData.user_ratings_total,
            opening_hours: placeData.regularOpeningHours || placeData.opening_hours,
            photos: placeData.photos,
            geometry: placeData.location ? {
              location: placeData.location
            } : undefined,
            cached: response.data.from === 'cache',
            budget_exceeded: response.data.budget_exceeded,
            data_source: 'places_api'
          };

        } catch (error) {
          console.error('💥 Error fetching Google Places details:', error);
          // Fallback to cached data
          return formatDatabaseGoogleData(store);
        }
      }

      // Step 3: No place_id yet, need to search first (rare case for new stores)
      console.log('🔍 No Google Place ID found, searching via places-proxy for:', store.Store_Name);
      try {
        const searchQuery = `${store.Store_Name} ${store.Store_Street_Address} ${store.City} ${store.State}`;
        const searchResponse = await supabase.functions.invoke('places-proxy', {
          body: {
            action: 'search_text',
            payload: {
              query: searchQuery.trim(),
              region: store.State || undefined
            }
          }
        });

        if (searchResponse.error || !searchResponse.data?.data?.places?.[0]) {
          console.log('😐 No Google Places search results found for:', store.Store_Name);
          return null;
        }

        const firstPlace = searchResponse.data.data.places[0];
        const placeId = firstPlace.id;
        
        if (!placeId) {
          console.log('😐 No valid place ID in search results for:', store.Store_Name);
          return null;
        }

        // Now get full details for this place
        const detailsResponse = await supabase.functions.invoke('places-proxy', {
          body: {
            action: 'place_details',
            payload: {
              place_id: placeId,
              store_id: store.id
            }
          }
        });

        const detailsData = detailsResponse.data?.data;
        const searchData = firstPlace;

        return {
          place_id: detailsData?.id || searchData.id,
          name: detailsData?.displayName?.text || searchData.displayName?.text,
          formatted_address: detailsData?.formattedAddress || searchData.formattedAddress,
          formatted_phone_number: detailsData?.nationalPhoneNumber || searchData.nationalPhoneNumber,
          website: detailsData?.websiteUri || searchData.websiteUri,
          rating: detailsData?.rating || searchData.rating,
          user_ratings_total: detailsData?.userRatingCount || searchData.userRatingCount,
          opening_hours: detailsData?.regularOpeningHours || searchData.regularOpeningHours,
          photos: detailsData?.photos || searchData.photos,
          geometry: detailsData?.location || searchData.location ? {
            location: detailsData?.location || searchData.location
          } : undefined,
          cached: searchResponse.data.from === 'cache',
          budget_exceeded: searchResponse.data.budget_exceeded || detailsResponse.data?.budget_exceeded,
          data_source: 'places_api'
        };

      } catch (error) {
        console.error('💥 Error searching for Google Places data:', error);
        return null;
      }
    },
    enabled: enabled && Boolean(store?.Store_Name?.trim()),
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60 * 2, // 2 hours
    retry: 1,
  });
};