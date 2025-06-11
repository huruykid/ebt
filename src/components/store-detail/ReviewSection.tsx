
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ReviewForm } from '@/components/reviews/ReviewForm';
import { ReviewList } from '@/components/reviews/ReviewList';
import { StoreRatingDisplay } from '@/components/reviews/StoreRatingDisplay';
import { Star, Edit, MessageSquare } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type Store = Tables<'snap_stores'>;

interface ReviewSectionProps {
  store: Store;
}

export const ReviewSection: React.FC<ReviewSectionProps> = ({ store }) => {
  const [showReviewForm, setShowReviewForm] = useState(false);

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="p-4 sm:p-6 pb-4">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <MessageSquare className="h-5 w-5 text-primary" />
              Community Reviews
            </CardTitle>
            <Button 
              onClick={() => setShowReviewForm(!showReviewForm)}
              variant={showReviewForm ? "outline" : "default"}
              size="sm"
              className="flex-shrink-0"
            >
              <Edit className="h-4 w-4 mr-2" />
              {showReviewForm ? 'Cancel' : 'Write Review'}
            </Button>
          </div>
          
          {/* Rating Overview */}
          <div className="bg-muted/30 rounded-lg p-4">
            <StoreRatingDisplay storeId={store.id} />
            <p className="text-sm text-muted-foreground mt-2">
              Share your experience to help the community
            </p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 sm:p-6 pt-0">
        {showReviewForm && (
          <div className="mb-6 p-4 bg-background border border-border rounded-lg shadow-sm animate-fade-in">
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
