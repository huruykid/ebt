
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Tables } from '@/integrations/supabase/types';

type Store = Tables<'snap_stores'>;

export const useUserStores = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-stores', user?.id],
    queryFn: async (): Promise<Store[]> => {
      if (!user) return [];

      // Get stores from user's favorites, reviews, or recent activity
      // For now, let's get stores from favorites and recent reviews
      const { data: favoriteStores, error: favError } = await supabase
        .from('favorites')
        .select(`
          store_id,
          snap_stores!inner(*)
        `)
        .eq('user_id', user.id)
        .limit(10);

      if (favError) {
        console.error('Error fetching favorite stores:', favError);
      }

      const { data: reviewedStores, error: reviewError } = await supabase
        .from('reviews')
        .select(`
          store_id,
          snap_stores!inner(*)
        `)
        .eq('user_id', user.id)
        .limit(10);

      if (reviewError) {
        console.error('Error fetching reviewed stores:', reviewError);
      }

      // Combine and deduplicate stores
      const allStores: Store[] = [];
      const seenStoreIds = new Set<string>();

      // Add favorite stores
      if (favoriteStores) {
        for (const favorite of favoriteStores) {
          const store = (favorite as any).snap_stores;
          if (store && !seenStoreIds.has(store.id)) {
            allStores.push(store);
            seenStoreIds.add(store.id);
          }
        }
      }

      // Add reviewed stores
      if (reviewedStores) {
        for (const review of reviewedStores) {
          const store = (review as any).snap_stores;
          if (store && !seenStoreIds.has(store.id)) {
            allStores.push(store);
            seenStoreIds.add(store.id);
          }
        }
      }

      return allStores;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
