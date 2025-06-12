
import type { SortOption } from '@/components/SortDropdown';
import type { StoreWithLocationData } from '@/types/storeTypes';

export const sortStores = (stores: StoreWithLocationData[], sortBy: SortOption): StoreWithLocationData[] => {
  if (!stores || !Array.isArray(stores) || stores.length === 0) return [];

  const storesCopy = [...stores];

  switch (sortBy) {
    case 'distance':
      return storesCopy.sort((a, b) => (a.distance || 0) - (b.distance || 0));
    
    case 'popularity':
      // Sort by user review count (more reviews = more popular)
      // If no reviews, fallback to distance
      return storesCopy.sort((a, b) => {
        // We'll need to add review count to the store data in the future
        // For now, sort by distance as fallback
        return (a.distance || 0) - (b.distance || 0);
      });
    
    case 'rating':
      // Sort by user rating (higher rating first)
      // If no reviews, fallback to distance
      return storesCopy.sort((a, b) => {
        // We'll need to add average rating to the store data in the future
        // For now, sort by distance as fallback
        return (a.distance || 0) - (b.distance || 0);
      });
    
    default:
      return storesCopy;
  }
};
