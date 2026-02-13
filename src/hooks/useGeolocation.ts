import { useState, useEffect, useCallback, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import {
  GeolocationResult,
  createInitialGeolocationState,
  createBrowserLocationResult,
  createIPLocationResult,
  createFallbackLocationResult,
  mergeGeolocationOptions,
} from '@/lib/core';
import { useIPGeolocation, getCachedIPGeolocation } from './useIPGeolocation';

// Convert IP geolocation data to GeolocationResult format
const convertIPDataToResult = (data: {
  latitude: number;
  longitude: number;
  city: string;
  region: string;
  source: 'ip' | 'fallback';
}): GeolocationResult => {
  return createIPLocationResult({
    latitude: data.latitude,
    longitude: data.longitude,
    city: data.city,
    region: data.region,
    source: data.source,
  });
};

// Get IP location using cached data (synchronous if available)
const getIPLocationFromCache = (): GeolocationResult => {
  const cached = getCachedIPGeolocation();
  if (cached) {
    return convertIPDataToResult(cached);
  }
  return createFallbackLocationResult();
};

export const useGeolocation = () => {
  const [location, setLocation] = useState<GeolocationResult>(createInitialGeolocationState());
  const browserRequestedRef = useRef(false);
  
  // Subscribe to the shared IP geolocation store
  const { data: ipData, loading: ipLoading } = useIPGeolocation();

  const tryIPFallback = useCallback(() => {
    console.log('Trying IP geolocation fallback...');
    setLocation(prev => ({ ...prev, loading: true }));
    const ipLocation = getIPLocationFromCache();
    setLocation(ipLocation);
  }, []);

  const requestBrowserLocation = useCallback(() => {
    const platform = Capacitor.getPlatform();
    const isNative = platform !== 'web';
    const isIOS = platform === 'ios';

    browserRequestedRef.current = true;
    setLocation(prev => ({ ...prev, loading: true }));

    const handleSuccess = (position: any) => {
      setLocation(createBrowserLocationResult(
        position.coords.latitude,
        position.coords.longitude
      ));
    };

    const handleError = () => {
      // Permission denied or error - silently use IP fallback from cache
      console.log('Browser location denied/failed, using IP fallback');
      const ipLocation = getIPLocationFromCache();
      setLocation(ipLocation);
    };

    // Native platform handling (excluding iOS)
    if (isNative && !isIOS) {
      (async () => {
        try {
          const perm = await Geolocation.requestPermissions();
          const status = (perm as any)?.location || (perm as any)?.coarseLocation || (perm as any)?.fineLocation;
          if (status && status !== 'granted') {
            const ipLocation = getIPLocationFromCache();
            setLocation(ipLocation);
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
          handleError();
        }
      })();
      return;
    }

    // Web platform handling
    if (!('geolocation' in navigator)) {
      setLocation(getIPLocationFromCache());
      return;
    }

    const options = mergeGeolocationOptions({ timeout: 10000 });
    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, options);
  }, []);

  // Sync IP geolocation data — only if browser GPS hasn't been requested
  useEffect(() => {
    // Don't override browser GPS with IP data
    if (browserRequestedRef.current) return;
    
    if (ipLoading) {
      // Still loading IP data
      setLocation(prev => prev.loading ? prev : { ...prev, loading: true });
      return;
    }
    
    if (ipData) {
      setLocation(convertIPDataToResult(ipData));
    } else {
      setLocation(createFallbackLocationResult());
    }
  }, [ipData, ipLoading]);

  return { ...location, tryIPFallback, requestBrowserLocation };
};
