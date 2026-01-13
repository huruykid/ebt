/**
 * Utility functions for checking store opening hours
 */

interface OpeningHours {
  open_now?: boolean;
  weekday_text?: string[];
  periods?: Array<{
    open: { day: number; time: string };
    close?: { day: number; time: string };
  }>;
}

/**
 * Check if a store is currently open based on google_opening_hours data
 */
export const isStoreOpen = (openingHours: OpeningHours | null | undefined): boolean | null => {
  if (!openingHours) return null;
  
  // Use the open_now field if available (most reliable)
  if (typeof openingHours.open_now === 'boolean') {
    return openingHours.open_now;
  }
  
  return null;
};

/**
 * Get the open status text for display
 */
export const getOpenStatusText = (openingHours: OpeningHours | null | undefined): string => {
  const isOpen = isStoreOpen(openingHours);
  
  if (isOpen === null) return 'Hours not available';
  return isOpen ? 'Open Now' : 'Closed';
};

/**
 * Filter stores to only show those that are currently open
 */
export const filterOpenNowStores = <T extends { google_opening_hours?: unknown }>(
  stores: T[]
): T[] => {
  return stores.filter((store) => {
    const openingHours = store.google_opening_hours as OpeningHours | null;
    return isStoreOpen(openingHours) === true;
  });
};
