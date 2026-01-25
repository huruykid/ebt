import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface UserList {
  id: string;
  name: string;
  description: string | null;
  is_public: boolean;
  icon: string;
  created_at: string;
  store_count?: number;
}

export interface ListStore {
  id: string;
  list_id: string;
  store_id: string;
  notes: string | null;
  added_at: string;
}

export const useSavedLists = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all user lists with store counts
  const { data: lists = [], isLoading } = useQuery({
    queryKey: ['user-lists', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data: listsData, error } = await supabase
        .from('user_lists')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get store counts for each list
      const listsWithCounts = await Promise.all(
        (listsData || []).map(async (list) => {
          const { count } = await supabase
            .from('list_stores')
            .select('*', { count: 'exact', head: true })
            .eq('list_id', list.id);
          
          return { ...list, store_count: count || 0 };
        })
      );

      return listsWithCounts as UserList[];
    },
    enabled: !!user,
  });

  // Create a new list
  const createList = useMutation({
    mutationFn: async ({ name, description, icon }: { name: string; description?: string; icon?: string }) => {
      if (!user) throw new Error('Must be logged in');
      
      const { data, error } = await supabase
        .from('user_lists')
        .insert({
          user_id: user.id,
          name,
          description: description || null,
          icon: icon || 'folder',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-lists'] });
      toast({ title: 'List created!', description: 'Your new list is ready.' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Could not create list.', variant: 'destructive' });
    },
  });

  // Delete a list
  const deleteList = useMutation({
    mutationFn: async (listId: string) => {
      const { error } = await supabase
        .from('user_lists')
        .delete()
        .eq('id', listId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-lists'] });
      toast({ title: 'List deleted' });
    },
  });

  // Add store to a list
  const addToList = useMutation({
    mutationFn: async ({ listId, storeId, notes }: { listId: string; storeId: string; notes?: string }) => {
      const { error } = await supabase
        .from('list_stores')
        .insert({
          list_id: listId,
          store_id: storeId,
          notes: notes || null,
        });

      if (error) {
        if (error.code === '23505') {
          throw new Error('Store already in list');
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-lists'] });
      queryClient.invalidateQueries({ queryKey: ['list-stores'] });
      toast({ title: 'Added to list!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  // Remove store from a list
  const removeFromList = useMutation({
    mutationFn: async ({ listId, storeId }: { listId: string; storeId: string }) => {
      const { error } = await supabase
        .from('list_stores')
        .delete()
        .eq('list_id', listId)
        .eq('store_id', storeId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-lists'] });
      queryClient.invalidateQueries({ queryKey: ['list-stores'] });
      toast({ title: 'Removed from list' });
    },
  });

  return {
    lists,
    isLoading,
    createList,
    deleteList,
    addToList,
    removeFromList,
  };
};

// Hook to get stores in a specific list
export const useListStores = (listId: string | null) => {
  return useQuery({
    queryKey: ['list-stores', listId],
    queryFn: async () => {
      if (!listId) return [];

      const { data, error } = await supabase
        .from('list_stores')
        .select(`
          *,
          snap_stores (
            id,
            Store_Name,
            Store_Street_Address,
            City,
            State,
            Store_Type,
            Latitude,
            Longitude,
            google_rating,
            Incentive_Program
          )
        `)
        .eq('list_id', listId)
        .order('added_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!listId,
  });
};
