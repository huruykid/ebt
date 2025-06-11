
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

// Function to generate multiple search terms
const generateSearchTerms = (storeName: string): string[] => {
  const terms = [storeName];
  
  // Remove numbers/store IDs
  const withoutNumbers = storeName.replace(/\s+\d+$/, '').trim();
  if (withoutNumbers !== storeName) {
    terms.push(withoutNumbers);
  }
  
  // Just the main brand name
  const mainBrand = storeName.split(' ')[0];
  if (mainBrand !== storeName && mainBrand.length > 2) {
    terms.push(mainBrand);
  }
  
  // For stores like "FOOD MAXX", try "FoodMaxx" variations
  if (storeName.includes(' ')) {
    const combined = storeName.replace(/\s+/g, '');
    terms.push(combined);
  }
  
  return terms;
};

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
        
        // Generate multiple search terms to try
        const searchTerms = generateSearchTerms(storeName);
        console.log('🔍 Trying search terms:', searchTerms);
        
        let business = null;
        
        // Try each search term until we find a match
        for (const term of searchTerms) {
          console.log(`🔍 Searching for: "${term}"`);
          
          const { data: searchData, error: searchError } = await supabase.functions.invoke('yelp-search', {
            body: {
              term: term,
              latitude,
              longitude,
              radius: '2000', // Increased radius to 2km
              limit: '5', // Get more results to increase chances
              sort_by: 'distance'
            }
          });

          if (searchError) {
            console.error('❌ Error calling yelp-search function:', searchError);
            continue;
          }

          console.log(`✅ Yelp search response for "${term}":`, searchData);

          if (searchData && searchData.businesses && searchData.businesses.length > 0) {
            // Look for the closest match by name similarity and distance
            const potentialMatches = searchData.businesses.filter(b => {
              const nameLower = b.name.toLowerCase();
              const termLower = term.toLowerCase();
              const storeNameLower = storeName.toLowerCase();
              
              // Check if business name contains our search term or vice versa
              return nameLower.includes(termLower) || 
                     termLower.includes(nameLower) ||
                     nameLower.includes(storeNameLower) ||
                     storeNameLower.includes(nameLower);
            });
            
            if (potentialMatches.length > 0) {
              business = potentialMatches[0]; // Take the first (closest) match
              console.log('🏪 Found matching Yelp business:', business);
              break;
            } else if (searchData.businesses.length > 0) {
              // If no name match, take the closest business as a fallback
              business = searchData.businesses[0];
              console.log('🏪 Using closest Yelp business as fallback:', business);
              break;
            }
          }
        }
        
        if (!business) {
          console.log('❌ No businesses found for any search terms');
          return null;
        }
        
        // Now get business details for more photos
        try {
          console.log('📸 Fetching business details for more photos...');
          const { data: detailsData, error: detailsError } = await supabase.functions.invoke('yelp-business-details', {
            body: {
              business_id: business.id
            }
          });

          if (!detailsError && detailsData && detailsData.photos) {
            console.log('📸 Got additional photos from details API:', detailsData.photos);
            business.photos = detailsData.photos;
          } else {
            console.log('📸 No additional photos available, using main image only');
            // Fallback to just the main image
            business.photos = business.image_url ? [business.image_url] : [];
          }
        } catch (detailsError) {
          console.log('📸 Details API error, using main image only:', detailsError);
          business.photos = business.image_url ? [business.image_url] : [];
        }
        
        // Cache the result
        yelpCache.set(cacheKey, business);
        
        return business;
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
