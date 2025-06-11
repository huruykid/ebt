
import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star, Phone, Clock, Globe } from 'lucide-react';
import { FavoriteButton } from './FavoriteButton';
import { ShareStore } from './ShareStore';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { useYelpBusiness } from '@/hooks/useYelp';
import { useStoreClickTracking } from '@/hooks/useStoreClickTracking';
import { useGeolocation } from '@/hooks/useGeolocation';
import type { Tables } from '@/integrations/supabase/types';

type Store = Tables<'snap_stores'>;

interface EnhancedStoreCardProps {
  store: Store & { distance?: number };
}

export const EnhancedStoreCard: React.FC<EnhancedStoreCardProps> = ({ store }) => {
  const { trackStoreClick } = useStoreClickTracking();
  const { latitude, longitude } = useGeolocation();
  
  // Lazy loading with intersection observer
  const { ref, hasIntersected } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '200px'
  });

  // Only fetch Yelp data once the card is in view
  const { data: yelpData, isLoading: yelpLoading } = useYelpBusiness(
    store.store_name,
    store.latitude || 0,
    store.longitude || 0,
    hasIntersected && !!(store.latitude && store.longitude)
  );

  const handleStoreClick = () => {
    if (latitude && longitude) {
      trackStoreClick(store.id, latitude, longitude);
    }
  };

  const formatAddress = () => {
    const parts = [
      store.store_street_address,
      store.city,
      store.state
    ].filter(Boolean);
    
    return parts.join(', ');
  };

  const getStoreTypeColor = (type: string | null) => {
    switch (type?.toLowerCase()) {
      case 'supermarket':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'convenience store':
        return 'bg-info/10 text-info border-info/20';
      case 'grocery store':
        return 'bg-success/10 text-success border-success/20';
      default:
        return 'bg-muted/50 text-muted-foreground border-muted/30';
    }
  };

  const hasCompleteAddress = store.store_street_address && store.city;
  const fullAddress = formatAddress();

  return (
    <div ref={ref} className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200">
      <div className="flex">
        {/* Store Photo - Left side with Yelp integration */}
        <div className="w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0">
          {yelpData?.image_url ? (
            <img 
              src={yelpData.image_url}
              alt={store.store_name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <MapPin className="h-6 w-6 mx-auto mb-1" />
                <span className="text-xs font-medium">{store.store_name}</span>
              </div>
            </div>
          )}
        </div>

        {/* Content - Right side */}
        <div className="flex-1 p-4 min-w-0">
          {/* Store Title and Rating */}
          <div className="mb-2">
            <Link 
              to={`/store/${store.id}`}
              onClick={handleStoreClick}
              className="text-lg font-semibold text-foreground hover:text-primary transition-colors block truncate"
            >
              {store.store_name}
            </Link>
            
            {/* Yelp Rating or Placeholder */}
            <div className="flex items-center gap-2 mt-1">
              {yelpData ? (
                <>
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star} 
                        className={`h-4 w-4 ${
                          star <= yelpData.rating
                            ? 'text-yellow-400 fill-current' 
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {yelpData.rating} ({yelpData.review_count} reviews)
                  </span>
                </>
              ) : (
                <span className="text-sm text-muted-foreground">
                  {yelpLoading ? 'Loading rating...' : 'No reviews yet'}
                </span>
              )}
            </div>
          </div>

          {/* Store Type and EBT Tags */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            {store.store_type && (
              <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${getStoreTypeColor(store.store_type)}`}>
                {store.store_type}
              </span>
            )}
            {yelpData?.categories && yelpData.categories.length > 0 && (
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-secondary/20 text-secondary-foreground border border-secondary/20">
                {yelpData.categories[0].title}
              </span>
            )}
            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-accent/20 text-accent-foreground border border-accent/20">
              EBT Accepted
            </span>
          </div>

          {/* Contact Information */}
          <div className="space-y-1 text-sm text-muted-foreground">
            {fullAddress && (
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span className="truncate">{fullAddress}</span>
                {store.distance !== undefined && (
                  <span className="text-xs whitespace-nowrap">• {store.distance.toFixed(1)} mi</span>
                )}
              </div>
            )}

            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 flex-shrink-0" />
              <span>{yelpData?.display_phone || 'Phone coming soon'}</span>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 flex-shrink-0" />
              <span>
                {yelpData?.hours?.[0]?.is_open_now !== undefined 
                  ? (yelpData.hours[0].is_open_now ? 'Open Now' : 'Closed')
                  : 'Hours coming soon'
                }
              </span>
            </div>

            {yelpData?.url && (
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 flex-shrink-0" />
                <a 
                  href={yelpData.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80"
                >
                  View on Yelp
                </a>
              </div>
            )}
          </div>

          {/* Favorites and Share */}
          <div className="flex items-center gap-2 mt-3 pt-2 border-t border-border">
            <FavoriteButton storeId={store.id} variant="icon" />
            <ShareStore store={store} variant="icon" />
          </div>

          {/* Special Programs */}
          {store.incentive_program && (
            <div className="mt-2 p-2 bg-primary/5 rounded-md border border-primary/10">
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 text-primary" />
                <span className="text-xs font-medium text-primary">
                  {store.incentive_program}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
