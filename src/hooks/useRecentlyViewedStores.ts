import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Store } from '@/types/storeTypes';

const STORAGE_KEY = 'ebt-recently-viewed-stores';
const MAX_RECENT_STORES = 10;

interface RecentlyViewedEntry {
  storeId: string;
  timestamp: number;
}

export const useRecentlyViewedStores = () => {
  const [recentIds, setRecentIds] = useState<string[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const entries: RecentlyViewedEntry[] = JSON.parse(stored);
        // Sort by most recent and extract IDs
        const ids = entries
          .sort((a, b) => b.timestamp - a.timestamp)
          .map(e => e.storeId);
        setRecentIds(ids);
      }
    } catch (error) {
      console.error('Error loading recently viewed stores:', error);
    }
  }, []);

  // Track a store view
  const trackView = (storeId: string) => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      let entries: RecentlyViewedEntry[] = stored ? JSON.parse(stored) : [];
      
      // Remove existing entry for this store if present
      entries = entries.filter(e => e.storeId !== storeId);
      
      // Add new entry at the beginning
      entries.unshift({ storeId, timestamp: Date.now() });
      
      // Keep only the most recent entries
      entries = entries.slice(0, MAX_RECENT_STORES);
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
      setRecentIds(entries.map(e => e.storeId));
    } catch (error) {
      console.error('Error tracking store view:', error);
    }
  };

  // Fetch store details for recent IDs
  const { data: recentStores = [], isLoading } = useQuery({
    queryKey: ['recently-viewed-stores', recentIds],
    queryFn: async () => {
      if (recentIds.length === 0) return [];
      
      const { data, error } = await supabase
        .from('snap_stores')
        .select('*')
        .in('id', recentIds);
      
      if (error) throw error;
      
      // Maintain the order from recentIds
      const storeMap = new Map((data || []).map(s => [s.id, s]));
      return recentIds
        .map(id => storeMap.get(id))
        .filter((s): s is Store => s !== undefined);
    },
    enabled: recentIds.length > 0,
  });

  // Clear history
  const clearHistory = () => {
    localStorage.removeItem(STORAGE_KEY);
    setRecentIds([]);
  };

  return {
    recentStores,
    isLoading,
    trackView,
    clearHistory,
    hasHistory: recentIds.length > 0,
  };
};
