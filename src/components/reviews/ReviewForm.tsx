
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { StarRating } from './StarRating';
import { LoginPromptModal } from '@/components/LoginPromptModal';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useContributionTracking } from '@/hooks/useContributionTracking';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface ReviewFormProps {
  storeId: number;
  onSuccess?: () => void;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({ storeId, onSuccess }) => {
  const { user } = useAuth();
  const { trackContribution } = useContributionTracking();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);

  const submitReviewMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('User not authenticated');
      if (rating === 0) throw new Error('Please select a rating');

      const { data, error } = await supabase
        .from('reviews')
        .insert({
          user_id: user.id,
          store_id: storeId,
          rating,
          review_text: reviewText.trim() || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Track the contribution
      trackContribution('store_review', storeId);
      
      // Reset form
      setRating(0);
      setReviewText('');
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['public-reviews', storeId] });
      queryClient.invalidateQueries({ queryKey: ['store-review-stats', storeId] });
      
      toast.success('Review submitted successfully!');
      onSuccess?.();
    },
    onError: (error: any) => {
      toast.error('Failed to submit review', {
        description: error.message,
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    
    submitReviewMutation.mutate();
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Your Rating</label>
          <StarRating 
            rating={rating} 
            onRatingChange={setRating}
          />
        </div>
        
        <div>
          <label htmlFor="review-text" className="block text-sm font-medium mb-2">
            Your Review (Optional)
          </label>
          <Textarea
            id="review-text"
            placeholder="Share your experience with this store..."
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            rows={4}
          />
        </div>

        <Button 
          type="submit" 
          disabled={rating === 0 || submitReviewMutation.isPending}
          className="w-full"
        >
          {submitReviewMutation.isPending ? 'Submitting...' : 'Submit Review'}
        </Button>
      </form>

      <LoginPromptModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        action="leave a review"
        description="Create an account or sign in to share your experience and help the community discover great stores."
      />
    </>
  );
};
