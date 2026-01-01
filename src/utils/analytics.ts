/**
 * Analytics utility for tracking user interactions
 * Uses Google Analytics gtag when available
 */

type SearchMethod = 'zip_code' | 'current_location';

interface SearchEventParams {
  search_method: SearchMethod;
  zip_code?: string;
  has_location?: boolean;
}

/**
 * Track when a user initiates a store search
 */
export const trackSearchEvent = (params: SearchEventParams): void => {
  if (typeof window.gtag === 'undefined') {
    console.debug('[Analytics] gtag not available, skipping event:', params);
    return;
  }

  window.gtag('event', 'store_search', {
    event_category: 'engagement',
    event_label: params.search_method,
    search_method: params.search_method,
    zip_code: params.zip_code || null,
    has_location: params.has_location || false,
  });
};

/**
 * Track ZIP code search specifically
 */
export const trackZipCodeSearch = (zipCode: string): void => {
  trackSearchEvent({
    search_method: 'zip_code',
    zip_code: zipCode,
  });
};

/**
 * Track current location search specifically
 */
export const trackLocationSearch = (hasLocation: boolean): void => {
  trackSearchEvent({
    search_method: 'current_location',
    has_location: hasLocation,
  });
};
