import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface UserPoints {
  id: string;
  user_id: string;
  total_points: number;
  lifetime_points: number;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
}

interface ContributionHistory {
  id: string;
  contribution_type: string;
  points_awarded: number;
  reference_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

interface Badge {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  points_required: number;
  contribution_type: string | null;
  contribution_count: number;
}

interface UserBadge {
  id: string;
  badge_id: string;
  earned_at: string;
  notified: boolean;
  badges: Badge;
}

export function useUserPoints() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch user points
  const { data: points, isLoading: pointsLoading } = useQuery({
    queryKey: ['user-points', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('user_points')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data as UserPoints | null;
    },
    enabled: !!user,
  });

  // Fetch contribution history
  const { data: contributions, isLoading: contributionsLoading } = useQuery({
    queryKey: ['contribution-history', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('contribution_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data as ContributionHistory[];
    },
    enabled: !!user,
  });

  // Fetch user badges
  const { data: userBadges, isLoading: badgesLoading } = useQuery({
    queryKey: ['user-badges', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('user_badges')
        .select(`
          id,
          badge_id,
          earned_at,
          notified,
          badges (
            id,
            slug,
            name,
            description,
            icon,
            points_required,
            contribution_type,
            contribution_count
          )
        `)
        .eq('user_id', user.id)
        .order('earned_at', { ascending: false });

      if (error) throw error;
      return data as unknown as UserBadge[];
    },
    enabled: !!user,
  });

  // Fetch all available badges
  const { data: allBadges } = useQuery({
    queryKey: ['all-badges'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('badges')
        .select('*')
        .eq('is_secret', false)
        .order('points_required', { ascending: true });

      if (error) throw error;
      return data as Badge[];
    },
  });

  // Track daily visit (awards 1 point)
  const trackDailyVisit = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase.rpc('award_contribution_points', {
        p_user_id: user.id,
        p_contribution_type: 'daily_visit',
      });

      if (error) throw error;
      return data as number;
    },
    onSuccess: (pointsAwarded) => {
      if (pointsAwarded > 0) {
        queryClient.invalidateQueries({ queryKey: ['user-points'] });
        queryClient.invalidateQueries({ queryKey: ['user-badges'] });
      }
    },
  });

  return {
    points,
    contributions,
    userBadges,
    allBadges,
    isLoading: pointsLoading || contributionsLoading || badgesLoading,
    trackDailyVisit,
  };
}

export type { UserPoints, ContributionHistory, Badge, UserBadge };
