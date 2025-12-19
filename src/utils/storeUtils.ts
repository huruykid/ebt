/**
 * Re-export from core library for backward compatibility
 */
export {
  formatStoreAddress,
  formatFullAddress,
  isRmpEnrolled,
  getOpeningStatus,
  normalizeStoreName,
  matchesSearchQuery,
  getStoreTypeDisplayName,
} from '@/lib/core/store-utils';

import type { Tables } from '@/integrations/supabase/types';

type Store = Tables<'snap_stores'>;

/**
 * Extract photos array from store data
 * (Supabase-specific, not in core library)
 */
export const getStorePhotos = (store: Store): Array<{ photo_url?: string }> | null => {
  return store.google_photos as Array<{ photo_url?: string }> | null;
};
