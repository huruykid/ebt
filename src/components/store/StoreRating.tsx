import React from 'react';
import { Star } from 'lucide-react';

interface StoreRatingProps {
  rating?: number | null;
  reviewCount?: number | null;
  showNoReviews?: boolean;
}

export const StoreRating: React.FC<StoreRatingProps> = ({ 
  rating, 
  reviewCount,
  showNoReviews = true 
}) => {
  if (!rating) {
    return showNoReviews ? (
      <span className="text-sm text-muted-foreground">No reviews yet</span>
    ) : null;
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star 
            key={star} 
            className={`h-4 w-4 ${
              star <= Math.round(rating)
                ? 'text-yellow-400 fill-current' 
                : 'text-muted-foreground/30'
            }`}
          />
        ))}
      </div>
      <span className="text-sm text-muted-foreground">
        {rating.toFixed(1)} {reviewCount ? `(${reviewCount} reviews)` : ''}
      </span>
    </div>
  );
};
