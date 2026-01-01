import { describe, it, expect } from 'vitest';
import {
  createInitialGeolocationState,
  createBrowserLocationResult,
  createIPLocationResult,
  createFallbackLocationResult,
  createErrorLocationResult,
  hasValidCoordinates,
  isValidLatitude,
  isValidLongitude,
  isValidCoordinates,
  determineGeolocationStrategy,
  mergeGeolocationOptions,
  shouldUseIPFallback,
  getGeolocationErrorMessage,
  processIPGeolocationResponse,
  getLocationSourcePriority,
  getBetterLocation,
} from '../geolocation';
import {
  DEFAULT_FALLBACK_LOCATION,
  DEFAULT_GEOLOCATION_OPTIONS,
  GeolocationResult,
} from '../geolocation-types';

describe('Geolocation Business Logic', () => {
  describe('createInitialGeolocationState', () => {
    it('should return loading state with null coordinates', () => {
      const state = createInitialGeolocationState();
      
      expect(state.latitude).toBeNull();
      expect(state.longitude).toBeNull();
      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
      expect(state.source).toBeNull();
    });
  });

  describe('createBrowserLocationResult', () => {
    it('should create result with browser source', () => {
      const result = createBrowserLocationResult(37.7749, -122.4194);
      
      expect(result.latitude).toBe(37.7749);
      expect(result.longitude).toBe(-122.4194);
      expect(result.source).toBe('browser');
      expect(result.loading).toBe(false);
      expect(result.error).toBeNull();
    });

    it('should handle edge coordinates', () => {
      const result = createBrowserLocationResult(90, 180);
      
      expect(result.latitude).toBe(90);
      expect(result.longitude).toBe(180);
    });

    it('should handle negative coordinates', () => {
      const result = createBrowserLocationResult(-33.8688, 151.2093);
      
      expect(result.latitude).toBe(-33.8688);
      expect(result.longitude).toBe(151.2093);
    });
  });

  describe('createIPLocationResult', () => {
    it('should create result with ip source for ip data', () => {
      const result = createIPLocationResult({
        latitude: 40.7128,
        longitude: -74.006,
        city: 'New York',
        region: 'NY',
      });
      
      expect(result.latitude).toBe(40.7128);
      expect(result.longitude).toBe(-74.006);
      expect(result.source).toBe('ip');
      expect(result.city).toBe('New York');
      expect(result.region).toBe('NY');
    });

    it('should create result with fallback source when indicated', () => {
      const result = createIPLocationResult({
        latitude: 39.8283,
        longitude: -98.5795,
        source: 'fallback',
      });
      
      expect(result.source).toBe('fallback');
    });
  });

  describe('createFallbackLocationResult', () => {
    it('should return US geographic center', () => {
      const result = createFallbackLocationResult();
      
      expect(result.latitude).toBe(DEFAULT_FALLBACK_LOCATION.latitude);
      expect(result.longitude).toBe(DEFAULT_FALLBACK_LOCATION.longitude);
      expect(result.source).toBe('fallback');
      expect(result.city).toBe('United States');
    });
  });

  describe('createErrorLocationResult', () => {
    it('should create error result with null coordinates', () => {
      const result = createErrorLocationResult('Permission denied');
      
      expect(result.latitude).toBeNull();
      expect(result.longitude).toBeNull();
      expect(result.error).toBe('Permission denied');
      expect(result.loading).toBe(false);
    });
  });

  describe('hasValidCoordinates', () => {
    it('should return true for valid coordinates', () => {
      const result: GeolocationResult = {
        latitude: 37.7749,
        longitude: -122.4194,
        error: null,
        loading: false,
        source: 'browser',
      };
      
      expect(hasValidCoordinates(result)).toBe(true);
    });

    it('should return false for null latitude', () => {
      const result: GeolocationResult = {
        latitude: null,
        longitude: -122.4194,
        error: null,
        loading: false,
        source: null,
      };
      
      expect(hasValidCoordinates(result)).toBe(false);
    });

    it('should return false for null longitude', () => {
      const result: GeolocationResult = {
        latitude: 37.7749,
        longitude: null,
        error: null,
        loading: false,
        source: null,
      };
      
      expect(hasValidCoordinates(result)).toBe(false);
    });

    it('should return false for both null', () => {
      const result: GeolocationResult = {
        latitude: null,
        longitude: null,
        error: null,
        loading: true,
        source: null,
      };
      
      expect(hasValidCoordinates(result)).toBe(false);
    });
  });

  describe('isValidLatitude', () => {
    it('should return true for valid latitudes', () => {
      expect(isValidLatitude(0)).toBe(true);
      expect(isValidLatitude(45)).toBe(true);
      expect(isValidLatitude(-45)).toBe(true);
      expect(isValidLatitude(90)).toBe(true);
      expect(isValidLatitude(-90)).toBe(true);
    });

    it('should return false for invalid latitudes', () => {
      expect(isValidLatitude(91)).toBe(false);
      expect(isValidLatitude(-91)).toBe(false);
      expect(isValidLatitude(180)).toBe(false);
    });
  });

  describe('isValidLongitude', () => {
    it('should return true for valid longitudes', () => {
      expect(isValidLongitude(0)).toBe(true);
      expect(isValidLongitude(90)).toBe(true);
      expect(isValidLongitude(-90)).toBe(true);
      expect(isValidLongitude(180)).toBe(true);
      expect(isValidLongitude(-180)).toBe(true);
    });

    it('should return false for invalid longitudes', () => {
      expect(isValidLongitude(181)).toBe(false);
      expect(isValidLongitude(-181)).toBe(false);
      expect(isValidLongitude(360)).toBe(false);
    });
  });

  describe('isValidCoordinates', () => {
    it('should return true for valid coordinate pairs', () => {
      expect(isValidCoordinates(37.7749, -122.4194)).toBe(true);
      expect(isValidCoordinates(0, 0)).toBe(true);
      expect(isValidCoordinates(-90, 180)).toBe(true);
    });

    it('should return false for invalid coordinate pairs', () => {
      expect(isValidCoordinates(91, 0)).toBe(false);
      expect(isValidCoordinates(0, 181)).toBe(false);
      expect(isValidCoordinates(91, 181)).toBe(false);
    });
  });

  describe('determineGeolocationStrategy', () => {
    it('should return native for non-iOS native platforms', () => {
      expect(determineGeolocationStrategy(true, true, false)).toBe('native');
    });

    it('should return browser for iOS native (uses web API)', () => {
      expect(determineGeolocationStrategy(true, true, true)).toBe('browser');
    });

    it('should return browser when available on web', () => {
      expect(determineGeolocationStrategy(true, false, false)).toBe('browser');
    });

    it('should return ip-only when no browser geolocation', () => {
      expect(determineGeolocationStrategy(false, false, false)).toBe('ip-only');
    });
  });

  describe('mergeGeolocationOptions', () => {
    it('should return defaults when no options provided', () => {
      const options = mergeGeolocationOptions();
      
      expect(options).toEqual(DEFAULT_GEOLOCATION_OPTIONS);
    });

    it('should merge partial options with defaults', () => {
      const options = mergeGeolocationOptions({ timeout: 5000 });
      
      expect(options.timeout).toBe(5000);
      expect(options.enableHighAccuracy).toBe(DEFAULT_GEOLOCATION_OPTIONS.enableHighAccuracy);
      expect(options.maximumAge).toBe(DEFAULT_GEOLOCATION_OPTIONS.maximumAge);
    });

    it('should override all options when provided', () => {
      const custom = {
        enableHighAccuracy: false,
        timeout: 3000,
        maximumAge: 60000,
      };
      const options = mergeGeolocationOptions(custom);
      
      expect(options).toEqual(custom);
    });
  });

  describe('shouldUseIPFallback', () => {
    it('should return true for permission denied error', () => {
      const error = { code: 1, message: 'Permission denied' } as GeolocationPositionError;
      expect(shouldUseIPFallback(error)).toBe(true);
    });

    it('should return true for position unavailable error', () => {
      const error = { code: 2, message: 'Position unavailable' } as GeolocationPositionError;
      expect(shouldUseIPFallback(error)).toBe(true);
    });

    it('should return true for timeout error', () => {
      const error = { code: 3, message: 'Timeout' } as GeolocationPositionError;
      expect(shouldUseIPFallback(error)).toBe(true);
    });

    it('should return true for generic errors', () => {
      const error = new Error('Network error');
      expect(shouldUseIPFallback(error)).toBe(true);
    });
  });

  describe('getGeolocationErrorMessage', () => {
    it('should return message for permission denied', () => {
      const error = { code: 1, message: '' } as GeolocationPositionError;
      expect(getGeolocationErrorMessage(error)).toBe('Location permission denied by user');
    });

    it('should return message for position unavailable', () => {
      const error = { code: 2, message: '' } as GeolocationPositionError;
      expect(getGeolocationErrorMessage(error)).toBe('Location information unavailable');
    });

    it('should return message for timeout', () => {
      const error = { code: 3, message: '' } as GeolocationPositionError;
      expect(getGeolocationErrorMessage(error)).toBe('Location request timed out');
    });

    it('should return generic error message', () => {
      const error = new Error('Something went wrong');
      expect(getGeolocationErrorMessage(error)).toBe('Something went wrong');
    });
  });

  describe('processIPGeolocationResponse', () => {
    it('should create IP result for valid response', () => {
      const data = {
        latitude: 40.7128,
        longitude: -74.006,
        city: 'New York',
        region: 'NY',
      };
      const result = processIPGeolocationResponse(data, null);
      
      expect(result.latitude).toBe(40.7128);
      expect(result.longitude).toBe(-74.006);
      expect(result.source).toBe('ip');
    });

    it('should return fallback for null data', () => {
      const result = processIPGeolocationResponse(null, null);
      
      expect(result.latitude).toBe(DEFAULT_FALLBACK_LOCATION.latitude);
      expect(result.source).toBe('fallback');
    });

    it('should return fallback for error', () => {
      const result = processIPGeolocationResponse(null, new Error('API error'));
      
      expect(result.source).toBe('fallback');
    });

    it('should return fallback for invalid coordinates', () => {
      const data = {
        latitude: 999,
        longitude: -74.006,
      };
      const result = processIPGeolocationResponse(data, null);
      
      expect(result.source).toBe('fallback');
    });
  });

  describe('getLocationSourcePriority', () => {
    it('should rank browser highest', () => {
      expect(getLocationSourcePriority('browser')).toBe(3);
    });

    it('should rank ip second', () => {
      expect(getLocationSourcePriority('ip')).toBe(2);
    });

    it('should rank fallback third', () => {
      expect(getLocationSourcePriority('fallback')).toBe(1);
    });

    it('should rank null lowest', () => {
      expect(getLocationSourcePriority(null)).toBe(0);
    });
  });

  describe('getBetterLocation', () => {
    const browserLocation: GeolocationResult = {
      latitude: 37.7749,
      longitude: -122.4194,
      error: null,
      loading: false,
      source: 'browser',
    };

    const ipLocation: GeolocationResult = {
      latitude: 37.8,
      longitude: -122.4,
      error: null,
      loading: false,
      source: 'ip',
    };

    const fallbackLocation: GeolocationResult = {
      latitude: DEFAULT_FALLBACK_LOCATION.latitude,
      longitude: DEFAULT_FALLBACK_LOCATION.longitude,
      error: null,
      loading: false,
      source: 'fallback',
    };

    const invalidLocation: GeolocationResult = {
      latitude: null,
      longitude: null,
      error: null,
      loading: true,
      source: null,
    };

    it('should prefer browser over ip', () => {
      expect(getBetterLocation(ipLocation, browserLocation)).toEqual(browserLocation);
      expect(getBetterLocation(browserLocation, ipLocation)).toEqual(browserLocation);
    });

    it('should prefer ip over fallback', () => {
      expect(getBetterLocation(fallbackLocation, ipLocation)).toEqual(ipLocation);
      expect(getBetterLocation(ipLocation, fallbackLocation)).toEqual(ipLocation);
    });

    it('should keep current if candidate is invalid', () => {
      expect(getBetterLocation(browserLocation, invalidLocation)).toEqual(browserLocation);
    });

    it('should use candidate if current is invalid', () => {
      expect(getBetterLocation(invalidLocation, ipLocation)).toEqual(ipLocation);
    });
  });

  describe('Geolocation Flow Scenarios', () => {
    describe('Scenario: User grants location permission', () => {
      it('should return browser location with highest priority', () => {
        const result = createBrowserLocationResult(36.8350, -119.9139);
        
        expect(result.source).toBe('browser');
        expect(hasValidCoordinates(result)).toBe(true);
        expect(getLocationSourcePriority(result.source)).toBe(3);
      });
    });

    describe('Scenario: User denies location permission', () => {
      it('should fallback to IP location seamlessly', () => {
        // Permission denied error received
        const error = { code: 1, message: 'Permission denied' } as GeolocationPositionError;
        expect(shouldUseIPFallback(error)).toBe(true);
        
        // IP geolocation succeeds
        const ipResult = createIPLocationResult({
          latitude: 36.8,
          longitude: -119.9,
          city: 'Fresno',
          region: 'CA',
        });
        
        expect(hasValidCoordinates(ipResult)).toBe(true);
        expect(ipResult.source).toBe('ip');
      });
    });

    describe('Scenario: IP geolocation also fails', () => {
      it('should use hardcoded US center fallback', () => {
        const fallback = createFallbackLocationResult();
        
        expect(fallback.latitude).toBe(39.8283);
        expect(fallback.longitude).toBe(-98.5795);
        expect(fallback.source).toBe('fallback');
        expect(hasValidCoordinates(fallback)).toBe(true);
      });
    });

    describe('Scenario: Browser geolocation times out', () => {
      it('should fallback to IP after timeout', () => {
        const error = { code: 3, message: 'Timeout' } as GeolocationPositionError;
        
        expect(shouldUseIPFallback(error)).toBe(true);
        expect(getGeolocationErrorMessage(error)).toBe('Location request timed out');
      });
    });

    describe('Scenario: Upgrade from IP to browser location', () => {
      it('should prefer browser when it becomes available', () => {
        // Initially have IP location
        const ipLocation: GeolocationResult = {
          latitude: 36.8,
          longitude: -119.9,
          error: null,
          loading: false,
          source: 'ip',
        };

        // Browser location becomes available
        const browserLocation = createBrowserLocationResult(36.8350, -119.9139);

        // Should prefer browser
        const better = getBetterLocation(ipLocation, browserLocation);
        expect(better.source).toBe('browser');
        expect(better.latitude).toBe(36.8350);
      });
    });
  });
});
