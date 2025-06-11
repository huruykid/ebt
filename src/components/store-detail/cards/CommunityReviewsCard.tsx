
import React from 'react';
import { Star, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const CommunityReviewsCard: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Community Reviews
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-6">
          <div className="flex items-center justify-center mb-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star 
                key={star} 
                className="h-6 w-6 text-gray-300"
              />
            ))}
          </div>
          <p className="text-muted-foreground mb-2">No community reviews yet</p>
          <p className="text-sm text-muted-foreground">
            Community reviews and ratings will appear here
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
