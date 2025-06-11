
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
  location?: {
    address1: string;
    address2?: string;
    city: string;
    state: string;
    zip_code: string;
  };
}

export interface YelpSearchResponse {
  businesses: YelpBusiness[];
  total: number;
}

// Enhanced cache with expiration to reduce API calls
const yelpCache = new Map<string, { data: YelpBusiness | null; timestamp: number }>();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Function to check if cache is valid
const isCacheValid = (timestamp: number): boolean => {
  return Date.now() - timestamp < CACHE_DURATION;
};

// Function to generate multiple search terms including address
const generateSearchTerms = (storeName: string, address?: string, city?: string): string[] => {
  const terms = [];
  
  // Original store name
  terms.push(storeName);
  
  // Store name with address
  if (address) {
    terms.push(`${storeName} ${address}`);
    if (city) {
      terms.push(`${storeName} ${address} ${city}`);
    }
  }
  
  // Store name with city only
  if (city) {
    terms.push(`${storeName} ${city}`);
  }
  
  // Remove numbers/store IDs from name
  const withoutNumbers = storeName.replace(/\s+\d+$/, '').trim();
  if (withoutNumbers !== storeName) {
    terms.push(withoutNumbers);
    if (address) {
      terms.push(`${withoutNumbers} ${address}`);
    }
    if (city) {
      terms.push(`${withoutNumbers} ${city}`);
    }
  }
  
  // Just the main brand name
  const mainBrand = storeName.split(' ')[0];
  if (mainBrand !== storeName && mainBrand.length > 2) {
    terms.push(mainBrand);
    if (address) {
      terms.push(`${mainBrand} ${address}`);
    }
  }
  
  // For stores like "FOOD MAXX", try "FoodMaxx" variations
  if (storeName.includes(' ')) {
    const combined = storeName.replace(/\s+/g, '');
    terms.push(combined);
    if (address) {
      terms.push(`${combined} ${address}`);
    }
  }
  
  return [...new Set(terms)]; // Remove duplicates
};

// Function to calculate similarity between strings (simple fuzzy matching)
const calculateSimilarity = (str1: string, str2: string): number => {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();
  
  if (s1 === s2) return 1;
  if (s1.includes(s2) || s2.includes(s1)) return 0.8;
  
  // Simple word matching
  const words1 = s1.split(/\s+/);
  const words2 = s2.split(/\s+/);
  const commonWords = words1.filter(word => 
    words2.some(w => w.includes(word) || word.includes(w))
  );
  
  return commonWords.length / Math.max(words1.length, words2.length);
};

// Function to find best match from Yelp results
const findBestMatch = (
  businesses: YelpBusiness[], 
  storeName: string, 
  address?: string
): YelpBusiness | null => {
  if (!businesses.length) return null;
  
  let bestMatch = businesses[0];
  let bestScore = 0;
  
  for (const business of businesses) {
    let score = calculateSimilarity(business.name, storeName);
    
    // Boost score if address matches
    if (address && business.location?.address1) {
      const addressSimilarity = calculateSimilarity(business.location.address1, address);
      score += addressSimilarity * 0.3; // Address contributes 30% to score
    }
    
    // Prefer closer businesses (distance boost)
    const distanceBoost = 1 - (businesses.indexOf(business) * 0.1);
    score += distanceBoost * 0.1;
    
    if (score > bestScore) {
      bestScore = score;
      bestMatch = business;
    }
  }
  
  // Only return if we have a reasonable match (>40% similarity)
  return bestScore > 0.4 ? bestMatch : null;
};

export const useYelpBusiness = (
  storeName: string,
  latitude: number,
  longitude: number,
  enabled: boolean = false,
  storeAddress?: string,
  city?: string
) => {
  const cacheKey = `${storeName}-${latitude}-${longitude}`;

  return useQuery({
    queryKey: ['yelp-business', cacheKey],
    queryFn: async (): Promise<YelpBusiness | null> => {
      console.log('🔍 Fetching Yelp data for:', { 
        storeName, 
        latitude, 
        longitude, 
        address: storeAddress,
        city 
      });
      
      // Check cache first with expiration
      const cached = yelpCache.get(cacheKey);
      if (cached && isCacheValid(cached.timestamp)) {
        console.log('📦 Using cached Yelp data for:', storeName);
        return cached.data;
      }

      try {
        console.log('🌐 Making API call to yelp-search function...');
        
        // Generate multiple search terms including address
        const searchTerms = generateSearchTerms(storeName, storeAddress, city);
        console.log('🔍 Trying search terms:', searchTerms);
        
        let business = null;
        
        // Try each search term until we find a good match
        for (const term of searchTerms) {
          console.log(`🔍 Searching for: "${term}"`);
          
          const { data: searchData, error: searchError } = await supabase.functions.invoke('yelp-search', {
            body: {
              term: term,
              latitude,
              longitude,
              radius: '3000', // 3km radius for broader search
              limit: '10', // Get more results for better matching
              sort_by: 'distance'
            }
          });

          if (searchError) {
            console.error('❌ Error calling yelp-search function:', searchError);
            
            // Check if it's a rate limit error
            if (searchError.message?.includes('429') || searchError.message?.includes('rate limit')) {
              console.warn('⚠️ Yelp API rate limit reached, stopping further requests');
              break;
            }
            continue;
          }

          console.log(`✅ Yelp search response for "${term}":`, searchData);

          if (searchData && searchData.businesses && searchData.businesses.length > 0) {
            // Use fuzzy matching to find the best result
            const bestMatch = findBestMatch(searchData.businesses, storeName, storeAddress);
            
            if (bestMatch) {
              business = bestMatch;
              console.log('🏪 Found best matching Yelp business:', business);
              
              // Use search result photos directly (no need for details API call)
              business.photos = business.image_url ? [business.image_url] : [];
              
              break;
            }
          }
        }
        
        if (!business) {
          console.log('❌ No suitable businesses found for any search terms');
        }
        
        // Cache the result with timestamp
        yelpCache.set(cacheKey, { 
          data: business, 
          timestamp: Date.now() 
        });
        
        return business;
      } catch (error) {
        console.error('💥 Error fetching Yelp data:', error);
        
        // Cache null result to avoid repeated failures
        yelpCache.set(cacheKey, { 
          data: null, 
          timestamp: Date.now() 
        });
        
        return null;
      }
    },
    enabled: enabled && !!storeName && !!latitude && !!longitude,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
    retry: (failureCount, error) => {
      // Don't retry on rate limit errors
      if (error?.message?.includes('429') || error?.message?.includes('rate limit')) {
        return false;
      }
      return failureCount < 1; // Only retry once
    },
  });
};

// Hook for lazy loading multiple stores - optimized for API limits
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
      
      // Process only 2 stores per batch to respect rate limits
      for (const store of stores.slice(0, 2)) {
        const cacheKey = `${store.store_name}-${store.latitude}-${store.longitude}`;
        
        // Check cache with expiration
        const cached = yelpCache.get(cacheKey);
        if (cached && isCacheValid(cached.timestamp)) {
          if (cached.data) {
            results.set(store.id, cached.data);
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
            business.photos = business.image_url ? [business.image_url] : [];
            
            yelpCache.set(cacheKey, { 
              data: business, 
              timestamp: Date.now() 
            });
            results.set(store.id, business);
          } else {
            // Cache null result
            yelpCache.set(cacheKey, { 
              data: null, 
              timestamp: Date.now() 
            });
          }

          // Longer delay between requests to respect rate limits
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          console.error(`Error fetching Yelp data for store ${store.id}:`, error);
          
          // Stop batch processing on rate limit
          if (error?.message?.includes('429') || error?.message?.includes('rate limit')) {
            console.warn('⚠️ Rate limit reached, stopping batch processing');
            break;
          }
        }
      }

      return results;
    },
    enabled: enabled && stores.length > 0,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
    retry: false, // Don't retry batch operations
  });
};
