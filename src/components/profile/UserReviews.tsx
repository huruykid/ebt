
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StarRating } from '@/components/reviews/StarRating';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { MessageSquare, Store, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface UserReview {
  id: string;
  rating: number;
  review_text: string | null;
  created_at: string;
  store_id: number;
  snap_stores: {
    store_name: string;
    city: string;
    state: string;
  } | null;
}

export const UserReviews: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: reviews, isLoading } = useQuery({
    queryKey: ['user-reviews', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          id,
          rating,
          review_text,
          created_at,
          store_id,
          snap_stores (
            store_name,
            city,
            state
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as UserReview[];
    },
    enabled: !!user,
  });

  const deleteReviewMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId)
        .eq('user_id', user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['store-review-stats'] });
      toast({
        title: "Review deleted",
        description: "Your review has been successfully deleted."
      });
    },
    onError: () => {
      toast({
        title: "Error deleting review",
        description: "Please try again later.",
        variant: "destructive"
      });
    }
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 flex justify-center">
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            My Reviews
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-12">
          <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
          <p className="text-gray-600 mb-4">
            You haven't written any reviews yet. Visit stores and share your experience!
          </p>
          <Button onClick={() => navigate('/search')}>
            Find Stores to Review
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          My Reviews ({reviews.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id} className="border-l-4 border-l-green-500">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <StarRating rating={review.rating} readonly size="sm" />
                      <span className="text-sm text-gray-500">
                        {format(new Date(review.created_at), 'MMM d, yyyy')}
                      </span>
                    </div>
                    
                    {review.snap_stores && (
                      <button
                        onClick={() => navigate(`/store/${review.store_id}`)}
                        className="flex items-center gap-2 text-green-600 hover:text-green-700 mb-2"
                      >
                        <Store className="h-4 w-4" />
                        <span className="font-medium">{review.snap_stores.store_name}</span>
                        <span className="text-gray-500">
                          • {review.snap_stores.city}, {review.snap_stores.state}
                        </span>
                      </button>
                    )}
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteReviewMutation.mutate(review.id)}
                    disabled={deleteReviewMutation.isPending}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
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
      </CardContent>
    </Card>
  );
};
