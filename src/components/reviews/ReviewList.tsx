
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { StarRating } from './StarRating';
import { Card, CardContent } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { formatDistanceToNow } from 'date-fns';

interface Review {
  id: string;
  rating: number;
  review_text: string | null;
  created_at: string;
}

interface ReviewListProps {
  storeId: number;
}

export const ReviewList: React.FC<ReviewListProps> = ({ storeId }) => {
  const { data: reviews, isLoading, error } = useQuery({
    queryKey: ['reviews', storeId],
    queryFn: async () => {
      // Use public_reviews view for privacy (excludes user_id)
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('public_reviews')
        .select('*')
        .eq('store_id', storeId)
        .order('created_at', { ascending: false });

      if (reviewsError) throw reviewsError;
      
      return reviewsData || [];
    }
  });

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <p className="text-red-600">Error loading reviews. Please try again later.</p>
      </div>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-2">No reviews yet</p>
        <p className="text-gray-500 text-sm">Be the first to review this store!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <Card key={review.id}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <StarRating rating={review.rating} readonly size="sm" />
                  <span className="text-sm font-medium">Anonymous User</span>
                </div>
                <p className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                </p>
              </div>
            </div>
            
            {review.review_text && (
              <p className="text-gray-700 text-sm leading-relaxed">
                {review.review_text}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
