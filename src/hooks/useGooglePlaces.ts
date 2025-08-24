import { useQuery } from '@tanstack/react-query';
import { GooglePlacesBusiness, GooglePlacesService } from '@/services/googlePlaces';

export const useGooglePlacesBusiness = (
  storeName: string,
  address?: string,
  latitude?: number,
  longitude?: number,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ['google-places-business', storeName, address, latitude, longitude],
    queryFn: () => GooglePlacesService.getBusinessData(storeName, address, latitude, longitude),
    enabled: enabled && Boolean(storeName?.trim()),
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60 * 2, // 2 hours
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
      
      // Process stores sequentially to avoid rate limits
      for (const store of stores) {
        const cacheKey = generateCacheKey(store.name, store.address);
        
        // Check session cache first
        const cached = googlePlacesCache.get(cacheKey);
        if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
          if (cached.data) {
            results.set(store.id, cached.data);
          }
          continue;
        }

        try {
          const { data, error } = await supabase.functions.invoke('google-places', {
            body: {
              storeName: store.name.trim(),
              address: store.address?.trim(),
              latitude: store.latitude,
              longitude: store.longitude
            },
          });

          if (!error && data?.business) {
            results.set(store.id, data.business);
            googlePlacesCache.set(cacheKey, { 
              data: data.business, 
              timestamp: Date.now() 
            });
          } else {
            googlePlacesCache.set(cacheKey, { 
              data: null, 
              timestamp: Date.now() 
            });
          }
        } catch (error) {
          console.error(`Error fetching Google Places data for store ${store.id}:`, error);
        }

        // Small delay to be respectful to APIs
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      return results;
    },
    enabled: enabled && stores.length > 0,
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60 * 2, // 2 hours
  });
};