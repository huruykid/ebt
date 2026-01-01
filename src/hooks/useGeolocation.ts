import { useState, useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import { supabase } from '@/integrations/supabase/client';
import {
  GeolocationResult,
  createInitialGeolocationState,
  createBrowserLocationResult,
  createIPLocationResult,
  createFallbackLocationResult,
  mergeGeolocationOptions,
  DEFAULT_FALLBACK_LOCATION,
} from '@/lib/core';

// Try IP-based geolocation as fallback
const getIPLocation = async (): Promise<GeolocationResult> => {
  try {
    const { data, error } = await supabase.functions.invoke('ip-geolocation');
    
    if (error) {
      console.error('IP geolocation error:', error);
      throw error;
    }

    console.log('IP geolocation result:', data);
    
    return createIPLocationResult({
      latitude: data.latitude,
      longitude: data.longitude,
      city: data.city,
      region: data.region,
      source: data.source === 'fallback' ? 'fallback' : 'ip',
    });
  } catch (err) {
    console.error('Failed to get IP location:', err);
    // Ultimate fallback - US geographic center
    return createFallbackLocationResult();
  }
};

export const useGeolocation = () => {
  const [location, setLocation] = useState<GeolocationResult>(createInitialGeolocationState());

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

    const options = mergeGeolocationOptions();

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation(createBrowserLocationResult(
          position.coords.latitude,
          position.coords.longitude
        ));
      },
      async () => {
        // Permission denied - silently use IP fallback
        console.log('Browser location denied, using IP fallback');
        const ipLocation = await getIPLocation();
        setLocation(ipLocation);
      },
      options
    );
  }, []);

  useEffect(() => {
    let cancelled = false;
    const platform = Capacitor.getPlatform();
    const isNative = platform !== 'web';
    const isIOS = platform === 'ios';

    const setSafe = (updater: ((prev: GeolocationResult) => GeolocationResult) | GeolocationResult) => {
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
      setSafe(createBrowserLocationResult(
        position.coords.latitude,
        position.coords.longitude
      ));
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
        const options = mergeGeolocationOptions();
        const position = await Geolocation.getCurrentPosition({
          enableHighAccuracy: options.enableHighAccuracy,
          timeout: options.timeout,
          maximumAge: options.maximumAge,
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

      const options = mergeGeolocationOptions({ timeout: 8000 }); // Reduced timeout for faster fallback
      navigator.geolocation.getCurrentPosition(handleSuccess, handleError, options);
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
