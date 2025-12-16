
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ReviewList } from '@/components/reviews/ReviewList';
import { ReviewForm } from '@/components/reviews/ReviewForm';
import { StoreRatingDisplay } from '@/components/reviews/StoreRatingDisplay';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type Store = Tables<'snap_stores'>;

interface ReviewSectionProps {
  store: Store;
}

export const ReviewSection: React.FC<ReviewSectionProps> = ({ store }) => {
  const { user } = useAuth();
  const [showReviewForm, setShowReviewForm] = useState(false);

  // Track review count for refresh - use public view for privacy
  const { refetch } = useQuery({
    queryKey: ['store-reviews', store.id],
    queryFn: async () => {
      // Use public_reviews view which excludes user_id for privacy
      const { data, error } = await supabase
        .from('public_reviews')
        .select('id')
        .eq('store_id', parseInt(store.id));

      if (error) {
        console.error('Error fetching reviews:', error);
        throw error;
      }

      return data || [];
    },
  });

  const handleReviewSuccess = () => {
    refetch();
    setShowReviewForm(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Community Reviews</CardTitle>
            <StoreRatingDisplay storeId={parseInt(store.id)} />
          </div>
        </CardHeader>
        <CardContent>
          {showReviewForm ? (
            <ReviewForm 
              storeId={parseInt(store.id)}
              onSuccess={handleReviewSuccess}
            />
          ) : (
            <>
              {user ? (
                <Button 
                  onClick={() => setShowReviewForm(true)}
                  className="w-full mb-6"
                >
                  <Star className="h-4 w-4 mr-2" />
                  Write a Review
                </Button>
              ) : (
                <div className="text-center py-4 mb-6 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-3">
                    Sign in to write a review and help the community
                  </p>
                  <Button variant="outline" asChild>
                    <Link to="/auth">Sign In</Link>
                  </Button>
                </div>
              )}

              <ReviewList storeId={parseInt(store.id)} />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
