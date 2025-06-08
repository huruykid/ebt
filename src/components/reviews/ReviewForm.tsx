
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { StarRating } from './StarRating';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface ReviewFormProps {
  storeId: number;
  onSuccess?: () => void;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({ storeId, onSuccess }) => {
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createReviewMutation = useMutation({
    mutationFn: async (reviewData: { rating: number; review_text?: string }) => {
      if (!user) throw new Error('User must be authenticated');
      
      const { data, error } = await supabase
        .from('reviews')
        .insert({
          user_id: user.id,
          store_id: storeId,
          rating: reviewData.rating,
          review_text: reviewData.review_text || null
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', storeId] });
      queryClient.invalidateQueries({ queryKey: ['store-review-stats', storeId] });
      setRating(0);
      setReviewText('');
      toast({
        title: "Review submitted!",
        description: "Thank you for your feedback."
      });
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: "Error submitting review",
        description: error.message || "Please try again later.",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast({
        title: "Please select a rating",
        description: "You must select at least 1 star to submit a review.",
        variant: "destructive"
      });
      return;
    }

    createReviewMutation.mutate({
      rating,
      review_text: reviewText.trim() || undefined
    });
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-600">Please sign in to leave a review.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Write a Review</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rating *
            </label>
            <StarRating rating={rating} onRatingChange={setRating} size="lg" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Review (Optional)
            </label>
            <Textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Share your experience at this store..."
              rows={4}
              maxLength={1000}
            />
            <div className="text-xs text-gray-500 mt-1">
              {reviewText.length}/1000 characters
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={rating === 0 || createReviewMutation.isPending}
            className="w-full"
          >
            {createReviewMutation.isPending ? 'Submitting...' : 'Submit Review'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
