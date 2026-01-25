import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Json } from '@/integrations/supabase/types';

export interface StoreUpdate {
  id: string;
  store_id: string;
  user_id: string | null;
  update_type: 'review' | 'photo' | 'price' | 'tip' | 'hours';
  title: string;
  description: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  store?: {
    Store_Name: string | null;
    City: string | null;
    State: string | null;
  };
}

interface UseStoreUpdatesOptions {
  storeId?: string;
  limit?: number;
  userLat?: number;
  userLng?: number;
}

export const useStoreUpdates = (options: UseStoreUpdatesOptions = {}) => {
  const { storeId, limit = 20, userLat, userLng } = options;
  const queryClient = useQueryClient();

  const { data: updates = [], isLoading, refetch } = useQuery({
    queryKey: ['store-updates', storeId, userLat, userLng, limit],
    queryFn: async () => {
      let query = supabase
        .from('store_updates')
        .select(`
          *,
          snap_stores!inner (
            Store_Name,
            City,
            State,
            Latitude,
            Longitude
          )
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (storeId) {
        query = query.eq('store_id', storeId);
      }

      // If we have user location, filter to nearby stores (~25 miles)
      if (userLat && userLng) {
        const latDelta = 25 / 69; // ~25 miles in latitude
        const lngDelta = 25 / (69 * Math.cos(userLat * Math.PI / 180));
        
        query = query
          .gte('snap_stores.Latitude', userLat - latDelta)
          .lte('snap_stores.Latitude', userLat + latDelta)
          .gte('snap_stores.Longitude', userLng - lngDelta)
          .lte('snap_stores.Longitude', userLng + lngDelta);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      return (data || []).map((update: Record<string, unknown>) => ({
        ...update,
        store: update.snap_stores as StoreUpdate['store'],
      })) as StoreUpdate[];
    },
  });

  return {
    updates,
    isLoading,
    refetch,
  };
};

// Hook to create store updates (used by other features)
export const useCreateStoreUpdate = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      storeId,
      updateType,
      title,
      description,
      metadata,
    }: {
      storeId: string;
      updateType: StoreUpdate['update_type'];
      title: string;
      description?: string;
      metadata?: Json;
    }) => {
      const { error } = await supabase
        .from('store_updates')
        .insert([{
          store_id: storeId,
          user_id: user?.id || null,
          update_type: updateType,
          title,
          description: description || null,
          metadata: metadata || {},
        }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-updates'] });
    },
  });
};
