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
  latitude: number | null;
  longitude: number | null;
  city: string;
  region: string;
  source: 'ip' | 'fallback' | 'blocked';
}): GeolocationResult => {
  // Blocked/non-US traffic: treat as fallback with no coordinates
  if (data.source === 'blocked' || data.latitude == null || data.longitude == null) {
    return createFallbackLocationResult();
  }
  return createIPLocationResult({
    latitude: data.latitude,
    longitude: data.longitude,
    city: data.city,
    region: data.region,
    source: data.source as 'ip' | 'fallback',
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

const SESSION_KEY = 'ebt-browser-location';
const SESSION_MAX_AGE_MS = 30 * 60 * 1000; // 30 minutes

const saveBrowserLocation = (lat: number, lng: number) => {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ latitude: lat, longitude: lng, timestamp: Date.now() }));
  } catch {}
};

const loadBrowserLocation = (): { latitude: number; longitude: number } | null => {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Date.now() - parsed.timestamp > SESSION_MAX_AGE_MS) {
      sessionStorage.removeItem(SESSION_KEY);
      return null;
    }
    return { latitude: parsed.latitude, longitude: parsed.longitude };
  } catch {
    return null;
  }
};

export const useGeolocation = () => {
  const cached = loadBrowserLocation();
  const [location, setLocation] = useState<GeolocationResult>(
    cached
      ? createBrowserLocationResult(cached.latitude, cached.longitude)
      : createInitialGeolocationState()
  );
  const browserRequestedRef = useRef(!!cached);
  
  const { data: ipData, loading: ipLoading } = useIPGeolocation();

  const tryIPFallback = useCallback(() => {
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
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      saveBrowserLocation(lat, lng);
      setLocation(createBrowserLocationResult(lat, lng));
    };

    const handleError = () => {
      const ipLocation = getIPLocationFromCache();
      setLocation(ipLocation);
    };

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

    if (!('geolocation' in navigator)) {
      setLocation(getIPLocationFromCache());
      return;
    }

    const options = mergeGeolocationOptions({ timeout: 10000 });
    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, options);
  }, []);

  // Sync IP geolocation data — only if browser GPS hasn't been requested
  useEffect(() => {
    if (browserRequestedRef.current) return;
    
    if (ipLoading) {
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
