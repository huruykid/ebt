import React from 'react';
import { Star, ExternalLink, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import type { Tables } from '@/integrations/supabase/types';

type Store = Tables<'snap_stores'>;

interface GoogleReview {
  author_name: string;
  author_url?: string;
  language: string;
  profile_photo_url?: string;
  rating: number;
  relative_time_description: string;
  text: string;
  time: number;
}

interface GoogleReviewsSectionProps {
  store: Store;
}

export const GoogleReviewsSection: React.FC<GoogleReviewsSectionProps> = ({ store }) => {
  const googleReviews = (store.google_reviews as unknown as GoogleReview[]) || null;
  const googleRating = store.google_rating as number | null;
  const googleRatingsTotal = store.google_user_ratings_total;

  if (!googleReviews || googleReviews.length === 0) {
    return null;
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const getPriceLevel = () => {
    const priceLevel = store.google_price_level;
    if (!priceLevel) return null;
    
    return (
      <div className="flex items-center gap-1">
        <span className="text-sm text-muted-foreground">Price:</span>
        <span className="text-sm font-medium">
          {'$'.repeat(priceLevel)}
          <span className="text-gray-300">{'$'.repeat(4 - priceLevel)}</span>
        </span>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Google Reviews</CardTitle>
          <div className="flex items-center gap-3">
            {getPriceLevel()}
            {googleRating && (
              <div className="flex items-center gap-2">
                {renderStars(Math.round(googleRating))}
                <span className="text-sm font-medium">{googleRating.toFixed(1)}</span>
                <span className="text-xs text-muted-foreground">
                  ({googleRatingsTotal} reviews)
                </span>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {googleReviews.slice(0, 5).map((review, index) => (
          <div key={index} className="border-b border-border last:border-b-0 pb-4 last:pb-0">
            <div className="flex items-start gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={review.profile_photo_url} alt={review.author_name} />
                <AvatarFallback>
                  <User className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{review.author_name}</span>
                    {review.author_url && (
                      <a
                        href={review.author_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-primary"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {review.relative_time_description}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  {renderStars(review.rating)}
                  <span className="text-sm font-medium">{review.rating}</span>
                </div>
                
                {review.text && (
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {review.text}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {googleReviews.length > 5 && (
          <div className="text-center pt-2">
            <span className="text-sm text-muted-foreground">
              Showing 5 of {googleReviews.length} reviews
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};