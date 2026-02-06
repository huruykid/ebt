import { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useGeolocation } from '@/hooks/useGeolocation';
import { POPULAR_STORES, POPULAR_LOCATIONS, SEARCH_DEFAULTS } from '@/constants/searchConstants';
import { geocodeLocation, parseLocation, mapToStoreWithDistance } from '@/utils/searchUtils';
import { applyCategoryFiltering } from '@/hooks/useNearbyStoresCore';
import { calculateDistance } from '@/utils/distanceCalculation';
import type { SearchParams, SearchHistory, SearchSuggestion } from '@/types/searchTypes';
import type { StoreWithDistance } from '@/types/storeTypes';

const STORAGE_KEY = 'ebt-search-history';

export const useEnhancedSearch = () => {
  const [searchParams, setSearchParams] = useState<SearchParams>({
    query: '',
    radius: SEARCH_DEFAULTS.RADIUS_MILES
  });
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);
  const { latitude, longitude } = useGeolocation();

  // Load search history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setSearchHistory(JSON.parse(saved).slice(0, SEARCH_DEFAULTS.MAX_HISTORY_ITEMS));
      }
    } catch (error) {
      console.error('Error loading search history:', error);
    }
  }, []);

  // Save search to history
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
      const updated = [newEntry, ...filtered].slice(0, SEARCH_DEFAULTS.MAX_HISTORY_ITEMS);
      
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error('Error saving search history:', error);
      }
      
      return updated;
    });
  }, []);

  // Generate suggestions based on current input
  const generateSuggestions = useCallback((query: string, locationQuery?: string): SearchSuggestion[] => {
    const result: SearchSuggestion[] = [];
    
    // Show recent searches when no query
    if (query.length === 0) {
      searchHistory.slice(0, 3).forEach(item => {
        result.push({
          type: 'recent',
          value: item.query,
          subtitle: item.location ? `in ${item.location}` : 'Recent search',
          icon: '🕐'
        });
      });
    }

    // Store name suggestions
    if (query.length > 0) {
      const queryLower = query.toLowerCase();
      POPULAR_STORES
        .filter(store => store.name.toLowerCase().includes(queryLower))
        .slice(0, 5)
        .forEach(store => {
          result.push({
            type: 'store',
            value: store.name,
            subtitle: 'Popular store chain',
            icon: store.icon
          });
        });
    }

    // Location suggestions
    if (locationQuery && locationQuery.length > 0) {
      const locLower = locationQuery.toLowerCase();
      POPULAR_LOCATIONS
        .filter(loc => loc.toLowerCase().includes(locLower))
        .slice(0, 3)
        .forEach(loc => {
          result.push({
            type: 'location',
            value: loc,
            subtitle: 'Popular location',
            icon: '📍'
          });
        });
    }

    return result;
  }, [searchHistory]);

  // Main search query with React Query
  const { data: searchResults, isLoading, error } = useQuery({
    queryKey: ['enhanced-search', searchParams],
    queryFn: async (): Promise<StoreWithDistance[]> => {
      const { query, location, useCurrentLocation, radius, storeType, category } = searchParams;
      
      if (!query.trim() && !location && !useCurrentLocation) {
        return [];
      }

      let searchLat: number | null = null;
      let searchLng: number | null = null;
      let geocodedCoords: { lat: number; lng: number } | null = null;

      // Determine coordinates
      if (useCurrentLocation && latitude && longitude) {
        searchLat = latitude;
        searchLng = longitude;
      } else if (location) {
        geocodedCoords = await geocodeLocation(location);
        if (geocodedCoords) {
          searchLat = geocodedCoords.lat;
          searchLng = geocodedCoords.lng;
        }
      }

      let results: StoreWithDistance[];

      // Parse location for smart_store_search
      const parsedLocation = location ? parseLocation(location) : { city: '', state: '', zip: '' };

      // COMBINED SEARCH: When we have BOTH a query AND a location, use smart_store_search
      // with city/state params to get relevant stores, then calculate distances
      if (query.trim() && (parsedLocation.city || parsedLocation.state || parsedLocation.zip)) {
        console.log('🔍 Combined search: query + location using smart_store_search');
        
        const { data, error: searchError } = await supabase.rpc('smart_store_search', {
          search_text: query.trim(),
          search_city: parsedLocation.city,
          search_state: parsedLocation.state,
          search_zip: parsedLocation.zip,
          similarity_threshold: SEARCH_DEFAULTS.SIMILARITY_THRESHOLD,
          result_limit: SEARCH_DEFAULTS.TEXT_SEARCH_LIMIT * 2
        });

        if (searchError) throw searchError;

        results = (data || []).map((store: any) => {
          const mapped = mapToStoreWithDistance(store, false);
          // Calculate distance if we have coordinates
          if (searchLat !== null && searchLng !== null && store.latitude && store.longitude) {
            const distance = calculateDistance(
              searchLat,
              searchLng,
              store.latitude,
              store.longitude
            );
            mapped.distance = distance;
          }
          return mapped;
        });

        // Sort by distance if we have coordinates
        if (searchLat !== null && searchLng !== null) {
          results.sort((a, b) => (a.distance || 999) - (b.distance || 999));
        }
        
        // Apply category-specific filtering
        results = applyCategoryFiltering(results, category) as StoreWithDistance[];
      }
      // LOCATION-ONLY SEARCH: No query, just browsing stores near a location
      else if (searchLat !== null && searchLng !== null && !query.trim()) {
        console.log('🔍 Location-only search using get_nearby_stores');
        
        const { data, error: nearbyError } = await supabase.rpc('get_nearby_stores', {
          user_lat: searchLat,
          user_lng: searchLng,
          radius_miles: radius || SEARCH_DEFAULTS.RADIUS_MILES,
          store_types: storeType || null,
          result_limit: SEARCH_DEFAULTS.RESULT_LIMIT * 2
        });

        if (nearbyError) throw nearbyError;

        results = (data || []).map((store: any) => mapToStoreWithDistance(store, true));
        
        // Apply category-specific filtering
        results = applyCategoryFiltering(results, category) as StoreWithDistance[];
      }
      // TEXT-ONLY SEARCH: Query without location (nationwide search)
      else if (query.trim()) {
        console.log('🔍 Text-only search using smart_store_search');
        
        const { data, error: textError } = await supabase.rpc('smart_store_search', {
          search_text: query.trim(),
          search_city: '',
          search_state: '',
          search_zip: '',
          similarity_threshold: SEARCH_DEFAULTS.SIMILARITY_THRESHOLD,
          result_limit: SEARCH_DEFAULTS.TEXT_SEARCH_LIMIT * 2
        });

        if (textError) throw textError;

        results = (data || []).map((store: any) => mapToStoreWithDistance(store, false));
        
        // Apply category-specific filtering
        results = applyCategoryFiltering(results, category) as StoreWithDistance[];
      }
      // CURRENT LOCATION ONLY: No query, using device location
      else if (useCurrentLocation && searchLat !== null && searchLng !== null) {
        console.log('🔍 Current location search using get_nearby_stores');
        
        const { data, error: nearbyError } = await supabase.rpc('get_nearby_stores', {
          user_lat: searchLat,
          user_lng: searchLng,
          radius_miles: radius || SEARCH_DEFAULTS.RADIUS_MILES,
          store_types: storeType || null,
          result_limit: SEARCH_DEFAULTS.RESULT_LIMIT * 2
        });

        if (nearbyError) throw nearbyError;

        results = (data || []).map((store: any) => mapToStoreWithDistance(store, true));
        
        // Apply category-specific filtering
        results = applyCategoryFiltering(results, category) as StoreWithDistance[];
      } else {
        results = [];
      }

      // Save successful search to history
      if (results.length > 0) {
        saveToHistory(query, location);
      }

      return results;
    },
    enabled: !!(
      searchParams.query.trim() || 
      searchParams.location || 
      (searchParams.useCurrentLocation && latitude && longitude)
    ),
    staleTime: SEARCH_DEFAULTS.CACHE_TIME_MS,
    gcTime: SEARCH_DEFAULTS.GC_TIME_MS
  });

  // Derive hasSearched from searchParams - this ensures consistent state across hook instances
  const hasSearched = useMemo(() => {
    return !!(
      searchParams.query.trim() || 
      searchParams.location || 
      searchParams.useCurrentLocation
    );
  }, [searchParams.query, searchParams.location, searchParams.useCurrentLocation]);

  // Update suggestions when inputs change
  const currentSuggestions = useMemo(() => 
    generateSuggestions(searchParams.query, searchParams.location),
    [searchParams.query, searchParams.location, generateSuggestions]
  );

  useEffect(() => {
    setSuggestions(currentSuggestions);
  }, [currentSuggestions]);

  // Actions
  const updateSearchParams = useCallback((updates: Partial<SearchParams>) => {
    setSearchParams(prev => ({ ...prev, ...updates }));
  }, []);

  const clearSearch = useCallback(() => {
    setSearchParams({ query: '', radius: SEARCH_DEFAULTS.RADIUS_MILES });
    setSuggestions([]);
    setShowSuggestions(false);
  }, []);

  const clearHistory = useCallback(() => {
    setSearchHistory([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

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
