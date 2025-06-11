
import { useQuery } from '@tanstack/react-query';

interface NominatimSearchResult {
  place_id: number;
  licence: string;
  osm_type: string;
  osm_id: number;
  boundingbox: string[];
  lat: string;
  lon: string;
  display_name: string;
  class: string;
  type: string;
  importance: number;
  icon?: string;
  address?: {
    house_number?: string;
    road?: string;
    suburb?: string;
    city?: string;
    county?: string;
    state?: string;
    postcode?: string;
    country?: string;
    country_code?: string;
  };
}

export interface NominatimReverseResult {
  place_id: number;
  licence: string;
  osm_type: string;
  osm_id: number;
  lat: string;
  lon: string;
  display_name: string;
  address: {
    house_number?: string;
    road?: string;
    suburb?: string;
    city?: string;
    county?: string;
    state?: string;
    postcode?: string;
    country?: string;
    country_code?: string;
  };
  boundingbox: string[];
}

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';

// User-Agent is required for Nominatim API
const HEADERS = {
  'User-Agent': 'EBT-Finder-App/1.0 (https://ebtfinder.app)',
};

export const useNominatimSearch = (query: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['nominatim-search', query],
    queryFn: async (): Promise<NominatimSearchResult[]> => {
      if (!query.trim()) return [];

      try {
        const params = new URLSearchParams({
          q: query.trim(),
          format: 'json',
          addressdetails: '1',
          limit: '5',
          countrycodes: 'us', // Limit to US for EBT stores
          dedupe: '1',
        });

        const response = await fetch(
          `${NOMINATIM_BASE_URL}/search?${params}`,
          { headers: HEADERS }
        );

        if (!response.ok) {
          console.error('Nominatim search error:', response.status);
          return [];
        }

        const data = await response.json();
        return data || [];
      } catch (error) {
        console.error('Nominatim search exception:', error);
        return [];
      }
    },
    enabled: enabled && !!query.trim(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

export const useNominatimReverse = (lat: number, lon: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['nominatim-reverse', lat, lon],
    queryFn: async (): Promise<NominatimReverseResult | null> => {
      if (!lat || !lon) return null;

      try {
        const params = new URLSearchParams({
          lat: lat.toString(),
          lon: lon.toString(),
          format: 'json',
          addressdetails: '1',
          zoom: '18',
        });

        const response = await fetch(
          `${NOMINATIM_BASE_URL}/reverse?${params}`,
          { headers: HEADERS }
        );

        if (!response.ok) {
          console.error('Nominatim reverse error:', response.status);
          return null;
        }

        const data = await response.json();
        return data || null;
      } catch (error) {
        console.error('Nominatim reverse exception:', error);
        return null;
      }
    },
    enabled: enabled && !!(lat && lon),
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });
};

// Utility function to format address from Nominatim result
export const formatNominatimAddress = (address: NominatimSearchResult['address']): string => {
  if (!address) return '';
  
  const parts = [
    address.house_number,
    address.road,
    address.city || address.suburb,
    address.state,
    address.postcode
  ].filter(Boolean);
  
  return parts.join(', ');
};

// Utility function to get coordinates from Nominatim result
export const getNominatimCoordinates = (result: NominatimSearchResult): { lat: number; lng: number } => {
  return {
    lat: parseFloat(result.lat),
    lng: parseFloat(result.lon)
  };
};
