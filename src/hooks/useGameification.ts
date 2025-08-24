
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { Tables, Database } from '@/integrations/supabase/types';

type ContributionType = Database['public']['Enums']['contribution_type'];
type Badge = Tables<'badges'>;
type UserBadge = Tables<'user_badges'>;
type UserPoint = Tables<'user_points'>;

export const useGameification = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch user's points and stats using secure function
  const { data: userStats } = useQuery({
    queryKey: ['user-stats', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .rpc('get_user_stats', { target_user_id: user.id });
      
      if (error) throw error;
      return data?.[0] || null; // RPC returns array, we want first item
    },
    enabled: !!user?.id,
  });

  // Fetch user's badges
  const { data: userBadges } = useQuery({
    queryKey: ['user-badges', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('user_badges')
        .select(`
          *,
          badges (*)
        `)
        .eq('user_id', user.id)
        .order('earned_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch all available badges
  const { data: allBadges } = useQuery({
    queryKey: ['badges'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('badges')
        .select('*')
        .order('contributions_required', { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  // Award points mutation
  const awardPointsMutation = useMutation({
    mutationFn: async ({
      contributionType,
      storeId,
      points = 10,
      description
    }: {
      contributionType: ContributionType;
      storeId?: number;
      points?: number;
      description?: string;
    }) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('user_points')
        .insert({
          user_id: user.id,
          store_id: storeId,
          contribution_type: contributionType,
          points_earned: points,
          description: description || `Earned ${points} points for ${contributionType.replace('_', ' ')}`,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['user-stats', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['user-badges', user?.id] });
      
      toast.success(`🎉 +${data.points_earned} points earned!`, {
        description: data.description,
      });
    },
    onError: (error) => {
      toast.error('Failed to award points', {
        description: error.message,
      });
    },
  });

  return {
    userStats,
    userBadges,
    allBadges,
    awardPoints: awardPointsMutation.mutate,
    isAwarding: awardPointsMutation.isPending,
  };
};
