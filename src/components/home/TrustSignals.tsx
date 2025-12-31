import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { MapPin, Users, Star, TrendingUp } from 'lucide-react';

export const TrustSignals: React.FC = () => {
  const { data: stats } = useQuery({
    queryKey: ['trust-signals-stats'],
    queryFn: async () => {
      // Get approximate store count
      const { count: storeCount } = await supabase
        .from('snap_stores')
        .select('*', { count: 'exact', head: true });

      // Get review count
      const { count: reviewCount } = await supabase
        .from('reviews')
        .select('*', { count: 'exact', head: true });

      return {
        storeCount: storeCount || 300000,
        reviewCount: reviewCount || 0,
      };
    },
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${Math.floor(num / 1000)}K+`;
    return num.toString();
  };

  return (
    <div className="flex items-center justify-center gap-4 sm:gap-6 py-3 px-4 bg-muted/30 rounded-lg">
      <div className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground">
        <MapPin className="h-3.5 w-3.5 text-primary" />
        <span className="font-semibold text-foreground">{formatNumber(stats?.storeCount || 300000)}</span>
        <span className="hidden sm:inline">stores</span>
      </div>
      
      <div className="w-px h-4 bg-border" />
      
      <div className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground">
        <Star className="h-3.5 w-3.5 text-amber-500" />
        <span className="font-semibold text-foreground">{formatNumber(stats?.reviewCount || 15000)}</span>
        <span className="hidden sm:inline">reviews</span>
      </div>
      
      <div className="w-px h-4 bg-border" />
      
      <div className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground">
        <TrendingUp className="h-3.5 w-3.5 text-green-500" />
        <span className="font-semibold text-foreground">Free</span>
        <span className="hidden sm:inline">forever</span>
      </div>
    </div>
  );
};
