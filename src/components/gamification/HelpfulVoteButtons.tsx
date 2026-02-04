import React from 'react';
import { ThumbsUp, ThumbsDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useHelpfulVotes } from '@/hooks/useHelpfulVotes';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface HelpfulVoteButtonsProps {
  reviewId: string;
  className?: string;
}

export const HelpfulVoteButtons: React.FC<HelpfulVoteButtonsProps> = ({
  reviewId,
  className = '',
}) => {
  const { user } = useAuth();
  const { getVoteCount, getUserVote, castVote } = useHelpfulVotes([reviewId]);

  const counts = getVoteCount(reviewId);
  const userVote = getUserVote(reviewId);

  const handleVote = async (isHelpful: boolean) => {
    if (!user) {
      toast.error('Please sign in to vote');
      return;
    }
    
    await castVote.mutateAsync({ reviewId, isHelpful });
  };

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <span className="text-xs text-muted-foreground mr-1">Helpful?</span>
      
      <Button
        variant="ghost"
        size="sm"
        className={`h-7 px-2 gap-1 ${
          userVote === true ? 'text-green-600 bg-green-50 dark:bg-green-950' : ''
        }`}
        onClick={() => handleVote(true)}
        disabled={castVote.isPending}
      >
        {castVote.isPending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <ThumbsUp className={`h-3.5 w-3.5 ${userVote === true ? 'fill-current' : ''}`} />
        )}
        <span className="text-xs">{counts.helpful}</span>
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className={`h-7 px-2 gap-1 ${
          userVote === false ? 'text-red-600 bg-red-50 dark:bg-red-950' : ''
        }`}
        onClick={() => handleVote(false)}
        disabled={castVote.isPending}
      >
        <ThumbsDown className={`h-3.5 w-3.5 ${userVote === false ? 'fill-current' : ''}`} />
        <span className="text-xs">{counts.notHelpful}</span>
      </Button>
    </div>
  );
};

export default HelpfulVoteButtons;
