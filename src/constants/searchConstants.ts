// Popular store chains for suggestions
export const POPULAR_STORES = [
  { name: "Walmart", icon: "🛒" },
  { name: "Target", icon: "🎯" },
  { name: "McDonald's", icon: "🍟" },
  { name: "Subway", icon: "🥪" },
  { name: "Domino's", icon: "🍕" },
  { name: "Pizza Hut", icon: "🍕" },
  { name: "Taco Bell", icon: "🌮" },
  { name: "KFC", icon: "🍗" },
  { name: "Safeway", icon: "🛒" },
  { name: "Kroger", icon: "🛒" },
  { name: "CVS", icon: "💊" },
  { name: "Walgreens", icon: "💊" },
  { name: "Dollar Tree", icon: "💰" },
  { name: "Family Dollar", icon: "💰" },
  { name: "7-Eleven", icon: "🏪" }
] as const;

export const POPULAR_LOCATIONS = [
  "Los Angeles, CA",
  "New York, NY", 
  "Chicago, IL", 
  "Houston, TX",
  "Phoenix, AZ", 
  "Philadelphia, PA", 
  "San Antonio, TX", 
  "San Diego, CA",
  "Dallas, TX", 
  "San Jose, CA", 
  "Austin, TX", 
  "Jacksonville, FL"
] as const;

export const SEARCH_DEFAULTS = {
  RADIUS_MILES: 25,
  RESULT_LIMIT: 200,
  TEXT_SEARCH_LIMIT: 100,
  SIMILARITY_THRESHOLD: 0.2,
  DEBOUNCE_MS: 300,
  LOCATION_DEBOUNCE_MS: 500,
  CACHE_TIME_MS: 2 * 60 * 1000, // 2 minutes
  GC_TIME_MS: 5 * 60 * 1000, // 5 minutes
  MAX_HISTORY_ITEMS: 10
} as const;

// Category-specific radius settings
export const CATEGORY_RADIUS: Record<string, number> = {
  trending: 5,
  grocery: 10,
  hotmeals: 5,
  fastfood: 5,
  restaurant: 7,
  convenience: 3,
  farmersmarket: 25,
  bakery: 15,
  delivery: 50,
  default: 10
};

// Category-specific exclusion patterns
export const CATEGORY_EXCLUSIONS: Record<string, string[]> = {
  trending: ['test', 'demo', 'sample'],
  grocery: [],
  fastfood: [],
  restaurant: [],
  convenience: [],
  farmersmarket: []
};
