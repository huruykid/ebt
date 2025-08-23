
import React from 'react';
import { useOverpassData } from './useOverpassData';
import { useGooglePlacesBusiness } from './useGooglePlaces';
import type { Tables } from '@/integrations/supabase/types';

type Store = Tables<'snap_stores'>;

interface EnhancedStoreInfo {
  phone?: string;
  website?: string;
  hours?: string;
  rating?: number;
  review_count?: number;
  categories?: string[];
  image_url?: string;
  price_level?: string;
  data_sources: string[];
  confidence_score: number;
}

export const useEnhancedStoreData = (store: Store) => {
  const { data: overpassData, isLoading: overpassLoading } = useOverpassData({
    storeName: store.Store_Name || '',
    latitude: store.Latitude || 0,
    longitude: store.Longitude || 0,
    enabled: !!(store.Store_Name && store.Latitude && store.Longitude)
  });

  const { data: googlePlacesData, isLoading: googlePlacesLoading } = useGooglePlacesBusiness(
    store.Store_Name || '',
    store.Store_Street_Address || '',
    store.Latitude || undefined,
    store.Longitude || undefined,
    !!(store.Store_Name && store.Latitude && store.Longitude)
  );

  const isLoading = overpassLoading || googlePlacesLoading;

  // Combine data from multiple sources
  const enhancedData: EnhancedStoreInfo | null = React.useMemo(() => {
    if (!overpassData && !googlePlacesData) return null;

    const sources: string[] = [];
    let combinedScore = 0;
    let sourceCount = 0;

    const result: EnhancedStoreInfo = {
      data_sources: sources,
      confidence_score: 0
    };

    // Prefer Google Places data for business info (usually more accurate)
    if (googlePlacesData) {
      sources.push('Google Places');
      combinedScore += 0.8; // Google Places generally has good accuracy
      sourceCount++;

      result.phone = googlePlacesData.formatted_phone_number;
      result.website = googlePlacesData.website;
      result.rating = googlePlacesData.rating;
      result.review_count = googlePlacesData.user_ratings_total;
      result.image_url = googlePlacesData.photos?.[0] 
        ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${googlePlacesData.photos[0].photo_reference}&key=${import.meta.env.VITE_GOOGLE_PLACES_API_KEY || ''}`
        : undefined;
      result.price_level = googlePlacesData.price_level?.toString();
      result.categories = googlePlacesData.types?.map(type => type.replace(/_/g, ' ')) || [];
      
      // Convert Google Places opening hours to simple format if available
      if (googlePlacesData.opening_hours?.weekday_text?.[new Date().getDay()]) {
        result.hours = googlePlacesData.opening_hours.weekday_text[new Date().getDay()];
      }
    }

    // Use OpenStreetMap data as fallback or additional info
    if (overpassData) {
      sources.push('OpenStreetMap');
      combinedScore += overpassData.confidence_score;
      sourceCount++;

      // Use OSM data if Google Places doesn't have it
      if (!result.phone && overpassData.phone) {
        result.phone = overpassData.phone;
      }
      if (!result.website && overpassData.website) {
        result.website = overpassData.website;
      }
      if (!result.hours && overpassData.opening_hours) {
        result.hours = overpassData.opening_hours;
      }
      
      // Add OSM categories if available
      if (overpassData.shop_type) {
        result.categories = result.categories || [];
        if (!result.categories.includes(overpassData.shop_type)) {
          result.categories.push(overpassData.shop_type);
        }
      }
    }

    result.confidence_score = sourceCount > 0 ? combinedScore / sourceCount : 0;
    
    return result;
  }, [overpassData, googlePlacesData]);

  return {
    data: enhancedData,
    isLoading,
    sources: {
      overpass: overpassData,
      googlePlaces: googlePlacesData
    }
  };
};
