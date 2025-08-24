// App-wide constants and configuration

export const APP_CONFIG = {
  // Supabase
  PROJECT_ID: 'vpnaaaocqqmkslwqrkyd',
  SUPABASE_URL: 'https://vpnaaaocqqmkslwqrkyd.supabase.co',
  
  // API Endpoints
  FUNCTIONS_URL: 'https://vpnaaaocqqmkslwqrkyd.supabase.co/functions/v1',
  
  // Cache settings
  CACHE_TTL: {
    GOOGLE_PLACES: 1000 * 60 * 30, // 30 minutes
    STORE_DATA: 1000 * 60 * 15,    // 15 minutes
    LOCATION_DATA: 1000 * 60 * 60,  // 1 hour
  },
  
  // Search defaults
  SEARCH_DEFAULTS: {
    RADIUS_MILES: 10,
    RESULT_LIMIT: 50,
    SIMILARITY_THRESHOLD: 0.3,
  },
  
  // Image settings
  IMAGE_SETTINGS: {
    DEFAULT_MAX_WIDTH: 1200,
    THUMBNAIL_WIDTH: 400,
    PHOTO_QUALITY: 80,
  },
  
  // App metadata
  SEO: {
    SITE_NAME: 'EBT Finder',
    DOMAIN: 'ebtfinder.org',
    DEFAULT_DESCRIPTION: 'Find EBT and SNAP accepting stores near you. Search by location, store type, and get directions, hours, and reviews.',
    DEFAULT_KEYWORDS: 'EBT, SNAP, food stamps, grocery stores, food assistance, store locator',
  },
  
  // Google Places
  GOOGLE_PLACES: {
    PHOTO_API_ENDPOINT: '/google-photos',
    BUSINESS_API_ENDPOINT: '/google-places',
    DEFAULT_FIELDS: [
      'place_id',
      'name',
      'formatted_address',
      'formatted_phone_number',
      'website',
      'rating',
      'user_ratings_total',
      'photos',
      'opening_hours',
      'price_level',
      'types'
    ]
  }
} as const;

// Error messages
export const ERROR_MESSAGES = {
  STORE_NOT_FOUND: 'The store you\'re looking for doesn\'t exist or may have been removed.',
  LOCATION_PERMISSION_DENIED: 'Location access denied. Please enable location services or search by address.',
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  INVALID_SEARCH: 'Please enter a valid search query.',
  GOOGLE_PLACES_ERROR: 'Unable to fetch additional store information at this time.',
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  LOCATION_FOUND: 'Location found successfully',
  STORE_UPDATED: 'Store information updated successfully',
  REVIEW_SUBMITTED: 'Review submitted successfully',
  PHOTO_UPLOADED: 'Photo uploaded successfully',
} as const;