
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { StarRating } from './StarRating';
import { LoginPromptModal } from '@/components/LoginPromptModal';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { reviewSchema, type ReviewInput } from '@/lib/validationSchemas';
import { sanitizeString } from '@/utils/security';

interface ReviewFormProps {
  storeId: number;
  onSuccess?: () => void;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({ storeId, onSuccess }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);

  const submitReviewMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('User not authenticated');

      // Validate and sanitize input
      const validationResult = reviewSchema.safeParse({
        rating,
        review_text: reviewText,
      });

      if (!validationResult.success) {
        const errors = validationResult.error.errors.map(e => e.message).join(', ');
        throw new Error(errors);
      }

      const { rating: validRating, review_text: validReviewText } = validationResult.data;

      // Additional sanitization for review text
      const sanitizedReviewText = validReviewText ? sanitizeString(validReviewText) : null;

      const { data, error } = await supabase
        .from('reviews')
        .insert({
          user_id: user.id,
          store_id: storeId,
          rating: validRating,
          review_text: sanitizedReviewText,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
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
            maxLength={1000}
            rows={4}
          />
          <p className="text-xs text-muted-foreground mt-1">
            {reviewText.length}/1000 characters
          </p>
        </div>

        <Button 
          type="submit" 
          disabled={rating === 0 || submitReviewMutation.isPending}
          className="w-full"
        >
          {submitReviewMutation.isPending ? 'Submitting...' : 'Submit Review'}
          {!submitReviewMutation.isPending && <span className="ml-1.5 text-xs opacity-80">(+15 pts)</span>}
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
