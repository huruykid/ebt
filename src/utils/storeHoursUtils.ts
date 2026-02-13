/**
 * Utility functions for checking store opening hours
 * Computes open/closed status LIVE from periods data, not from stale open_now snapshots.
 */

interface Period {
  open: { day: number; time: string };
  close?: { day: number; time: string };
}

interface OpeningHours {
  open_now?: boolean;
  weekday_text?: string[];
  periods?: Period[];
}

/**
 * Convert HHMM string to minutes since midnight
 */
const timeToMinutes = (time: string): number => {
  const h = parseInt(time.substring(0, 2), 10);
  const m = parseInt(time.substring(2, 4), 10);
  return h * 60 + m;
};

/**
 * Check if a store is currently open based on google_opening_hours periods data.
 * Computes live status from the periods array rather than relying on the stale open_now field.
 */
export const isStoreOpen = (openingHours: OpeningHours | null | undefined): boolean | null => {
  if (!openingHours) return null;

  const periods = openingHours.periods;
  if (!periods || periods.length === 0) return null;

  // Special case: open 24/7 — single period with open day=0 time=0000 and no close
  if (periods.length === 1 && periods[0].open.time === '0000' && !periods[0].close) {
    return true;
  }

  const now = new Date();
  const currentDay = now.getDay(); // 0=Sunday matches Google's format
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  for (const period of periods) {
    const openDay = period.open.day;
    const openMinutes = timeToMinutes(period.open.time);

    if (!period.close) {
      // No close time — treat as open all day on that day
      if (currentDay === openDay) return true;
      continue;
    }

    const closeDay = period.close.day;
    const closeMinutes = timeToMinutes(period.close.time);

    if (openDay === closeDay) {
      // Same-day period (e.g., Mon 10:00-19:00)
      if (currentDay === openDay && currentMinutes >= openMinutes && currentMinutes < closeMinutes) {
        return true;
      }
    } else {
      // Overnight period (e.g., Fri 06:00 - Sat 00:00)
      // Check if we're in the opening day after open time
      if (currentDay === openDay && currentMinutes >= openMinutes) {
        return true;
      }
      // Check if we're in the closing day before close time
      if (currentDay === closeDay && currentMinutes < closeMinutes) {
        return true;
      }
    }
  }

  return false;
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
