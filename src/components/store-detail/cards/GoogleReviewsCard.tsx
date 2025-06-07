
import React from 'react';
import { Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface GooglePlacesDetails {
  rating?: number;
  user_ratings_total?: number;
}

interface GoogleReviewsCardProps {
  googlePlacesData?: GooglePlacesDetails | null;
}

export const GoogleReviewsCard: React.FC<GoogleReviewsCardProps> = ({ googlePlacesData }) => {
  if (!googlePlacesData?.rating) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Google Reviews</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star 
                key={star} 
                className={`h-4 w-4 ${
                  star <= (googlePlacesData.rating || 0)
                    ? 'text-yellow-400 fill-current' 
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="font-medium">{googlePlacesData.rating.toFixed(1)}</span>
          {googlePlacesData.user_ratings_total && (
            <span className="text-gray-500 text-sm">
              ({googlePlacesData.user_ratings_total} reviews)
            </span>
          )}
        </div>
        <p className="text-sm text-gray-600">Based on Google Reviews</p>
      </CardContent>
    </Card>
  );
};
