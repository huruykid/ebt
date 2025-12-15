import type { Tables } from '@/integrations/supabase/types';

type Store = Tables<'snap_stores'>;

/**
 * Format store address from parts
 */
export const formatStoreAddress = (store: {
  Store_Street_Address?: string | null;
  City?: string | null;
  State?: string | null;
}): string => {
  const parts = [
    store.Store_Street_Address,
    store.City,
    store.State
  ].filter(Boolean);
  
  return parts.join(', ');
};

/**
 * Check if store is enrolled in Restaurant Meals Program
 */
export const isRmpEnrolled = (incentiveProgram: string | null | undefined): boolean => {
  if (!incentiveProgram) return false;
  const program = incentiveProgram.toLowerCase();
  return program.includes('rmp') || program.includes('restaurant meals program');
};

/**
 * Get opening hours status from Google Places data
 */
export const getOpeningStatus = (openingHours: { open_now?: boolean } | null | undefined): string => {
  if (openingHours?.open_now !== undefined) {
    return openingHours.open_now ? 'Open Now' : 'Closed';
  }
  return 'Hours not available';
};

/**
 * Extract photos array from store data
 */
export const getStorePhotos = (store: Store): Array<{ photo_url?: string }> | null => {
  return store.google_photos as Array<{ photo_url?: string }> | null;
};
