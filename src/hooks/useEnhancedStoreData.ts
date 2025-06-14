
import { useOverpassData } from './useOverpassData';
import { useYelpBusiness } from './useYelp';
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

  const { data: yelpData, isLoading: yelpLoading } = useYelpBusiness(
    store.Store_Name || '',
    store.Latitude || 0,
    store.Longitude || 0,
    !!(store.Store_Name && store.Latitude && store.Longitude)
  );

  const isLoading = overpassLoading || yelpLoading;

  // Combine data from multiple sources
  const enhancedData: EnhancedStoreInfo | null = React.useMemo(() => {
    if (!overpassData && !yelpData) return null;

    const sources: string[] = [];
    let combinedScore = 0;
    let sourceCount = 0;

    const result: EnhancedStoreInfo = {
      data_sources: sources,
      confidence_score: 0
    };

    // Prefer Yelp data for business info (usually more accurate)
    if (yelpData) {
      sources.push('Yelp');
      combinedScore += 0.8; // Yelp generally has good accuracy
      sourceCount++;

      result.phone = yelpData.display_phone;
      result.website = yelpData.url;
      result.rating = yelpData.rating;
      result.review_count = yelpData.review_count;
      result.image_url = yelpData.image_url;
      result.price_level = yelpData.price;
      result.categories = yelpData.categories?.map(cat => cat.title) || [];
      
      // Convert Yelp hours to simple format if available
      if (yelpData.hours?.[0]?.open) {
        const todayHours = yelpData.hours[0].open.find(h => h.day === new Date().getDay());
        if (todayHours) {
          result.hours = `${todayHours.start} - ${todayHours.end}`;
        }
      }
    }

    // Use OpenStreetMap data as fallback or additional info
    if (overpassData) {
      sources.push('OpenStreetMap');
      combinedScore += overpassData.confidence_score;
      sourceCount++;

      // Use OSM data if Yelp doesn't have it
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
  }, [overpassData, yelpData]);

  return {
    data: enhancedData,
    isLoading,
    sources: {
      overpass: overpassData,
      yelp: yelpData
    }
  };
};
