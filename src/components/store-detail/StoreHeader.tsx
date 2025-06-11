import React from 'react';
import { Star, MapPin, Phone, Clock, Tag, Globe, Utensils } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useYelpBusiness } from '@/hooks/useYelp';
import type { Tables } from '@/integrations/supabase/types';

type Store = Tables<'snap_stores'>;

interface GooglePlacesDetails {
  formatted_phone_number?: string;
  opening_hours?: {
    open_now: boolean;
  };
  rating?: number;
  user_ratings_total?: number;
  website?: string;
}

interface StoreHeaderProps {
  store: Store;
  googlePlacesData?: GooglePlacesDetails | null;
}

export const StoreHeader: React.FC<StoreHeaderProps> = ({ store, googlePlacesData }) => {
  // Fetch Yelp data for this store
  const { data: yelpData, isLoading: yelpLoading, error: yelpError } = useYelpBusiness(
    store.store_name,
    store.latitude || 0,
    store.longitude || 0,
    !!(store.latitude && store.longitude)
  );

  // Add debugging logs
  console.log('🏪 Store data:', { 
    name: store.store_name, 
    lat: store.latitude, 
    lng: store.longitude 
  });
  console.log('📊 Yelp data state:', { 
    data: yelpData, 
    loading: yelpLoading, 
    error: yelpError 
  });

  const formatAddress = () => {
    const parts = [
      store.store_street_address,
      store.additional_address,
      store.city,
      store.state,
      store.zip_code
    ].filter(Boolean);
    
    return parts.join(', ');
  };

  const getStoreTypeColor = (type: string | null) => {
    switch (type?.toLowerCase()) {
      case 'supermarket':
        return 'bg-primary/10 text-primary';
      case 'convenience store':
        return 'bg-secondary text-secondary-foreground';
      case 'grocery store':
        return 'bg-accent/10 text-accent-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  // Prefer Yelp data over Google Places data
  const rating = yelpData?.rating || googlePlacesData?.rating;
  const reviewCount = yelpData?.review_count || googlePlacesData?.user_ratings_total || 0;
  const phone = yelpData?.display_phone || googlePlacesData?.formatted_phone_number;
  const website = yelpData?.url || googlePlacesData?.website;
  const isOpen = yelpData?.hours?.[0]?.is_open_now ?? googlePlacesData?.opening_hours?.open_now;
  
  // Check if store is enrolled in RMP (Restaurant Meals Program)
  const isRmpEnrolled = store.incentive_program?.toLowerCase().includes('rmp') || 
                       store.incentive_program?.toLowerCase().includes('restaurant meals program');

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        {/* Debug info - show loading state */}
        {yelpLoading && (
          <div className="mb-2 p-2 bg-blue-50 text-blue-700 text-sm rounded">
            🔄 Loading Yelp data...
          </div>
        )}
        
        {yelpError && (
          <div className="mb-2 p-2 bg-red-50 text-red-700 text-sm rounded">
            ❌ Error loading Yelp data: {yelpError.message}
          </div>
        )}

        {yelpData && (
          <div className="mb-2 p-2 bg-green-50 text-green-700 text-sm rounded">
            ✅ Yelp data loaded: {yelpData.name} (Rating: {yelpData.rating})
          </div>
        )}

        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-foreground mb-2">{store.store_name}</h1>
            <div className="flex flex-col gap-1 mb-3">
              {/* Yelp/Google rating */}
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star} 
                    className={`h-5 w-5 ${
                      rating && star <= rating
                        ? 'text-yellow-400 fill-current' 
                        : 'text-gray-300 stroke-gray-400 stroke-2'
                    }`}
                  />
                ))}
                {rating && (
                  <span className="ml-2 text-muted-foreground text-xs">
                    {rating.toFixed(1)} ({reviewCount} reviews)
                    {yelpData && <span className="text-primary ml-1">• Yelp</span>}
                  </span>
                )}
              </div>
              {!rating && (
                <span className="text-muted-foreground text-xs">
                  {yelpLoading ? 'Loading reviews...' : 'No reviews yet'}
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {store.store_type && (
                <span className={`inline-block px-3 py-1 rounded-spotify text-sm font-medium ${getStoreTypeColor(store.store_type)}`}>
                  {store.store_type}
                </span>
              )}
              {yelpData?.categories && yelpData.categories.length > 0 && (
                <span className="inline-block px-3 py-1 rounded-spotify text-sm font-medium bg-secondary/20 text-secondary-foreground">
                  {yelpData.categories[0].title}
                </span>
              )}
              {store.incentive_program && (
                <span className="inline-block px-3 py-1 rounded-spotify text-sm font-medium bg-primary/10 text-primary">
                  <Star className="h-3 w-3 inline mr-1" />
                  {store.incentive_program}
                </span>
              )}
              <span className="inline-block px-3 py-1 rounded-spotify text-sm font-medium bg-accent text-accent-foreground">
                <Tag className="h-3 w-3 inline mr-1" />
                EBT Accepted
              </span>
              {isRmpEnrolled && (
                <span className="inline-block px-3 py-1 rounded-spotify text-sm font-medium bg-secondary text-secondary-foreground">
                  <Utensils className="h-3 w-3 inline mr-1" />
                  Hot Foods Accepted
                </span>
              )}
              {isOpen !== undefined && (
                <span className={`inline-block px-3 py-1 rounded-spotify text-sm font-medium ${
                  isOpen 
                    ? 'bg-primary/10 text-primary' 
                    : 'bg-destructive/10 text-destructive'
                }`}>
                  {isOpen ? 'Open Now' : 'Closed'}
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-2 items-end">
            <Button variant="outline" size="sm">
              Claim this Business
            </Button>
            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
              Report a Problem
            </Button>
          </div>
        </div>

        {/* Quick Info - Enhanced with Yelp data */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4 border-t border-border">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4 flex-shrink-0" />
            <span className="body-sm">{formatAddress() || 'Address not available'}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone className="h-4 w-4 flex-shrink-0" />
            <span className="body-sm">
              {phone || (yelpLoading ? 'Loading phone...' : 'Phone coming soon')}
            </span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            {website ? (
              <>
                <Globe className="h-4 w-4 flex-shrink-0" />
                <a 
                  href={website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="body-sm text-primary hover:text-primary/80"
                >
                  {yelpData ? 'View on Yelp' : 'Visit Website'}
                </a>
              </>
            ) : (
              <>
                <Clock className="h-4 w-4 flex-shrink-0" />
                <span className="body-sm">
                  {isOpen !== undefined 
                    ? (isOpen ? 'Open Now' : 'Closed') 
                    : (yelpLoading ? 'Loading hours...' : 'Hours coming soon')
                  }
                </span>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
