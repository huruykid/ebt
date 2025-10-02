
import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star, Phone, Clock, Globe, Utensils, ExternalLink } from 'lucide-react';
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
        {/* Store Photo - Left side with Google Places integration and multiple photos */}
        <div className="w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0">
          {(() => {
            // Priority: stored photos > Google Places API photos > fallback
            const storedPhotos = store.google_photos as Array<{photo_url?: string}> | null;
            const apiPhotos = googlePlacesData?.photos;
            
            if (storedPhotos && storedPhotos.length > 0 && storedPhotos[0].photo_url) {
              return (
                <img 
                  src={storedPhotos[0].photo_url}
                  alt={store.Store_Name || ''}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    const parent = target.parentElement;
                    if (parent) {
                      target.style.display = 'none';
                      // Safely create fallback without innerHTML
                      const fallbackDiv = document.createElement('div');
                      fallbackDiv.className = 'w-full h-full bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center';
                      const centerDiv = document.createElement('div');
                      centerDiv.className = 'text-center text-gray-500';
                      const mapPin = document.createElement('span');
                      mapPin.innerHTML = '<svg class="h-6 w-6 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>';
                      const nameSpan = document.createElement('span');
                      nameSpan.className = 'text-xs font-medium';
                      nameSpan.textContent = store.Store_Name || '';
                      centerDiv.appendChild(mapPin);
                      centerDiv.appendChild(nameSpan);
                      fallbackDiv.appendChild(centerDiv);
                      parent.appendChild(fallbackDiv);
                    }
                  }}
                />
              );
            } else if (apiPhotos && apiPhotos.length > 0 && apiPhotos[0].photo_url) {
              return (
                <img 
                  src={apiPhotos[0].photo_url}
                  alt={store.Store_Name || ''}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    const parent = target.parentElement;
                    if (parent) {
                      target.style.display = 'none';
                      // Safely create fallback without innerHTML
                      const fallbackDiv = document.createElement('div');
                      fallbackDiv.className = 'w-full h-full bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center';
                      const centerDiv = document.createElement('div');
                      centerDiv.className = 'text-center text-gray-500';
                      const mapPin = document.createElement('span');
                      mapPin.innerHTML = '<svg class="h-6 w-6 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>';
                      const nameSpan = document.createElement('span');
                      nameSpan.className = 'text-xs font-medium';
                      nameSpan.textContent = store.Store_Name || '';
                      centerDiv.appendChild(mapPin);
                      centerDiv.appendChild(nameSpan);
                      fallbackDiv.appendChild(centerDiv);
                      parent.appendChild(fallbackDiv);
                    }
                  }}
                />
              );
            } else {
              return (
                <div className="w-full h-full bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <MapPin className="h-6 w-6 mx-auto mb-1" />
                    <span className="text-xs font-medium">{store.Store_Name}</span>
                  </div>
                </div>
              );
            }
          })()}
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
            
            {/* Google Places Rating with stored data priority */}
            <div className="flex items-center gap-2 mt-1">
              {(() => {
                const rating = store.google_rating || googlePlacesData?.rating;
                const ratingsTotal = store.google_user_ratings_total || googlePlacesData?.user_ratings_total;
                
                if (rating) {
                  return (
                    <>
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star} 
                            className={`h-4 w-4 ${
                              star <= Math.round(rating)
                                ? 'text-yellow-400 fill-current' 
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {rating.toFixed(1)} ({ratingsTotal} reviews)
                      </span>
                    </>
                  );
                } else {
                  return (
                    <span className="text-sm text-muted-foreground">
                      {googlePlacesLoading ? 'Loading rating...' : 'No reviews yet'}
                    </span>
                  );
                }
              })()}
            </div>
          </div>

          {/* Store Type and EBT Tags */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            {store.Store_Type && (
              <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${getStoreTypeColor(store.Store_Type)}`}>
                {store.Store_Type}
              </span>
            )}
            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-accent/20 text-accent-foreground border border-accent/20">
              EBT Accepted
            </span>
          </div>

          {/* Incentive Programs - Prominent Display */}
          {store.Incentive_Program && (
            <div className="mb-3 p-3 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950 dark:to-yellow-950 rounded-lg border-2 border-amber-300 dark:border-amber-700">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-amber-600 dark:text-amber-400 fill-amber-600 dark:fill-amber-400" />
                <span className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                  {store.Incentive_Program}
                </span>
              </div>
              {isRmpEnrolled && (
                <a 
                  href="https://www.fns.usda.gov/snap/retailer/restaurant-meals-program"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-2 text-xs text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100 font-medium"
                >
                  <Utensils className="h-3 w-3" />
                  Hot prepared meals available
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          )}

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
              <span>{store.google_formatted_phone_number || googlePlacesData?.formatted_phone_number || 'Phone coming soon'}</span>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 flex-shrink-0" />
              <span>
                {(() => {
                  const openingHours = store.google_opening_hours as { open_now?: boolean } | null;
                  if (openingHours?.open_now !== undefined) {
                    return openingHours.open_now ? 'Open Now' : 'Closed';
                  }
                  if (googlePlacesData?.opening_hours?.open_now !== undefined) {
                    return googlePlacesData.opening_hours.open_now ? 'Open Now' : 'Closed';
                  }
                  return 'Hours coming soon';
                })()}
              </span>
            </div>

            {(store.google_website || googlePlacesData?.website) && (
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 flex-shrink-0" />
                <a 
                  href={store.google_website || googlePlacesData?.website}
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
        </div>
      </div>
    </div>
  );
};
