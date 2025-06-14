
import type { Tables } from '@/integrations/supabase/types';

type Store = Tables<'snap_stores'>;

interface StoreWithDistance extends Store {
  distance?: number;
}

/**
 * Apply exclusion patterns for farmers market category
 */
export const applyFarmersMarketExclusion = (stores: StoreWithDistance[]): StoreWithDistance[] => {
  const beforeExclusion = stores.length;
  const excludePatterns = ['Whole Foods', 'Super Market', 'Food Market', 'Meat Market', 'Fish Market', 'Flea Market'];
  
  const filteredStores = stores.filter(store => {
    const storeName = store.Store_Name?.toLowerCase() || '';
    const storeType = store.Store_Type?.toLowerCase() || '';
    const shouldExclude = excludePatterns.some(pattern => 
      storeName.includes(pattern.toLowerCase()) || storeType.includes(pattern.toLowerCase())
    );
    return !shouldExclude;
  });
  
  console.log('Farmers market exclusion results:', {
    beforeExclusion,
    afterExclusion: filteredStores.length,
    excludePatterns,
    excludedStores: stores.filter(store => {
      const storeName = store.Store_Name?.toLowerCase() || '';
      const storeType = store.Store_Type?.toLowerCase() || '';
      return excludePatterns.some(pattern => 
        storeName.includes(pattern.toLowerCase()) || storeType.includes(pattern.toLowerCase())
      );
    }).map(s => ({ name: s.Store_Name, type: s.Store_Type })),
    sampleResults: filteredStores.slice(0, 5).map(r => ({ name: r.Store_Name, type: r.Store_Type }))
  });
  
  return filteredStores;
};

/**
 * Apply exclusion patterns for grocery category
 */
export const applyGroceryExclusion = (stores: StoreWithDistance[]): StoreWithDistance[] => {
  const excludePatterns = ['Farmers Market', 'Farm Market', 'Flea Market', 'Farmer\'s Market'];
  
  return stores.filter(store => {
    const storeName = store.Store_Name?.toLowerCase() || '';
    const storeType = store.Store_Type?.toLowerCase() || '';
    return !excludePatterns.some(pattern => 
      storeName.includes(pattern.toLowerCase()) || storeType.includes(pattern.toLowerCase())
    );
  });
};

/**
 * Apply location-based filtering with distance calculation
 */
export const applyLocationFiltering = (
  stores: StoreWithDistance[], 
  location: { lat: number; lng: number }, 
  radius: number,
  calculateDistance: (lat1: number, lon1: number, lat2: number, lon2: number) => number
): StoreWithDistance[] => {
  const { lat, lng } = location;
  const beforeLocationFilter = stores.length;
  
  console.log('Starting location filtering:', {
    userLocation: { lat, lng },
    radius,
    storesBeforeFilter: beforeLocationFilter,
    sampleStores: stores.slice(0, 3).map(s => ({
      name: s.Store_Name,
      lat: s.Latitude,
      lng: s.Longitude,
      hasCoordinates: !!(s.Latitude && s.Longitude)
    }))
  });
  
  const storesWithDistance = stores
    .filter(store => {
      if (!store.Latitude || !store.Longitude) {
        console.log('Store missing coordinates:', { name: store.Store_Name, lat: store.Latitude, lng: store.Longitude });
        return false;
      }
      return true;
    })
    .map(store => {
      const distance = calculateDistance(lat, lng, store.Latitude!, store.Longitude!);
      return {
        ...store,
        distance
      };
    });
  
  console.log('Distance calculations:', {
    storesWithCoordinates: storesWithDistance.length,
    sampleDistances: storesWithDistance.slice(0, 5).map(s => ({
      name: s.Store_Name,
      distance: s.distance?.toFixed(1)
    }))
  });
  
  const filteredStores = storesWithDistance
    .filter(store => store.distance! <= radius)
    .sort((a, b) => a.distance! - b.distance!);
  
  console.log('Final location filtering results:', {
    beforeLocationFilter,
    afterLocationFilter: filteredStores.length,
    radius,
    location: { lat, lng },
    closestStores: filteredStores.slice(0, 5).map(s => ({
      name: s.Store_Name,
      distance: s.distance?.toFixed(1),
      coordinates: { lat: s.Latitude, lng: s.Longitude }
    })),
    storesOutsideRadius: storesWithDistance.filter(s => s.distance! > radius).length
  });
  
  return filteredStores;
};
