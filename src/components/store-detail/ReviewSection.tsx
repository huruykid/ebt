
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ReviewForm } from '@/components/reviews/ReviewForm';
import { ReviewList } from '@/components/reviews/ReviewList';
import { StoreRatingDisplay } from '@/components/reviews/StoreRatingDisplay';
import { Star, Edit } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type Store = Tables<'snap_stores'>;

interface ReviewSectionProps {
  store: Store;
}

export const ReviewSection: React.FC<ReviewSectionProps> = ({ store }) => {
  const [showReviewForm, setShowReviewForm] = useState(false);

  return (
    <Card className="w-full">
      <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="space-y-2 sm:space-y-3">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Star className="h-4 w-4 sm:h-5 sm:w-5" />
              Reviews
            </CardTitle>
            <StoreRatingDisplay storeId={store.id} />
          </div>
          <Button 
            onClick={() => setShowReviewForm(!showReviewForm)}
            variant={showReviewForm ? "outline" : "default"}
            className="flex-shrink-0 w-full sm:w-auto"
            size="sm"
          >
            <Edit className="h-4 w-4 mr-2" />
            {showReviewForm ? 'Cancel' : 'Write Review'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0">
        {showReviewForm && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-muted/30 rounded-lg border">
            <ReviewForm 
              storeId={store.id} 
              onSuccess={() => setShowReviewForm(false)}
            />
          </div>
        )}
        <ReviewList storeId={store.id} />
      </CardContent>
    </Card>
  );
};
