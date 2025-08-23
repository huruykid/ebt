
import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star, Phone, Clock, Globe, Utensils } from 'lucide-react';
import { FavoriteButton } from './FavoriteButton';
import { ShareStore } from './ShareStore';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { useGooglePlacesBusiness } from '@/hooks/useGooglePlaces';
import { useStoreClickTracking } from '@/hooks/useStoreClickTracking';
import { useGeolocation } from '@/hooks/useGeolocation';
import type { StoreWithDistance } from '@/types/storeTypes';

interface EnhancedStoreCardProps {
  store: StoreWithDistance;
}

export const EnhancedStoreCard: React.FC<EnhancedStoreCardProps> = ({ store }) => {
  const { trackStoreClick } = useStoreClickTracking();
  const { latitude, longitude } = useGeolocation();
  
  // Lazy loading with intersection observer
  const { ref, hasIntersected } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '200px'
  });

  // Only fetch Google Places data once the card is in view
  const { data: googlePlacesData, isLoading: googlePlacesLoading } = useGooglePlacesBusiness(
    store.Store_Name || '',
    store.Store_Street_Address || '',
    store.Latitude || undefined,
    store.Longitude || undefined,
    hasIntersected && !!(store.Latitude && store.Longitude)
  );

  const handleStoreClick = () => {
    if (latitude && longitude) {
      // Track store click with string ID
      trackStoreClick(store.id, latitude, longitude);
    }
  };

  const formatAddress = () => {
    const parts = [
      store.Store_Street_Address,
      store.City,
      store.State
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

  const hasCompleteAddress = store.Store_Street_Address && store.City;
  const fullAddress = formatAddress();

  // Check if store accepts hot foods (RMP)
  const isRmpEnrolled = store.Incentive_Program?.toLowerCase().includes('rmp') || 
                       store.Incentive_Program?.toLowerCase().includes('restaurant meals program');

  return (
    <div ref={ref} className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200">
      <div className="flex">
        {/* Store Photo - Left side with Google Places integration */}
        <div className="w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0">
          {googlePlacesData?.photos && googlePlacesData.photos.length > 0 && googlePlacesData.photos[0].photo_url ? (
            <img 
              src={googlePlacesData.photos[0].photo_url}
              alt={store.Store_Name || ''}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => {
                // Fallback to default image if Google Places photo fails
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.parentElement!.innerHTML = `
                  <div class="w-full h-full bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center">
                    <div class="text-center text-gray-500">
                      <svg class="h-6 w-6 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                      </svg>
                      <span class="text-xs font-medium">${store.Store_Name}</span>
                    </div>
                  </div>
                `;
              }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <MapPin className="h-6 w-6 mx-auto mb-1" />
                <span className="text-xs font-medium">{store.Store_Name}</span>
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
              {store.Store_Name}
            </Link>
            
            {/* Google Places Rating or Placeholder */}
            <div className="flex items-center gap-2 mt-1">
              {googlePlacesData ? (
                <>
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star} 
                        className={`h-4 w-4 ${
                          star <= Math.round(googlePlacesData.rating || 0)
                            ? 'text-yellow-400 fill-current' 
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {googlePlacesData.rating} ({googlePlacesData.user_ratings_total} reviews)
                  </span>
                </>
              ) : (
                <span className="text-sm text-muted-foreground">
                  {googlePlacesLoading ? 'Loading rating...' : 'No reviews yet'}
                </span>
              )}
            </div>
          </div>

          {/* Store Type and EBT Tags */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            {store.Store_Type && (
              <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${getStoreTypeColor(store.Store_Type)}`}>
                {store.Store_Type}
              </span>
            )}
            {googlePlacesData?.types && googlePlacesData.types.length > 0 && (
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-secondary/20 text-secondary-foreground border border-secondary/20">
                {googlePlacesData.types[0].replace(/_/g, ' ')}
              </span>
            )}
            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-accent/20 text-accent-foreground border border-accent/20">
              EBT Accepted
            </span>
            {isRmpEnrolled && (
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                <Utensils className="h-3 w-3 mr-1" />
                Hot Foods
              </span>
            )}
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
              <span>{googlePlacesData?.formatted_phone_number || 'Phone coming soon'}</span>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 flex-shrink-0" />
              <span>
                {googlePlacesData?.opening_hours?.open_now !== undefined 
                  ? (googlePlacesData.opening_hours.open_now ? 'Open Now' : 'Closed')
                  : 'Hours coming soon'
                }
              </span>
            </div>

            {googlePlacesData?.website && (
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 flex-shrink-0" />
                <a 
                  href={googlePlacesData.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80"
                >
                  Visit Website
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
          {store.Incentive_Program && (
            <div className="mt-2 p-2 bg-primary/5 rounded-md border border-primary/10">
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 text-primary" />
                <span className="text-xs font-medium text-primary">
                  {store.Incentive_Program}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
