import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useFavorites } from './useFavorites';
import type { Store } from '@/types/storeTypes';

export const usePersonalizedRecommendations = (userLat?: number | null, userLng?: number | null) => {
  const { user } = useAuth();
  const { favorites } = useFavorites();

  // Get store types from favorites for recommendations
  const favoriteStoreTypes = favorites
    .map(f => f.snap_stores?.Store_Type)
    .filter((type): type is string => !!type);

  // Get unique store types user has favorited
  const preferredTypes = [...new Set(favoriteStoreTypes)];

  const { data: recommendations = [], isLoading } = useQuery({
    queryKey: ['personalized-recommendations', user?.id, preferredTypes, userLat, userLng],
    queryFn: async () => {
      if (!userLat || !userLng) return [];

      // Get stores nearby that match user's preferred types
      // Exclude stores already in favorites
      const favoriteIds = favorites.map(f => f.store_id);

      let query = supabase
        .from('snap_stores')
        .select('*')
        .not('id', 'in', `(${favoriteIds.length > 0 ? favoriteIds.join(',') : 'null'})`)
        .not('Store_Name', 'is', null)
        .not('Latitude', 'is', null)
        .not('Longitude', 'is', null)
        .gte('Latitude', userLat - 0.2) // ~14 miles
        .lte('Latitude', userLat + 0.2)
        .gte('Longitude', userLng - 0.2)
        .lte('Longitude', userLng + 0.2);

      // If user has preferred types, filter by them
      if (preferredTypes.length > 0) {
        query = query.in('Store_Type', preferredTypes);
      }

      // Prioritize stores with incentive programs and good ratings
      query = query
        .order('google_rating', { ascending: false, nullsFirst: false })
        .limit(6);

      const { data, error } = await query;

      if (error) throw error;

      // Calculate distances and sort
      const storesWithDistance = (data || []).map(store => {
        const distance = calculateDistance(
          userLat,
          userLng,
          store.Latitude!,
          store.Longitude!
        );
        return { ...store, distance };
      });

      return storesWithDistance.sort((a, b) => {
        // Prioritize stores with incentive programs
        const aHasIncentive = a.Incentive_Program ? 1 : 0;
        const bHasIncentive = b.Incentive_Program ? 1 : 0;
        if (aHasIncentive !== bHasIncentive) return bHasIncentive - aHasIncentive;
        
        // Then by rating
        const aRating = a.google_rating || 0;
        const bRating = b.google_rating || 0;
        if (Math.abs(aRating - bRating) > 0.5) return bRating - aRating;
        
        // Then by distance
        return (a.distance || 0) - (b.distance || 0);
      });
    },
    enabled: !!user && !!userLat && !!userLng,
  });

  return {
    recommendations,
    isLoading,
    hasPreferences: preferredTypes.length > 0,
    preferredTypes,
  };
};

// Haversine formula for distance calculation
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959; // Earth's radius in miles
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}
