/**
 * Analytics utility for tracking user interactions
 * Uses Google Analytics gtag when available
 */

type SearchMethod = 'zip_code' | 'current_location';

interface SearchEventParams {
  search_method: SearchMethod;
  zip_code?: string;
  has_location?: boolean;
  permission_requested?: boolean;
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
    permission_requested: params.permission_requested || false,
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
 * @param permissionRequested - true if location permission is being requested for the first time
 */
export const trackLocationSearch = (permissionRequested: boolean): void => {
  trackSearchEvent({
    search_method: 'current_location',
    has_location: !permissionRequested,
    permission_requested: permissionRequested,
  });
};

/**
 * Track featured store click for recommendation optimization
 */
export const trackFeaturedStoreClick = (storeId: string, storeName: string, city: string, state: string): void => {
  if (typeof window.gtag === 'undefined') {
    console.debug('[Analytics] Featured store click:', { storeId, storeName, city, state });
    return;
  }

  window.gtag('event', 'featured_store_click', {
    event_category: 'engagement',
    event_label: storeName,
    store_id: storeId,
    store_name: storeName,
    store_city: city,
    store_state: state,
  });
};

/**
 * Track popular city click for recommendation optimization
 */
export const trackCityClick = (cityName: string, citySlug: string, state: string): void => {
  if (typeof window.gtag === 'undefined') {
    console.debug('[Analytics] City click:', { cityName, citySlug, state });
    return;
  }

  window.gtag('event', 'city_click', {
    event_category: 'engagement',
    event_label: cityName,
    city_name: cityName,
    city_slug: citySlug,
    city_state: state,
  });
};
