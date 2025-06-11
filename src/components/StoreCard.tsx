
import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star, Phone, Clock, Globe, ExternalLink } from 'lucide-react';
import { StorePhoto } from './StorePhoto';
import { FavoriteButton } from './FavoriteButton';
import { ShareStore } from './ShareStore';
import { StoreRatingDisplay } from './reviews/StoreRatingDisplay';
import { useStoreClickTracking } from '@/hooks/useStoreClickTracking';
import { useGeolocation } from '@/hooks/useGeolocation';
import type { Tables } from '@/integrations/supabase/types';

type Store = Tables<'snap_stores'>;

interface StoreCardProps {
  store: Store & { distance?: number };
}

export const StoreCard: React.FC<StoreCardProps> = ({ store }) => {
  const { trackStoreClick } = useStoreClickTracking();
  const { latitude, longitude } = useGeolocation();

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
    <div className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200">
      {/* Yelp-style horizontal layout */}
      <div className="flex">
        {/* Store Photo - Left side */}
        <div className="w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0">
          <StorePhoto 
            storeName={store.store_name}
            address={fullAddress}
            className="w-full h-full object-cover"
          />
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
            
            {/* Rating and Review Count */}
            <div className="flex items-center gap-2 mt-1">
              <StoreRatingDisplay storeId={store.id} showText={false} />
              <span className="text-sm text-muted-foreground">No reviews yet</span>
            </div>
          </div>

          {/* Store Type and EBT Tags */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            {store.store_type && (
              <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${getStoreTypeColor(store.store_type)}`}>
                {store.store_type}
              </span>
            )}
            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-accent/20 text-accent-foreground border border-accent/20">
              EBT Accepted
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mb-3">
            <Link
              to={`/store/${store.id}`}
              onClick={handleStoreClick}
              className="text-xs text-primary hover:text-primary/80 font-medium"
            >
              Claim this Business
            </Link>
            <span className="text-xs text-muted-foreground">•</span>
            <button className="text-xs text-destructive hover:text-destructive/80 font-medium">
              Report a Problem
            </button>
          </div>

          {/* Separator */}
          <div className="border-t border-border mb-3"></div>

          {/* Contact Information - Yelp style */}
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
              <span>Phone coming soon</span>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 flex-shrink-0" />
              <span>Hours coming soon</span>
            </div>

            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 flex-shrink-0" />
              <span>Website coming soon</span>
            </div>
          </div>

          {/* Favorites and Share - Bottom row */}
          <div className="flex items-center gap-2 mt-3 pt-2 border-t border-border">
            <FavoriteButton storeId={store.id} variant="minimal" />
            <ShareStore store={store} variant="minimal" />
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
