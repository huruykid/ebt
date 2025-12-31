import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { MapPin, Star, ArrowRight } from 'lucide-react';
import { StoreTypeBadge } from '@/components/store';
import { Skeleton } from '@/components/ui/skeleton';

// Popular cities with coordinates for fetching sample stores
const POPULAR_CITIES = [
  { name: 'Los Angeles', state: 'CA', lat: 34.0522, lng: -118.2437 },
  { name: 'New York', state: 'NY', lat: 40.7128, lng: -74.0060 },
  { name: 'Chicago', state: 'IL', lat: 41.8781, lng: -87.6298 },
  { name: 'Houston', state: 'TX', lat: 29.7604, lng: -95.3698 },
  { name: 'Phoenix', state: 'AZ', lat: 33.4484, lng: -112.0740 },
];

export const FeaturedStores: React.FC = () => {
  const { data: featuredStores, isLoading } = useQuery({
    queryKey: ['featured-stores'],
    queryFn: async () => {
      // Fetch a sample of stores from different popular cities
      const { data, error } = await supabase
        .from('snap_stores')
        .select('id, Store_Name, City, State, Store_Type, google_rating, google_user_ratings_total')
        .not('google_rating', 'is', null)
        .gte('google_rating', 4)
        .order('google_user_ratings_total', { ascending: false })
        .limit(6);

      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 30, // Cache for 30 minutes
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Popular EBT Stores</h3>
        <div className="grid gap-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!featuredStores?.length) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Popular EBT Stores</h3>
        <Link 
          to="/search" 
          className="text-xs text-primary hover:underline flex items-center gap-1"
        >
          View all <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      
      <div className="grid gap-2">
        {featuredStores.slice(0, 4).map((store) => (
          <Link
            key={store.id}
            to={`/store/${store.id}`}
            className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg hover:border-primary/50 hover:shadow-sm transition-all"
          >
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground text-sm truncate">
                {store.Store_Name}
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{store.City}, {store.State}</span>
                {store.google_rating && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-0.5">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      {store.google_rating.toFixed(1)}
                    </span>
                  </>
                )}
              </div>
            </div>
            
            <StoreTypeBadge storeType={store.Store_Type} className="hidden sm:flex" />
          </Link>
        ))}
      </div>
    </div>
  );
};
