
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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
      console.log('🔍 Fetching Yelp data for:', { storeName, latitude, longitude });
      
      // Check cache first
      if (yelpCache.has(cacheKey)) {
        console.log('📦 Using cached Yelp data for:', storeName);
        return yelpCache.get(cacheKey) || null;
      }

      try {
        console.log('🌐 Making API call to yelp-search function...');
        const { data, error } = await supabase.functions.invoke('yelp-search', {
          body: {
            term: storeName,
            latitude,
            longitude,
            radius: '1000',
            limit: '1',
            sort_by: 'distance'
          }
        });

        if (error) {
          console.error('❌ Error calling yelp-search function:', error);
          return null;
        }

        console.log('✅ Yelp API response:', data);

        if (data && data.businesses && data.businesses.length > 0) {
          const business = data.businesses[0];
          console.log('🏪 Found Yelp business:', business);
          
          // Cache the result
          yelpCache.set(cacheKey, business);
          
          return business;
        } else {
          console.log('❌ No businesses found in Yelp response');
        }

        return null;
      } catch (error) {
        console.error('💥 Error fetching Yelp data:', error);
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
          const { data, error } = await supabase.functions.invoke('yelp-search', {
            body: {
              term: store.store_name,
              latitude: store.latitude,
              longitude: store.longitude,
              radius: '1000',
              limit: '1',
              sort_by: 'distance'
            }
          });

          if (!error && data && data.businesses && data.businesses.length > 0) {
            const business = data.businesses[0];
            yelpCache.set(cacheKey, business);
            results.set(store.id, business);
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
