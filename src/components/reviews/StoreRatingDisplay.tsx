
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { StarRating } from './StarRating';

interface StoreRatingDisplayProps {
  storeId: number;
  className?: string;
}

export const StoreRatingDisplay: React.FC<StoreRatingDisplayProps> = ({ 
  storeId, 
  className = ""
}) => {
  const { data: stats } = useQuery({
    queryKey: ['store-review-stats', storeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('store_review_stats')
        .select('*')
        .eq('store_id', storeId)
        .maybeSingle();

      if (error) throw error;
      return data;
    }
  });

  if (!stats || stats.review_count === 0) {
    return (
      <div className={`flex items-center gap-2 text-gray-500 ${className}`}>
        <StarRating rating={0} readonly size="sm" />
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <StarRating rating={stats.average_rating} readonly size="sm" />
      <span className="text-sm font-medium">{stats.average_rating}</span>
      <span className="text-sm text-gray-500">
        ({stats.review_count} {stats.review_count === 1 ? 'review' : 'reviews'})
      </span>
    </div>
  );
};
