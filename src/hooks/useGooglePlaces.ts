import { useQuery } from '@tanstack/react-query';
import { searchPlacesByText } from '@/lib/places';

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

// Performance optimization: In-memory cache and request deduplication
const googlePlacesCache = new Map<string, { data: GooglePlacesBusiness | null; timestamp: number }>();
const ongoingRequests = new Map<string, Promise<GooglePlacesBusiness | null>>();
const CACHE_TTL = 1000 * 60 * 30; // 30 minutes session cache

// Improved cache key generation for better hit rates
const generateCacheKey = (storeName: string, address?: string): string => {
  const normalizedName = storeName.toLowerCase().trim().replace(/[^\w\s]/g, '');
  const normalizedAddress = (address || '').toLowerCase().trim().replace(/[^\w\s]/g, '');
  return `${normalizedName}_${normalizedAddress}`;
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
      if (!storeName?.trim()) {
        return null;
      }

      // Check session cache first
      const cached = googlePlacesCache.get(cacheKey);
      if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
        return cached.data;
      }

      // Check if there's an ongoing request for this cache key
      const ongoingRequest = ongoingRequests.get(cacheKey);
      if (ongoingRequest) {
        return ongoingRequest;
      }

      // Create new request and cache the promise
      const requestPromise = (async (): Promise<GooglePlacesBusiness | null> => {
        try {
          const searchQuery = `${storeName.trim()} ${address?.trim() || ''}`.trim();
          const response = await searchPlacesByText(searchQuery);

          if (response.error || !response.data?.places?.[0]) {
            if (response.error?.includes('Budget exceeded')) {
              console.warn('Google Places API budget exceeded, using basic store data');
              return null;
            }
            
            console.error('Error calling places-proxy function:', response.error);
            googlePlacesCache.set(cacheKey, { data: null, timestamp: Date.now() });
            return null;
          }

          const business = response.data.places[0] || null;

          googlePlacesCache.set(cacheKey, { 
            data: business, 
            timestamp: Date.now() 
          });

          return business;

        } catch (error) {
          console.error('Error fetching Google Places data:', error);
          googlePlacesCache.set(cacheKey, { data: null, timestamp: Date.now() });
          return null;
        } finally {
          ongoingRequests.delete(cacheKey);
        }
      })();

      ongoingRequests.set(cacheKey, requestPromise);
      return requestPromise;
    },
    enabled: enabled && Boolean(storeName?.trim()),
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60 * 2,
    retry: 1,
  });
};

// Batch hook for multiple stores (optional, for future optimization)
export const useGooglePlacesBusinessBatch = (
  stores: Array<{ id: number; name: string; address?: string; latitude?: number; longitude?: number }>,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ['google-places-batch', stores.map(s => s.id).join(',')],
    queryFn: async (): Promise<Map<number, GooglePlacesBusiness>> => {
      const results = new Map<number, GooglePlacesBusiness>();
      
      for (const store of stores) {
        const cacheKey = generateCacheKey(store.name, store.address);
        
        const cached = googlePlacesCache.get(cacheKey);
        if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
          if (cached.data) {
            results.set(store.id, cached.data);
          }
          continue;
        }

        try {
          const searchQuery = `${store.name.trim()} ${store.address?.trim() || ''}`.trim();
          const response = await searchPlacesByText(searchQuery);
          
          if (response.error || !response.data?.places?.[0]) {
            continue;
          }
          
          const data = response.data.places[0];

          if (data) {
            results.set(store.id, data);
            const cacheKey = generateCacheKey(store.name, store.address);
            googlePlacesCache.set(cacheKey, { data: data, timestamp: Date.now() });
          }
        } catch (error) {
          console.error(`Error fetching Google Places data for store ${store.id}:`, error);
        }

        await new Promise(resolve => setTimeout(resolve, 100));
      }

      return results;
    },
    enabled: enabled && stores.length > 0,
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60 * 2,
  });
};
