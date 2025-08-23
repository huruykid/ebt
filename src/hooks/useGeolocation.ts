
import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  error: string | null;
  loading: boolean;
}

export const useGeolocation = () => {
  const [location, setLocation] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    error: null,
    loading: true,
  });

  useEffect(() => {
    let cancelled = false;
    const isNative = Capacitor.getPlatform() !== 'web';

    const setSafe = (updater: ((prev: GeolocationState) => GeolocationState) | GeolocationState) => {
      if (cancelled) return;
      setLocation(prev => (typeof updater === 'function' ? (updater as any)(prev) : updater));
    };

    const safetyTimer = setTimeout(() => {
      setSafe(prev => ({
        ...prev,
        error: 'Location request timed out. Please enable location access (While Using the App) and try again.',
        loading: false,
      }));
    }, 15000);

    const handleSuccess = (position: any) => {
      clearTimeout(safetyTimer);
      setSafe({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        error: null,
        loading: false,
      });
    };

    const handleError = (err: any) => {
      clearTimeout(safetyTimer);
      let errorMessage = 'Unable to retrieve your location.';
      const code = err?.code;
      const msg = String(err?.message || '').toLowerCase();
      if (code === 1 || msg.includes('permission')) {
        errorMessage = 'Location access denied or limited. Please allow "While Using the App" in Settings.';
      } else if (code === 2) {
        errorMessage = 'Location information is unavailable.';
      } else if (code === 3) {
        errorMessage = 'Location request timed out.';
      }
      setSafe(prev => ({ ...prev, error: errorMessage, loading: false }));
    };

    const getNative = async () => {
      try {
        const perm = await Geolocation.requestPermissions();
        const status = (perm as any)?.location || (perm as any)?.coarseLocation || (perm as any)?.fineLocation;
        if (status && status !== 'granted') {
          throw { code: 1, message: 'Permission denied' };
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
        setSafe(prev => ({
          ...prev,
          error: 'Geolocation is not supported by this browser.',
          loading: false,
        }));
        return;
      }

      navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      });
    };

    if (isNative) {
      getNative();
    } else {
      getWeb();
    }

    return () => {
      cancelled = true;
      clearTimeout(safetyTimer);
    };
  }, []);

  return location;
};
