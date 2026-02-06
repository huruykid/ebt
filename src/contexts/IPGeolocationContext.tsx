import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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

interface IPGeolocationContextValue {
  data: IPGeolocationData | null;
  loading: boolean;
  error: Error | null;
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

const STORAGE_KEY = 'ip-geolocation-cache';

// Session storage helpers
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

const IPGeolocationContext = createContext<IPGeolocationContextValue>({
  data: null,
  loading: true,
  error: null,
});

export const IPGeolocationProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<IPGeolocationData | null>(() => getFromSession());
  const [loading, setLoading] = useState(() => getFromSession() === null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // If we already have cached data, don't fetch again
    const cached = getFromSession();
    if (cached) {
      setData(cached);
      setLoading(false);
      return;
    }

    // Fetch IP geolocation once
    const fetchIPGeolocation = async () => {
      try {
        console.log('IPGeolocationProvider: Fetching IP geolocation...');
        const { data: result, error: fetchError } = await supabase.functions.invoke('ip-geolocation');
        
        if (fetchError) {
          console.error('IP geolocation error:', fetchError);
          saveToSession(US_CENTER_FALLBACK);
          setData(US_CENTER_FALLBACK);
          setLoading(false);
          return;
        }

        const ipData: IPGeolocationData = {
          latitude: result.latitude,
          longitude: result.longitude,
          city: result.city || '',
          region: result.region || '',
          country: result.country || '',
          countryCode: result.countryCode || '',
          source: result.source === 'fallback' ? 'fallback' : 'ip',
        };

        console.log('IPGeolocationProvider: Got IP location', ipData.city, ipData.region);
        saveToSession(ipData);
        setData(ipData);
        setLoading(false);
      } catch (err) {
        console.error('Failed to get IP location:', err);
        saveToSession(US_CENTER_FALLBACK);
        setData(US_CENTER_FALLBACK);
        setError(err instanceof Error ? err : new Error('Failed to fetch IP location'));
        setLoading(false);
      }
    };

    fetchIPGeolocation();
  }, []);

  return (
    <IPGeolocationContext.Provider value={{ data, loading, error }}>
      {children}
    </IPGeolocationContext.Provider>
  );
};

/**
 * Hook to access IP geolocation data from context.
 * Must be used within IPGeolocationProvider.
 */
export const useIPGeolocationContext = (): IPGeolocationContextValue => {
  return useContext(IPGeolocationContext);
};

/**
 * Get cached IP geolocation data synchronously (from sessionStorage).
 */
export const getCachedIPGeolocation = (): IPGeolocationData | null => {
  return getFromSession();
};
