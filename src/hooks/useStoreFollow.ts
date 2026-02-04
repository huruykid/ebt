import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface StoreFollow {
  id: string;
  user_id: string;
  store_id: string;
  notify_on_updates: boolean;
  notify_on_price_drops: boolean;
  created_at: string;
}

export function useStoreFollow(storeId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Check if following this store
  const { data: isFollowing, isLoading } = useQuery({
    queryKey: ['store-follow', storeId, user?.id],
    queryFn: async () => {
      if (!user || !storeId) return false;
      
      const { data, error } = await supabase
        .from('store_follows')
        .select('id')
        .eq('user_id', user.id)
        .eq('store_id', storeId)
        .maybeSingle();

      if (error) throw error;
      return !!data;
    },
    enabled: !!user && !!storeId,
  });

  // Get all followed stores
  const { data: followedStores } = useQuery({
    queryKey: ['followed-stores', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('store_follows')
        .select(`
          *,
          snap_stores (
            id,
            Store_Name,
            City,
            State,
            google_rating
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Follow a store
  const followStore = useMutation({
    mutationFn: async (storeIdToFollow: string) => {
      if (!user) throw new Error('Not authenticated');
      
      const { error } = await supabase
        .from('store_follows')
        .insert({
          user_id: user.id,
          store_id: storeIdToFollow,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-follow'] });
      queryClient.invalidateQueries({ queryKey: ['followed-stores'] });
      toast.success('Following store! You\'ll get updates.');
    },
    onError: () => {
      toast.error('Failed to follow store');
    },
  });

  // Unfollow a store
  const unfollowStore = useMutation({
    mutationFn: async (storeIdToUnfollow: string) => {
      if (!user) throw new Error('Not authenticated');
      
      const { error } = await supabase
        .from('store_follows')
        .delete()
        .eq('user_id', user.id)
        .eq('store_id', storeIdToUnfollow);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-follow'] });
      queryClient.invalidateQueries({ queryKey: ['followed-stores'] });
      toast.success('Unfollowed store');
    },
    onError: () => {
      toast.error('Failed to unfollow store');
    },
  });

  // Toggle follow
  const toggleFollow = async (targetStoreId: string) => {
    const currentlyFollowing = await supabase
      .from('store_follows')
      .select('id')
      .eq('user_id', user?.id)
      .eq('store_id', targetStoreId)
      .maybeSingle();

    if (currentlyFollowing.data) {
      await unfollowStore.mutateAsync(targetStoreId);
    } else {
      await followStore.mutateAsync(targetStoreId);
    }
  };

  return {
    isFollowing,
    isLoading,
    followedStores,
    followStore,
    unfollowStore,
    toggleFollow,
  };
}
