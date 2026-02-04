import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface VoteCount {
  review_id: string;
  helpful_count: number;
  not_helpful_count: number;
}

export function useHelpfulVotes(reviewIds: string[]) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Get vote counts for reviews
  const { data: voteCounts } = useQuery({
    queryKey: ['helpful-votes', reviewIds],
    queryFn: async () => {
      if (reviewIds.length === 0) return [];
      
      const { data, error } = await supabase.rpc('get_review_helpful_counts', {
        p_review_ids: reviewIds,
      });

      if (error) throw error;
      return data as VoteCount[];
    },
    enabled: reviewIds.length > 0,
  });

  // Get user's own votes
  const { data: userVotes } = useQuery({
    queryKey: ['user-votes', user?.id, reviewIds],
    queryFn: async () => {
      if (!user || reviewIds.length === 0) return {};
      
      const { data, error } = await supabase
        .from('helpful_votes')
        .select('review_id, is_helpful')
        .eq('user_id', user.id)
        .in('review_id', reviewIds);

      if (error) throw error;
      
      return data.reduce((acc, vote) => {
        acc[vote.review_id] = vote.is_helpful;
        return acc;
      }, {} as Record<string, boolean>);
    },
    enabled: !!user && reviewIds.length > 0,
  });

  // Cast a vote
  const castVote = useMutation({
    mutationFn: async ({ reviewId, isHelpful }: { reviewId: string; isHelpful: boolean }) => {
      if (!user) throw new Error('Not authenticated');
      
      // First check if vote exists
      const { data: existing } = await supabase
        .from('helpful_votes')
        .select('id, is_helpful')
        .eq('user_id', user.id)
        .eq('review_id', reviewId)
        .maybeSingle();

      if (existing) {
        if (existing.is_helpful === isHelpful) {
          // Same vote - remove it
          const { error } = await supabase
            .from('helpful_votes')
            .delete()
            .eq('id', existing.id);
          if (error) throw error;
          return 'removed';
        } else {
          // Different vote - update it
          const { error } = await supabase
            .from('helpful_votes')
            .update({ is_helpful: isHelpful })
            .eq('id', existing.id);
          if (error) throw error;
          return 'updated';
        }
      } else {
        // New vote
        const { error } = await supabase
          .from('helpful_votes')
          .insert({
            user_id: user.id,
            review_id: reviewId,
            is_helpful: isHelpful,
          });
        if (error) throw error;
        return 'created';
      }
    },
    onSuccess: (action) => {
      queryClient.invalidateQueries({ queryKey: ['helpful-votes'] });
      queryClient.invalidateQueries({ queryKey: ['user-votes'] });
      
      if (action === 'created') {
        toast.success('Thanks for your feedback!');
      }
    },
    onError: () => {
      toast.error('Failed to record vote');
    },
  });

  // Helper to get counts for a specific review
  const getVoteCount = (reviewId: string) => {
    const counts = voteCounts?.find(vc => vc.review_id === reviewId);
    return {
      helpful: counts?.helpful_count || 0,
      notHelpful: counts?.not_helpful_count || 0,
    };
  };

  // Helper to get user's vote for a specific review
  const getUserVote = (reviewId: string): boolean | null => {
    if (!userVotes) return null;
    return userVotes[reviewId] ?? null;
  };

  return {
    voteCounts,
    userVotes,
    castVote,
    getVoteCount,
    getUserVote,
  };
}
