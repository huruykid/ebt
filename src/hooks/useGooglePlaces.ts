
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface GooglePlacesSearchResult {
  place_id: string;
  name: string;
  formatted_address: string;
  rating?: number;
  user_ratings_total?: number;
  photos?: Array<{
    photo_reference: string;
    height: number;
    width: number;
  }>;
}

interface GooglePlacesDetails {
  place_id: string;
  name: string;
  formatted_address: string;
  formatted_phone_number?: string;
  international_phone_number?: string;
  opening_hours?: {
    open_now: boolean;
    weekday_text: string[];
  };
  photos?: Array<{
    photo_reference: string;
    height: number;
    width: number;
  }>;
  rating?: number;
  user_ratings_total?: number;
  website?: string;
  business_status?: string;
}

export const useGooglePlacesSearch = (query: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['google-places-search', query],
    queryFn: async (): Promise<GooglePlacesSearchResult[]> => {
      if (!query.trim()) return [];

      try {
        const { data, error } = await supabase.functions.invoke('google-places', {
          body: {
            action: 'search',
            query: query.trim()
          }
        });

        if (error) {
          console.error('Google Places search error:', error);
          // Return empty array instead of throwing to prevent cascading failures
          return [];
        }

        if (!data || !data.success) {
          console.error('Google Places search failed:', data?.error || 'Unknown error');
          // Return empty array instead of throwing to prevent cascading failures
          return [];
        }

        return data.results || [];
      } catch (error) {
        console.error('Google Places search exception:', error);
        // Return empty array instead of throwing to prevent cascading failures
        return [];
      }
    },
    enabled: enabled && !!query.trim(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false, // Don't retry failed requests to avoid API quota issues
  });
};

export const useGooglePlacesDetails = (placeId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['google-places-details', placeId],
    queryFn: async (): Promise<GooglePlacesDetails | null> => {
      if (!placeId) return null;

      try {
        const { data, error } = await supabase.functions.invoke('google-places', {
          body: {
            action: 'details',
            place_id: placeId
          }
        });

        if (error) {
          console.error('Google Places details error:', error);
          return null;
        }

        if (!data || !data.success) {
          console.error('Google Places details failed:', data?.error || 'Unknown error');
          return null;
        }

        return data.result || null;
      } catch (error) {
        console.error('Google Places details exception:', error);
        return null;
      }
    },
    enabled: enabled && !!placeId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: false, // Don't retry failed requests to avoid API quota issues
  });
};

export const getGooglePlacesPhotoUrl = async (photoReference: string, maxWidth: number = 400): Promise<string | null> => {
  try {
    const { data, error } = await supabase.functions.invoke('google-places', {
      body: {
        action: 'photo',
        photo_reference: photoReference,
        max_width: maxWidth
      }
    });

    if (error || !data || !data.success) {
      console.error('Google Places photo error:', error || data?.error);
      return null;
    }

    return data.photo_url;
  } catch (error) {
    console.error('Failed to get photo URL:', error);
    return null;
  }
};
