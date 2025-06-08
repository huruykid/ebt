
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ReviewForm } from '@/components/reviews/ReviewForm';
import { ReviewList } from '@/components/reviews/ReviewList';
import { StoreRatingDisplay } from '@/components/reviews/StoreRatingDisplay';
import { Star, Plus } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type Store = Tables<'snap_stores'>;

interface ReviewSectionProps {
  store: Store;
}

export const ReviewSection: React.FC<ReviewSectionProps> = ({ store }) => {
  const [showReviewForm, setShowReviewForm] = useState(false);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Reviews
            </CardTitle>
            <StoreRatingDisplay storeId={store.id} className="mt-2" />
          </div>
          <Button 
            onClick={() => setShowReviewForm(!showReviewForm)}
            variant={showReviewForm ? "outline" : "default"}
          >
            <Plus className="h-4 w-4 mr-2" />
            {showReviewForm ? 'Cancel' : 'Write Review'}
          </Button>
        </CardHeader>
        <CardContent>
          {showReviewForm && (
            <div className="mb-6">
              <ReviewForm 
                storeId={store.id} 
                onSuccess={() => setShowReviewForm(false)}
              />
            </div>
          )}
          <ReviewList storeId={store.id} />
        </CardContent>
      </Card>
    </div>
  );
};
