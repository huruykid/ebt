import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface GooglePlacesBusiness {
  place_id: string;
  name: string;
  formatted_address?: string;
  formatted_phone_number?: string;
  website?: string;
  rating?: number;
  user_ratings_total?: number;
  price_level?: number;
  opening_hours?: {
    open_now?: boolean;
    weekday_text?: string[];
  };
  photos?: Array<{
    photo_reference: string;
    photo_url?: string;
    width: number;
    height: number;
  }>;
  reviews?: Array<{
    author_name: string;
    author_url?: string;
    language: string;
    profile_photo_url?: string;
    rating: number;
    relative_time_description: string;
    text: string;
    time: number;
  }>;
  types?: string[];
  geometry?: {
    location: {
      lat: number;
      lng: number;
    };
  };
  vicinity?: string;
  icon?: string;
  icon_background_color?: string;
  icon_mask_base_uri?: string;
  business_status?: string;
  plus_code?: {
    global_code: string;
    compound_code?: string;
  };
}

interface GooglePlacesResponse {
  business: GooglePlacesBusiness | null;
  cached: boolean;
}

// In-memory cache to reduce duplicate requests within the same session
const googlePlacesCache = new Map<string, { data: GooglePlacesBusiness | null; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 30; // 30 minutes session cache

// Function to find best match from Google Places results
const generateCacheKey = (storeName: string, address?: string): string => {
  return `${storeName.toLowerCase().trim()}_${(address || '').toLowerCase().trim()}`;
};

export const useGooglePlacesBusiness = (
  storeName: string,
  address?: string,
  latitude?: number,
  longitude?: number,
  enabled: boolean = true
) => {
  const cacheKey = generateCacheKey(storeName, address);

  return useQuery({
    queryKey: ['google-places-business', cacheKey],
    queryFn: async (): Promise<GooglePlacesBusiness | null> => {
      console.log('🔍 Fetching Google Places data for:', { 
        storeName, 
        address,
        latitude,
        longitude 
      });

      if (!storeName?.trim()) {
        console.warn('⚠️ No store name provided for Google Places lookup');
        return null;
      }

      try {
        // Check session cache first
        const cached = googlePlacesCache.get(cacheKey);
        if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
          console.log('📦 Using session cached Google Places data for:', storeName);
          return cached.data;
        }

        console.log('🌐 Making API call to google-places function...');

        const { data: searchData, error: searchError } = await supabase.functions.invoke('google-places', {
          body: {
            storeName: storeName.trim(),
            address: address?.trim(),
            latitude,
            longitude
          },
        });

        if (searchError) {
          console.error('❌ Error calling google-places function:', searchError);
          
          // Set empty cache to prevent repeated failed requests
          googlePlacesCache.set(cacheKey, { 
            data: null, 
            timestamp: Date.now() 
          });
          
          return null;
        }

        const response = searchData as GooglePlacesResponse;
        console.log(`✅ Google Places response for "${storeName}":`, response);

        const business = response.business || null;

        if (business) {
          console.log('🏪 Found Google Places business:', business);
        } else {
          console.log('😐 No Google Places match found for:', storeName);
        }

        // Cache the result in session cache
        googlePlacesCache.set(cacheKey, { 
          data: business, 
          timestamp: Date.now() 
        });

        return business;

      } catch (error) {
        console.error('💥 Error fetching Google Places data:', error);
        
        // Set empty cache to prevent repeated failed requests
        googlePlacesCache.set(cacheKey, { 
          data: null, 
          timestamp: Date.now() 
        });
        
        return null;
      }
    },
    enabled: enabled && Boolean(storeName?.trim()),
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60 * 2, // 2 hours
    retry: 1,
  });
};