
import { useQuery } from '@tanstack/react-query';

export interface YelpBusiness {
  id: string;
  name: string;
  image_url?: string;
  url: string;
  review_count: number;
  categories: Array<{
    alias: string;
    title: string;
  }>;
  rating: number;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  photos: string[];
  price?: string;
  hours?: Array<{
    open: Array<{
      is_overnight: boolean;
      start: string;
      end: string;
      day: number;
    }>;
    hours_type: string;
    is_open_now: boolean;
  }>;
  phone: string;
  display_phone: string;
}

export interface YelpSearchResponse {
  businesses: YelpBusiness[];
  total: number;
}

// Cache for Yelp data to avoid repeat API calls
const yelpCache = new Map<string, YelpBusiness>();

const YELP_API_KEY = 'YOUR_YELP_API_KEY'; // This should be in Supabase secrets

export const useYelpBusiness = (
  storeName: string,
  latitude: number,
  longitude: number,
  enabled: boolean = false
) => {
  const cacheKey = `${storeName}-${latitude}-${longitude}`;

  return useQuery({
    queryKey: ['yelp-business', cacheKey],
    queryFn: async (): Promise<YelpBusiness | null> => {
      // Check cache first
      if (yelpCache.has(cacheKey)) {
        return yelpCache.get(cacheKey) || null;
      }

      try {
        // Search for business by name and location
        const searchParams = new URLSearchParams({
          term: storeName,
          latitude: latitude.toString(),
          longitude: longitude.toString(),
          radius: '1000', // 1km radius
          limit: '1',
          sort_by: 'distance'
        });

        const response = await fetch(
          `https://api.yelp.com/v3/businesses/search?${searchParams}`,
          {
            headers: {
              'Authorization': `Bearer ${YELP_API_KEY}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          console.error('Yelp API error:', response.status);
          return null;
        }

        const data: YelpSearchResponse = await response.json();
        
        if (data.businesses && data.businesses.length > 0) {
          const business = data.businesses[0];
          
          // Cache the result
          yelpCache.set(cacheKey, business);
          
          return business;
        }

        return null;
      } catch (error) {
        console.error('Error fetching Yelp data:', error);
        return null;
      }
    },
    enabled: enabled && !!storeName && !!latitude && !!longitude,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
    retry: 1,
  });
};

// Hook for lazy loading multiple stores
export const useYelpBusinessBatch = (
  stores: Array<{
    id: number;
    store_name: string;
    latitude: number;
    longitude: number;
  }>,
  enabled: boolean = false
) => {
  return useQuery({
    queryKey: ['yelp-batch', stores.map(s => s.id).join(',')],
    queryFn: async (): Promise<Map<number, YelpBusiness>> => {
      const results = new Map<number, YelpBusiness>();
      
      // Process stores in small batches to respect rate limits
      for (const store of stores.slice(0, 3)) { // Limit to 3 stores per batch
        const cacheKey = `${store.store_name}-${store.latitude}-${store.longitude}`;
        
        if (yelpCache.has(cacheKey)) {
          const cached = yelpCache.get(cacheKey);
          if (cached) {
            results.set(store.id, cached);
          }
          continue;
        }

        try {
          const searchParams = new URLSearchParams({
            term: store.store_name,
            latitude: store.latitude.toString(),
            longitude: store.longitude.toString(),
            radius: '1000',
            limit: '1',
            sort_by: 'distance'
          });

          const response = await fetch(
            `https://api.yelp.com/v3/businesses/search?${searchParams}`,
            {
              headers: {
                'Authorization': `Bearer ${YELP_API_KEY}`,
                'Content-Type': 'application/json',
              },
            }
          );

          if (response.ok) {
            const data: YelpSearchResponse = await response.json();
            if (data.businesses && data.businesses.length > 0) {
              const business = data.businesses[0];
              yelpCache.set(cacheKey, business);
              results.set(store.id, business);
            }
          }

          // Small delay between requests to respect rate limits
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          console.error(`Error fetching Yelp data for store ${store.id}:`, error);
        }
      }

      return results;
    },
    enabled: enabled && stores.length > 0,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
    retry: 1,
  });
};
