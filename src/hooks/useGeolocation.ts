
import { useState, useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import { supabase } from '@/integrations/supabase/client';

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  error: string | null;
  loading: boolean;
  source: 'browser' | 'ip' | 'fallback' | null;
  city?: string;
  region?: string;
}

// Try IP-based geolocation as fallback
const getIPLocation = async (): Promise<GeolocationState> => {
  try {
    const { data, error } = await supabase.functions.invoke('ip-geolocation');
    
    if (error) {
      console.error('IP geolocation error:', error);
      throw error;
    }

    console.log('IP geolocation result:', data);
    
    return {
      latitude: data.latitude,
      longitude: data.longitude,
      error: null,
      loading: false,
      source: data.source === 'fallback' ? 'fallback' : 'ip',
      city: data.city,
      region: data.region,
    };
  } catch (err) {
    console.error('Failed to get IP location:', err);
    // Ultimate fallback - US geographic center
    return {
      latitude: 39.8283,
      longitude: -98.5795,
      error: null,
      loading: false,
      source: 'fallback',
      city: 'United States',
      region: '',
    };
  }
};

export const useGeolocation = () => {
  const [location, setLocation] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    error: null,
    loading: true,
    source: null,
  });

  const tryIPFallback = useCallback(async () => {
    console.log('Trying IP geolocation fallback...');
    const ipLocation = await getIPLocation();
    setLocation(ipLocation);
  }, []);

  const requestBrowserLocation = useCallback(() => {
    if (!('geolocation' in navigator)) {
      // No browser geolocation - use IP fallback silently
      getIPLocation().then(ipLocation => setLocation(ipLocation));
      return;
    }

    setLocation(prev => ({ ...prev, loading: true }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          error: null,
          loading: false,
          source: 'browser',
        });
      },
      async () => {
        // Permission denied - silently use IP fallback
        console.log('Browser location denied, using IP fallback');
        const ipLocation = await getIPLocation();
        setLocation(ipLocation);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  }, []);

  useEffect(() => {
    let cancelled = false;
    const platform = Capacitor.getPlatform();
    const isNative = platform !== 'web';
    const isIOS = platform === 'ios';

    const setSafe = (updater: ((prev: GeolocationState) => GeolocationState) | GeolocationState) => {
      if (cancelled) return;
      setLocation(prev => (typeof updater === 'function' ? (updater as any)(prev) : updater));
    };

    const safetyTimer = setTimeout(async () => {
      // On timeout, try IP fallback instead of just showing error
      console.log('Browser geolocation timed out, trying IP fallback');
      const ipLocation = await getIPLocation();
      setSafe(ipLocation);
    }, 10000);

    const handleSuccess = (position: any) => {
      clearTimeout(safetyTimer);
      setSafe({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        error: null,
        loading: false,
        source: 'browser',
      });
    };

    const handleError = async (err: any) => {
      clearTimeout(safetyTimer);
      console.log('Browser geolocation failed:', err);
      
      // Instead of just showing error, try IP fallback
      const ipLocation = await getIPLocation();
      setSafe(ipLocation);
    };

    const getNative = async () => {
      try {
        const perm = await Geolocation.requestPermissions();
        const status = (perm as any)?.location || (perm as any)?.coarseLocation || (perm as any)?.fineLocation;
        if (status && status !== 'granted') {
          // Permission denied - use IP fallback
          const ipLocation = await getIPLocation();
          setSafe(ipLocation);
          return;
        }
        const position = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        });
        handleSuccess(position);
      } catch (err) {
        handleError(err);
      }
    };

    const getWeb = () => {
      if (!('geolocation' in navigator)) {
        clearTimeout(safetyTimer);
        // No browser geolocation - use IP fallback
        getIPLocation().then(ipLocation => setSafe(ipLocation));
        return;
      }

      navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
        enableHighAccuracy: true,
        timeout: 8000, // Reduced timeout for faster fallback
        maximumAge: 300000, // 5 minutes
      });
    };

    if (isNative && !isIOS) {
      getNative();
    } else {
      getWeb();
    }

    return () => {
      cancelled = true;
      clearTimeout(safetyTimer);
    };
  }, []);

  return { ...location, tryIPFallback, requestBrowserLocation };
};
