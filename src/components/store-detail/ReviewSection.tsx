
import React from 'react';
import { Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const ReviewSection: React.FC = () => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Reviews</CardTitle>
        <Button>
          <Star className="h-4 w-4 mr-2" />
          Write a Review
        </Button>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12">
          <Star className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No reviews yet</h3>
          <p className="text-gray-600 mb-4">Be the first to review this store!</p>
          <Button variant="outline">
            Leave the First Review
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
