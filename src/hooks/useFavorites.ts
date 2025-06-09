
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const useFavorites = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch user's favorites
  const { data: favorites = [], isLoading } = useQuery({
    queryKey: ['favorites', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          *,
          snap_stores (*)
        `)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching favorites:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!user,
  });

  // Check if a store is favorited
  const isFavorited = (storeId: number) => {
    return favorites.some(fav => fav.store_id === storeId);
  };

  // Add to favorites
  const addToFavoritesMutation = useMutation({
    mutationFn: async (storeId: number) => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('favorites')
        .insert({
          user_id: user.id,
          store_id: storeId,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      toast.success('Added to favorites!');
    },
    onError: (error) => {
      console.error('Error adding to favorites:', error);
      toast.error('Failed to add to favorites');
    },
  });

  // Remove from favorites
  const removeFromFavoritesMutation = useMutation({
    mutationFn: async (storeId: number) => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('store_id', storeId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      toast.success('Removed from favorites!');
    },
    onError: (error) => {
      console.error('Error removing from favorites:', error);
      toast.error('Failed to remove from favorites');
    },
  });

  const toggleFavorite = (storeId: number) => {
    if (isFavorited(storeId)) {
      removeFromFavoritesMutation.mutate(storeId);
    } else {
      addToFavoritesMutation.mutate(storeId);
    }
  };

  return {
    favorites,
    isLoading,
    isFavorited,
    toggleFavorite,
    isToggling: addToFavoritesMutation.isPending || removeFromFavoritesMutation.isPending,
  };
};
