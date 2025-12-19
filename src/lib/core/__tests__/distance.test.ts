import { describe, it, expect } from 'vitest';
import {
  calculateDistance,
  toRadians,
  toDegrees,
  isValidCoordinate,
  getBoundingBox,
} from '../distance';

describe('distance calculations', () => {
  describe('toRadians', () => {
    it('converts 0 degrees to 0 radians', () => {
      expect(toRadians(0)).toBe(0);
    });

    it('converts 180 degrees to PI radians', () => {
      expect(toRadians(180)).toBeCloseTo(Math.PI, 10);
    });

    it('converts 90 degrees to PI/2 radians', () => {
      expect(toRadians(90)).toBeCloseTo(Math.PI / 2, 10);
    });

    it('converts negative degrees correctly', () => {
      expect(toRadians(-90)).toBeCloseTo(-Math.PI / 2, 10);
    });
  });

  describe('toDegrees', () => {
    it('converts 0 radians to 0 degrees', () => {
      expect(toDegrees(0)).toBe(0);
    });

    it('converts PI radians to 180 degrees', () => {
      expect(toDegrees(Math.PI)).toBeCloseTo(180, 10);
    });

    it('converts PI/2 radians to 90 degrees', () => {
      expect(toDegrees(Math.PI / 2)).toBeCloseTo(90, 10);
    });
  });

  describe('isValidCoordinate', () => {
    it('returns true for valid coordinates', () => {
      expect(isValidCoordinate(40.7128, -74.006)).toBe(true);
    });

    it('returns true for edge case coordinates', () => {
      expect(isValidCoordinate(90, 180)).toBe(true);
      expect(isValidCoordinate(-90, -180)).toBe(true);
      expect(isValidCoordinate(0, 0)).toBe(true);
    });

    it('returns false for invalid latitude', () => {
      expect(isValidCoordinate(91, 0)).toBe(false);
      expect(isValidCoordinate(-91, 0)).toBe(false);
    });

    it('returns false for invalid longitude', () => {
      expect(isValidCoordinate(0, 181)).toBe(false);
      expect(isValidCoordinate(0, -181)).toBe(false);
    });

    it('returns false for NaN values', () => {
      expect(isValidCoordinate(NaN, 0)).toBe(false);
      expect(isValidCoordinate(0, NaN)).toBe(false);
    });
  });

  describe('calculateDistance', () => {
    it('returns 0 for same coordinates', () => {
      expect(calculateDistance(40.7128, -74.006, 40.7128, -74.006)).toBe(0);
    });

    it('calculates distance between NYC and LA correctly', () => {
      // NYC: 40.7128, -74.0060
      // LA: 34.0522, -118.2437
      // Expected distance: ~2451 miles
      const distance = calculateDistance(40.7128, -74.006, 34.0522, -118.2437);
      expect(distance).toBeGreaterThan(2400);
      expect(distance).toBeLessThan(2500);
    });

    it('calculates short distance correctly', () => {
      // Two points about 1 mile apart in NYC
      const distance = calculateDistance(40.7128, -74.006, 40.7272, -74.006);
      expect(distance).toBeGreaterThan(0.9);
      expect(distance).toBeLessThan(1.1);
    });

    it('handles crossing the prime meridian', () => {
      // London to Paris (~213 miles)
      const distance = calculateDistance(51.5074, -0.1278, 48.8566, 2.3522);
      expect(distance).toBeGreaterThan(200);
      expect(distance).toBeLessThan(230);
    });

    it('handles crossing the equator', () => {
      // Nairobi to Cape Town (~2496 miles)
      const distance = calculateDistance(-1.2921, 36.8219, -33.9249, 18.4241);
      expect(distance).toBeGreaterThan(2400);
      expect(distance).toBeLessThan(2600);
    });

    it('handles antipodal points', () => {
      // Distance should be approximately half Earth circumference
      const distance = calculateDistance(0, 0, 0, 180);
      expect(distance).toBeGreaterThan(12400);
      expect(distance).toBeLessThan(12500);
    });
  });

  describe('getBoundingBox', () => {
    it('creates valid bounding box for small radius', () => {
      const box = getBoundingBox(40.7128, -74.006, 5);
      
      expect(box.minLat).toBeLessThan(40.7128);
      expect(box.maxLat).toBeGreaterThan(40.7128);
      expect(box.minLon).toBeLessThan(-74.006);
      expect(box.maxLon).toBeGreaterThan(-74.006);
    });

    it('creates symmetric bounding box for latitude', () => {
      const box = getBoundingBox(40, -74, 10);
      const latDelta = box.maxLat - 40;
      
      expect(40 - box.minLat).toBeCloseTo(latDelta, 5);
    });

    it('adjusts longitude delta for latitude', () => {
      // At higher latitudes, longitude degrees are closer together
      const boxEquator = getBoundingBox(0, 0, 10);
      const boxHighLat = getBoundingBox(60, 0, 10);
      
      const lonDeltaEquator = boxEquator.maxLon - boxEquator.minLon;
      const lonDeltaHighLat = boxHighLat.maxLon - boxHighLat.minLon;
      
      // High latitude should have larger longitude delta
      expect(lonDeltaHighLat).toBeGreaterThan(lonDeltaEquator);
    });

    it('contains a point at the exact radius distance', () => {
      const centerLat = 40.7128;
      const centerLon = -74.006;
      const radius = 10;
      const box = getBoundingBox(centerLat, centerLon, radius);
      
      // A point exactly north at the radius distance should be in or near the box
      const northLat = centerLat + (radius / 69);
      expect(northLat).toBeLessThanOrEqual(box.maxLat + 0.01);
    });
  });
});
