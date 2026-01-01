/**
 * Geolocation Types
 * Pure type definitions for geolocation functionality
 */

export type GeolocationSource = 'browser' | 'ip' | 'fallback' | null;

export interface GeolocationResult {
  latitude: number | null;
  longitude: number | null;
  error: string | null;
  loading: boolean;
  source: GeolocationSource;
  city?: string;
  region?: string;
}

export interface IPGeolocationResponse {
  latitude: number;
  longitude: number;
  city?: string;
  region?: string;
  source?: 'ip' | 'fallback';
}

export interface GeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

// Default fallback location - Geographic center of the US
export const DEFAULT_FALLBACK_LOCATION = {
  latitude: 39.8283,
  longitude: -98.5795,
  city: 'United States',
  region: '',
} as const;

export const DEFAULT_GEOLOCATION_OPTIONS: GeolocationOptions = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 300000, // 5 minutes
};
