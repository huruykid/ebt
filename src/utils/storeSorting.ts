
import type { SortOption } from '@/components/SortDropdown';
import type { StoreWithLocationData } from '@/types/storeTypes';

export const sortStores = (stores: StoreWithLocationData[], sortBy: SortOption): StoreWithLocationData[] => {
  if (!stores || !Array.isArray(stores) || stores.length === 0) return [];

  const storesCopy = [...stores];

  switch (sortBy) {
    case 'distance':
      return storesCopy.sort((a, b) => (a.distance || 0) - (b.distance || 0));
    
    case 'popularity':
      // For now, sort by distance since we don't have popularity data from OSM
      // This can be enhanced later with store visit tracking or review counts
      return storesCopy.sort((a, b) => (a.distance || 0) - (b.distance || 0));
    
    case 'rating':
      // For now, sort by distance since we don't have rating data from OSM
      // This can be enhanced later with internal review system
      return storesCopy.sort((a, b) => (a.distance || 0) - (b.distance || 0));
    
    default:
      return storesCopy;
  }
};
