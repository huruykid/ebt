import { useCallback } from 'react';

const REFERRER_KEY = 'ebt_nav_referrer';

interface ReferrerData {
  path: string;
  label: string;
}

/**
 * Determines the display label for a given path
 */
function getLabelForPath(path: string): string {
  // Handle root/home
  if (path === '/') {
    return 'Back to Home';
  }
  
  // Handle search (with or without query params)
  if (path.startsWith('/search')) {
    return 'Back to Search';
  }
  
  // Handle favorites
  if (path.startsWith('/favorites')) {
    return 'Back to Favorites';
  }
  
  // Handle city pages - extract city name
  if (path.startsWith('/city/')) {
    const citySlug = path.replace('/city/', '').split('?')[0];
    const cityName = citySlug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    return `Back to ${cityName}`;
  }
  
  // Handle state pages - extract state name
  if (path.startsWith('/state/')) {
    const stateSlug = path.replace('/state/', '').split('?')[0];
    const stateName = stateSlug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    return `Back to ${stateName}`;
  }
  
  // Handle blog
  if (path.startsWith('/blog')) {
    return 'Back to Blog';
  }
  
  // Default fallback
  return 'Back to Search';
}

/**
 * Saves the current path as the referrer for back navigation
 */
export function saveNavigationReferrer(currentPath: string): void {
  const referrerData: ReferrerData = {
    path: currentPath,
    label: getLabelForPath(currentPath),
  };
  
  try {
    sessionStorage.setItem(REFERRER_KEY, JSON.stringify(referrerData));
  } catch (e) {
    // Session storage might be unavailable in some contexts
    console.warn('Could not save navigation referrer:', e);
  }
}

/**
 * Gets the stored referrer data, or returns defaults
 */
export function getNavigationReferrer(): ReferrerData {
  const defaultReferrer: ReferrerData = {
    path: '/search',
    label: 'Back to Search',
  };
  
  try {
    const stored = sessionStorage.getItem(REFERRER_KEY);
    if (stored) {
      return JSON.parse(stored) as ReferrerData;
    }
  } catch (e) {
    console.warn('Could not read navigation referrer:', e);
  }
  
  return defaultReferrer;
}

/**
 * Clears the stored referrer (optional, for cleanup)
 */
export function clearNavigationReferrer(): void {
  try {
    sessionStorage.removeItem(REFERRER_KEY);
  } catch (e) {
    // Ignore errors
  }
}

/**
 * Hook for components that need to read the referrer
 */
export function useNavigationReferrer() {
  const referrer = getNavigationReferrer();
  
  const saveReferrer = useCallback((path: string) => {
    saveNavigationReferrer(path);
  }, []);
  
  return {
    referrerPath: referrer.path,
    referrerLabel: referrer.label,
    saveReferrer,
  };
}
