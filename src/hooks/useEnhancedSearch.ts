import { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { calculateDistance } from '@/utils/distanceCalculation';
import { useGeolocation } from '@/hooks/useGeolocation';
import type { Tables } from '@/integrations/supabase/types';

type Store = Tables<'snap_stores'>;

interface StoreWithDistance extends Store {
  distance?: number;
}

interface SearchSuggestion {
  type: 'store' | 'location' | 'recent';
  value: string;
  subtitle?: string;
  icon?: string;
}

interface SearchParams {
  query: string;
  location?: string;
  useCurrentLocation?: boolean;
  radius?: number;
  storeType?: string[];
}

interface SearchHistory {
  id: string;
  query: string;
  location?: string;
  timestamp: number;
}

// Popular store chains for suggestions
const POPULAR_STORES = [
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
];

const POPULAR_LOCATIONS = [
  "Los Angeles, CA", "New York, NY", "Chicago, IL", "Houston, TX",
  "Phoenix, AZ", "Philadelphia, PA", "San Antonio, TX", "San Diego, CA",
  "Dallas, TX", "San Jose, CA", "Austin, TX", "Jacksonville, FL"
];

export const useEnhancedSearch = () => {
  const [searchParams, setSearchParams] = useState<SearchParams>({
    query: '',
    radius: 10
  });
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const { latitude, longitude } = useGeolocation();

  // Load search history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('ebt-search-history');
      if (saved) {
        const parsed = JSON.parse(saved);
        setSearchHistory(parsed.slice(0, 10)); // Keep last 10 searches
      }
    } catch (error) {
      console.error('Error loading search history:', error);
    }
  }, []);

  // Save search history to localStorage
  const saveToHistory = useCallback((query: string, location?: string) => {
    if (!query.trim()) return;
    
    const newEntry: SearchHistory = {
      id: Date.now().toString(),
      query,
      location,
      timestamp: Date.now()
    };

    setSearchHistory(prev => {
      const filtered = prev.filter(item => 
        !(item.query === query && item.location === location)
      );
      const updated = [newEntry, ...filtered].slice(0, 10);
      
      try {
        localStorage.setItem('ebt-search-history', JSON.stringify(updated));
      } catch (error) {
        console.error('Error saving search history:', error);
      }
      
      return updated;
    });
  }, []);

  // Generate search suggestions
  const generateSuggestions = useCallback((query: string, locationQuery?: string) => {
    const suggestions: SearchSuggestion[] = [];
    
    // Recent searches
    if (query.length === 0) {
      searchHistory.slice(0, 3).forEach(item => {
        suggestions.push({
          type: 'recent',
          value: item.query,
          subtitle: item.location ? `in ${item.location}` : 'Recent search',
          icon: '🕐'
        });
      });
    }

    // Store suggestions
    if (query.length > 0) {
      POPULAR_STORES
        .filter(store => store.name.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 5)
        .forEach(store => {
          suggestions.push({
            type: 'store',
            value: store.name,
            subtitle: 'Popular store chain',
            icon: store.icon
          });
        });
    }

    // Location suggestions
    if (locationQuery && locationQuery.length > 0) {
      POPULAR_LOCATIONS
        .filter(location => location.toLowerCase().includes(locationQuery.toLowerCase()))
        .slice(0, 3)
        .forEach(location => {
          suggestions.push({
            type: 'location',
            value: location,
            subtitle: 'Popular location',
            icon: '📍'
          });
        });
    }

    return suggestions;
  }, [searchHistory]);

  // Helper function to geocode a location string
  const geocodeLocation = async (location: string): Promise<{ lat: number; lng: number } | null> => {
    try {
      const params = new URLSearchParams({
        q: location.trim(),
        format: 'json',
        addressdetails: '1',
        limit: '1',
        countrycodes: 'us',
      });
      const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`);
      if (!res.ok) return null;
      const data = await res.json();
      if (Array.isArray(data) && data[0]?.lat && data[0]?.lon) {
        return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
      }
      return null;
    } catch (e) {
      console.error('Geocode failed', e);
      return null;
    }
  };

  // Helper function to parse location string
  const parseLocation = (location: string): { city: string; state: string; zip: string } => {
    const trimmed = location.trim();
    
    // Check for ZIP code (5 digits)
    const zipMatch = trimmed.match(/^\d{5}$/);
    if (zipMatch) {
      return { city: '', state: '', zip: zipMatch[0] };
    }
    
    // Check for City, ST format
    const cityStateMatch = trimmed.match(/^([^,]+),\s*([A-Za-z]{2})$/i);
    if (cityStateMatch) {
      return { city: cityStateMatch[1].trim(), state: cityStateMatch[2].toUpperCase(), zip: '' };
    }
    
    // Check for City, State (full name) format
    const cityFullStateMatch = trimmed.match(/^([^,]+),\s*([A-Za-z\s]+)$/i);
    if (cityFullStateMatch) {
      return { city: cityFullStateMatch[1].trim(), state: '', zip: '' };
    }
    
    // Default: treat as city name
    return { city: trimmed, state: '', zip: '' };
  };

  // Main search query
  const { data: searchResults, isLoading, error } = useQuery({
    queryKey: ['enhanced-search', searchParams],
    queryFn: async (): Promise<StoreWithDistance[]> => {
      // Need either a query, location, or current location to search
      if (!searchParams.query.trim() && !searchParams.location && !searchParams.useCurrentLocation) {
        return [];
      }

      let results: StoreWithDistance[] = [];
      let searchLat: number | null = null;
      let searchLng: number | null = null;

      // Determine coordinates for location-based search
      if (searchParams.useCurrentLocation && latitude && longitude) {
        searchLat = latitude;
        searchLng = longitude;
      } else if (searchParams.location) {
        // Geocode the manual location input
        const coords = await geocodeLocation(searchParams.location);
        if (coords) {
          searchLat = coords.lat;
          searchLng = coords.lng;
        }
      }

      // Use location-based search if we have coordinates
      if (searchLat !== null && searchLng !== null) {
        console.log('🔍 Using location-based search with coordinates:', { lat: searchLat, lng: searchLng, query: searchParams.query });
        
        const { data, error } = await supabase.rpc('get_nearby_stores', {
          user_lat: searchLat,
          user_lng: searchLng,
          radius_miles: searchParams.radius || 25, // Increased radius for better coverage
          store_types: searchParams.storeType || null,
          result_limit: 200 // Increased limit to ensure we can filter by name
        });

        if (error) throw error;

        results = (data || []).map((store: any) => ({
          ...store,
          id: store.id,
          Store_Name: store.store_name,
          Store_Street_Address: store.store_street_address,
          City: store.city,
          State: store.state,
          Zip_Code: store.zip_code,
          Store_Type: store.store_type,
          Latitude: store.latitude,
          Longitude: store.longitude,
          distance: store.distance_miles,
          // Map other required fields
          Additional_Address: null,
          Zip4: null,
          County: null,
          Record_ID: null,
          ObjectId: null,
          Grantee_Name: null,
          X: null,
          Y: null,
          Incentive_Program: null,
          google_place_id: null,
          google_name: null,
          google_formatted_address: null,
          google_website: null,
          google_formatted_phone_number: null,
          google_opening_hours: null,
          google_rating: null,
          google_user_ratings_total: null,
          google_photos: null,
          google_last_updated: null,
          google_reviews: null,
          google_types: null,
          google_price_level: null,
          google_plus_code: null,
          google_business_status: null,
          google_geometry: null,
          google_vicinity: null,
          google_icon: null,
          google_icon_background_color: null,
          google_icon_mask_base_uri: null
        }));

        // Filter by store name if provided (fuzzy matching)
        if (searchParams.query.trim()) {
          const queryLower = searchParams.query.toLowerCase().replace(/[^a-z0-9\s]/g, '');
          console.log('🔎 Filtering by query:', { query: queryLower, beforeCount: results.length });
          results = results.filter(store => {
            const storeName = (store.Store_Name || '').toLowerCase().replace(/[^a-z0-9\s]/g, '');
            const storeType = (store.Store_Type || '').toLowerCase().replace(/[^a-z0-9\s]/g, '');
            return storeName.includes(queryLower) || storeType.includes(queryLower);
          });
          console.log('🔎 After filtering:', { afterCount: results.length });
        }
      } else {
        // Use text-based search with parsed location
        const parsedLocation = searchParams.location ? parseLocation(searchParams.location) : { city: '', state: '', zip: '' };
        
        console.log('🔍 Using text-based search with:', {
          query: searchParams.query,
          parsedLocation
        });

        const { data, error } = await supabase.rpc('smart_store_search', {
          search_text: searchParams.query || '',
          search_city: parsedLocation.city,
          search_state: parsedLocation.state,
          search_zip: parsedLocation.zip,
          similarity_threshold: 0.2,
          result_limit: 100
        });

        if (error) throw error;

        results = (data || []).map((result: any) => ({
          id: result.id,
          Store_Name: result.store_name,
          Store_Street_Address: result.store_street_address,
          City: result.city,
          State: result.state,
          Zip_Code: result.zip_code,
          Store_Type: result.store_type,
          Latitude: result.latitude,
          Longitude: result.longitude,
          // Map other required fields
          Additional_Address: null,
          Zip4: null,
          County: null,
          Record_ID: null,
          ObjectId: null,
          Grantee_Name: null,
          X: null,
          Y: null,
          Incentive_Program: null,
          google_place_id: null,
          google_name: null,
          google_formatted_address: null,
          google_website: null,
          google_formatted_phone_number: null,
          google_opening_hours: null,
          google_rating: null,
          google_user_ratings_total: null,
          google_photos: null,
          google_last_updated: null,
          google_reviews: null,
          google_types: null,
          google_price_level: null,
          google_plus_code: null,
          google_business_status: null,
          google_geometry: null,
          google_vicinity: null,
          google_icon: null,
          google_icon_background_color: null,
          google_icon_mask_base_uri: null
        }));
      }

      // Save successful search to history
      if (results.length > 0) {
        saveToHistory(searchParams.query, searchParams.location);
      }

      console.log('✅ Search complete:', { resultCount: results.length });
      return results;
    },
    enabled: !!(
      searchParams.query.trim() || 
      searchParams.location || 
      (searchParams.useCurrentLocation && latitude && longitude)
    ),
    staleTime: 2 * 60 * 1000, // 2 minutes cache
    gcTime: 5 * 60 * 1000 // 5 minutes
  });

  // Track when a search has been performed
  useEffect(() => {
    if (searchResults && searchResults.length > 0) {
      setHasSearched(true);
    }
  }, [searchResults]);

  // Also mark as searched when query params change
  useEffect(() => {
    if (searchParams.query.trim() || searchParams.location || searchParams.useCurrentLocation) {
      setHasSearched(true);
    }
  }, [searchParams.query, searchParams.location, searchParams.useCurrentLocation]);

  const updateSearchParams = useCallback((updates: Partial<SearchParams>) => {
    setSearchParams(prev => ({ ...prev, ...updates }));
  }, []);

  const clearSearch = useCallback(() => {
    setSearchParams({ query: '', radius: 10 });
    setSuggestions([]);
    setShowSuggestions(false);
    setHasSearched(false);
  }, []);

  const clearHistory = useCallback(() => {
    setSearchHistory([]);
    localStorage.removeItem('ebt-search-history');
  }, []);

  // Memoized suggestions
  const currentSuggestions = useMemo(() => 
    generateSuggestions(searchParams.query, searchParams.location),
    [searchParams.query, searchParams.location, generateSuggestions]
  );

  useEffect(() => {
    setSuggestions(currentSuggestions);
  }, [currentSuggestions]);

  return {
    searchParams,
    searchResults: searchResults || [],
    isLoading,
    error,
    suggestions,
    showSuggestions,
    searchHistory,
    hasSearched,
    updateSearchParams,
    clearSearch,
    clearHistory,
    setShowSuggestions,
    hasCurrentLocation: !!(latitude && longitude)
  };
};