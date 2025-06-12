
import type { SortOption } from '@/components/SortDropdown';
import type { StoreWithLocationData } from '@/types/storeTypes';

export const sortStores = (stores: StoreWithLocationData[], sortBy: SortOption): StoreWithLocationData[] => {
  if (!stores || !Array.isArray(stores) || stores.length === 0) return [];

  const storesCopy = [...stores];

  switch (sortBy) {
    case 'distance':
      return storesCopy.sort((a, b) => (a.distance || 0) - (b.distance || 0));
    
    case 'popularity':
      // Sort by Google review count (more reviews = more popular)
      // If no Google data, fallback to distance
      return storesCopy.sort((a, b) => {
        const aReviews = a.locationData?.google_user_ratings_total || 0;
        const bReviews = b.locationData?.google_user_ratings_total || 0;
        
        if (aReviews !== bReviews) {
          return bReviews - aReviews; // Higher review count first
        }
        
        // If review counts are equal, sort by distance
        return (a.distance || 0) - (b.distance || 0);
      });
    
    case 'rating':
      // Sort by Google rating (higher rating first)
      // If no Google data, fallback to distance
      return storesCopy.sort((a, b) => {
        const aRating = a.locationData?.google_rating || 0;
        const bRating = b.locationData?.google_rating || 0;
        
        if (aRating !== bRating) {
          return bRating - aRating; // Higher rating first
        }
        
        // If ratings are equal, sort by distance
        return (a.distance || 0) - (b.distance || 0);
      });
    
    default:
      return storesCopy;
  }
};
