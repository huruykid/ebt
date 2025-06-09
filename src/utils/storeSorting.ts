
import type { SortOption } from '@/components/SortDropdown';
import type { StoreWithGoogleData } from '@/hooks/useStoreGoogleData';

export const sortStores = (stores: StoreWithGoogleData[], sortBy: SortOption): StoreWithGoogleData[] => {
  if (!stores) return [];

  const storesCopy = [...stores];

  switch (sortBy) {
    case 'distance':
      return storesCopy.sort((a, b) => (a.distance || 0) - (b.distance || 0));
    
    case 'popularity':
      // Sort by Google review count
      return storesCopy.sort((a, b) => {
        const aPopularity = a.googleData?.user_ratings_total || 0;
        const bPopularity = b.googleData?.user_ratings_total || 0;
        if (aPopularity !== bPopularity) {
          return bPopularity - aPopularity;
        }
        // Secondary sort by distance
        return (a.distance || 0) - (b.distance || 0);
      });
    
    case 'rating':
      // Sort by Google rating
      return storesCopy.sort((a, b) => {
        const aRating = a.googleData?.rating || 0;
        const bRating = b.googleData?.rating || 0;
        if (aRating !== bRating) {
          return bRating - aRating;
        }
        // Secondary sort by distance
        return (a.distance || 0) - (b.distance || 0);
      });
    
    default:
      return storesCopy;
  }
};
