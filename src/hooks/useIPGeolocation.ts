import { useQuery, QueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface IPGeolocationData {
  latitude: number;
  longitude: number;
  city: string;
  region: string;
  country: string;
  countryCode: string;
  source: 'ip' | 'fallback';
}

const US_CENTER_FALLBACK: IPGeolocationData = {
  latitude: 39.8283,
  longitude: -98.5795,
  city: 'United States',
  region: '',
  country: 'US',
  countryCode: 'US',
  source: 'fallback',
};

const QUERY_KEY = ['ip-geolocation'] as const;
const STORAGE_KEY = 'ip-geolocation-cache';

// Check sessionStorage for cached data - SYNCHRONOUS
const getFromSession = (): IPGeolocationData | null => {
  try {
    const cached = sessionStorage.getItem(STORAGE_KEY);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch {
    // Ignore parse errors
  }
  return null;
};

const saveToSession = (data: IPGeolocationData) => {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Ignore storage errors
  }
};

// The actual fetch function - only called if no cache exists
const fetchIPGeolocation = async (): Promise<IPGeolocationData> => {
  try {
    const { data, error } = await supabase.functions.invoke('ip-geolocation');
    
    if (error) {
      console.error('IP geolocation error:', error);
      saveToSession(US_CENTER_FALLBACK);
      return US_CENTER_FALLBACK;
    }

    console.log('IP geolocation result:', data);
    
    const result: IPGeolocationData = {
      latitude: data.latitude,
      longitude: data.longitude,
      city: data.city || '',
      region: data.region || '',
      country: data.country || '',
      countryCode: data.countryCode || '',
      source: data.source === 'fallback' ? 'fallback' : 'ip',
    };
    
    saveToSession(result);
    return result;
  } catch (err) {
    console.error('Failed to get IP location:', err);
    saveToSession(US_CENTER_FALLBACK);
    return US_CENTER_FALLBACK;
  }
};

/**
 * Hook to get IP-based geolocation with automatic caching and deduplication.
 * Uses React Query but ONLY if sessionStorage cache is empty.
 */
export const useIPGeolocation = () => {
  // Check for cached data SYNCHRONOUSLY before any React Query logic
  const cachedData = getFromSession();
  
  // If we have cached data, skip the query entirely
  const query = useQuery({
    queryKey: QUERY_KEY,
    queryFn: fetchIPGeolocation,
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
    // CRITICAL: Disable query entirely if we have cached data
    enabled: cachedData === null,
  });

  // Return cached data if available (query is disabled)
  if (cachedData) {
    return {
      data: cachedData,
      loading: false,
      error: null,
    };
  }

  return {
    data: query.data ?? null,
    loading: query.isLoading,
    error: query.error,
  };
};

/**
 * Get cached IP geolocation data synchronously.
 */
export const getCachedIPGeolocation = (): IPGeolocationData | null => {
  return getFromSession();
};

/**
 * Pre-seed the cache with IP geolocation data.
 * Call this ONCE at app startup before any components mount.
 */
export const initializeIPGeolocation = async (): Promise<IPGeolocationData> => {
  // Check cache first
  const cached = getFromSession();
  if (cached) {
    return cached;
  }
  
  // No cache, fetch and save
  return fetchIPGeolocation();
};
