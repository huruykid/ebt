/**
 * Geolocation Business Logic
 * Pure functions that can be tested without browser/React dependencies
 */

import {
  GeolocationResult,
  GeolocationSource,
  IPGeolocationResponse,
  GeolocationOptions,
  DEFAULT_FALLBACK_LOCATION,
  DEFAULT_GEOLOCATION_OPTIONS,
} from './geolocation-types';

/**
 * Creates an initial loading state for geolocation
 */
export function createInitialGeolocationState(): GeolocationResult {
  return {
    latitude: null,
    longitude: null,
    error: null,
    loading: true,
    source: null,
  };
}

/**
 * Creates a successful geolocation result from browser coordinates
 */
export function createBrowserLocationResult(
  latitude: number,
  longitude: number
): GeolocationResult {
  return {
    latitude,
    longitude,
    error: null,
    loading: false,
    source: 'browser',
  };
}

/**
 * Creates a geolocation result from IP-based location data
 */
export function createIPLocationResult(
  data: IPGeolocationResponse
): GeolocationResult {
  const source: GeolocationSource = data.source === 'fallback' ? 'fallback' : 'ip';
  
  return {
    latitude: data.latitude,
    longitude: data.longitude,
    error: null,
    loading: false,
    source,
    city: data.city,
    region: data.region,
  };
}

/**
 * Creates a fallback geolocation result (US geographic center)
 */
export function createFallbackLocationResult(): GeolocationResult {
  return {
    latitude: DEFAULT_FALLBACK_LOCATION.latitude,
    longitude: DEFAULT_FALLBACK_LOCATION.longitude,
    error: null,
    loading: false,
    source: 'fallback',
    city: DEFAULT_FALLBACK_LOCATION.city,
    region: DEFAULT_FALLBACK_LOCATION.region,
  };
}

/**
 * Creates an error geolocation result
 */
export function createErrorLocationResult(errorMessage: string): GeolocationResult {
  return {
    latitude: null,
    longitude: null,
    error: errorMessage,
    loading: false,
    source: null,
  };
}

/**
 * Validates if a geolocation result has valid coordinates
 */
export function hasValidCoordinates(result: GeolocationResult): boolean {
  return result.latitude !== null && result.longitude !== null;
}

/**
 * Validates latitude value
 */
export function isValidLatitude(lat: number): boolean {
  return lat >= -90 && lat <= 90;
}

/**
 * Validates longitude value
 */
export function isValidLongitude(lng: number): boolean {
  return lng >= -180 && lng <= 180;
}

/**
 * Validates a coordinate pair
 */
export function isValidCoordinates(lat: number, lng: number): boolean {
  return isValidLatitude(lat) && isValidLongitude(lng);
}

/**
 * Determines the best geolocation strategy based on available APIs
 */
export function determineGeolocationStrategy(
  hasBrowserGeolocation: boolean,
  isNativePlatform: boolean,
  isIOS: boolean
): 'native' | 'browser' | 'ip-only' {
  if (isNativePlatform && !isIOS) {
    return 'native';
  }
  if (hasBrowserGeolocation) {
    return 'browser';
  }
  return 'ip-only';
}

/**
 * Merges geolocation options with defaults
 */
export function mergeGeolocationOptions(
  options?: Partial<GeolocationOptions>
): GeolocationOptions {
  return {
    ...DEFAULT_GEOLOCATION_OPTIONS,
    ...options,
  };
}

/**
 * Determines if we should use IP fallback based on error type
 */
export function shouldUseIPFallback(error: GeolocationPositionError | Error): boolean {
  // Always use IP fallback for any geolocation error
  // This includes: permission denied, position unavailable, timeout
  return true;
}

/**
 * Gets the geolocation error message for logging/debugging
 */
export function getGeolocationErrorMessage(error: GeolocationPositionError | Error): string {
  if ('code' in error) {
    switch (error.code) {
      case 1: // PERMISSION_DENIED
        return 'Location permission denied by user';
      case 2: // POSITION_UNAVAILABLE
        return 'Location information unavailable';
      case 3: // TIMEOUT
        return 'Location request timed out';
      default:
        return `Geolocation error: ${error.message}`;
    }
  }
  return error.message || 'Unknown geolocation error';
}

/**
 * Processes IP geolocation API response and handles errors
 */
export function processIPGeolocationResponse(
  data: IPGeolocationResponse | null,
  error: Error | null
): GeolocationResult {
  if (error || !data) {
    console.error('IP geolocation error:', error);
    return createFallbackLocationResult();
  }

  if (!isValidCoordinates(data.latitude, data.longitude)) {
    console.error('Invalid coordinates from IP geolocation:', data);
    return createFallbackLocationResult();
  }

  return createIPLocationResult(data);
}

/**
 * Determines the priority of location sources (higher = better)
 */
export function getLocationSourcePriority(source: GeolocationSource): number {
  switch (source) {
    case 'browser':
      return 3; // Most accurate
    case 'ip':
      return 2; // Approximate location
    case 'fallback':
      return 1; // Default location
    default:
      return 0;
  }
}

/**
 * Compares two location results and returns the better one
 */
export function getBetterLocation(
  current: GeolocationResult,
  candidate: GeolocationResult
): GeolocationResult {
  if (!hasValidCoordinates(candidate)) {
    return current;
  }
  
  if (!hasValidCoordinates(current)) {
    return candidate;
  }

  const currentPriority = getLocationSourcePriority(current.source);
  const candidatePriority = getLocationSourcePriority(candidate.source);

  return candidatePriority > currentPriority ? candidate : current;
}
