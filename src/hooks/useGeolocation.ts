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
  // Start with loading: false - location only requested on user action
  const [location, setLocation] = useState<GeolocationResult>({
    ...createInitialGeolocationState(),
    loading: false,
  });

  const tryIPFallback = useCallback(async () => {
    console.log('Trying IP geolocation fallback...');
    setLocation(prev => ({ ...prev, loading: true }));
    const ipLocation = await getIPLocation();
    setLocation(ipLocation);
  }, []);

  const requestBrowserLocation = useCallback(() => {
    const platform = Capacitor.getPlatform();
    const isNative = platform !== 'web';
    const isIOS = platform === 'ios';

    setLocation(prev => ({ ...prev, loading: true }));

    const handleSuccess = (position: any) => {
      setLocation(createBrowserLocationResult(
        position.coords.latitude,
        position.coords.longitude
      ));
    };

    const handleError = async () => {
      // Permission denied or error - silently use IP fallback
      console.log('Browser location denied/failed, using IP fallback');
      const ipLocation = await getIPLocation();
      setLocation(ipLocation);
    };

    // Native platform handling (excluding iOS)
    if (isNative && !isIOS) {
      (async () => {
        try {
          const perm = await Geolocation.requestPermissions();
          const status = (perm as any)?.location || (perm as any)?.coarseLocation || (perm as any)?.fineLocation;
          if (status && status !== 'granted') {
            const ipLocation = await getIPLocation();
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
      getIPLocation().then(ipLocation => setLocation(ipLocation));
      return;
    }

    const options = mergeGeolocationOptions({ timeout: 10000 });
    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, options);
  }, []);

  return { ...location, tryIPFallback, requestBrowserLocation };
};
