
import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Store, Star, ExternalLink } from 'lucide-react';
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

  const getStoreTypeIcon = (type: string | null) => {
    const lowerType = type?.toLowerCase() || '';
    
    if (lowerType.includes('supermarket') || lowerType.includes('grocery') || lowerType.includes('supercenter')) {
      return '🏪';
    }
    if (lowerType.includes('restaurant') || lowerType.includes('fast food')) {
      return '🍔';
    }
    if (lowerType.includes('cafeteria')) {
      return '🍽️';
    }
    if (lowerType.includes('bakery')) {
      return '🥖';
    }
    if (lowerType.includes('convenience') || lowerType.includes('corner')) {
      return '🏬';
    }
    if (lowerType.includes('dollar') || lowerType.includes('discount')) {
      return '💵';
    }
    
    return '🏪'; // Default icon
  };

  const hasCompleteAddress = store.store_street_address && store.city;
  const fullAddress = formatAddress();

  return (
    <div className="bg-card rounded-spotify-lg border border-border hover:shadow-lg transition-shadow overflow-hidden">
      {/* Store Photo */}
      <StorePhoto 
        storeName={store.store_name}
        address={fullAddress}
        className="w-full h-32 object-cover"
      />

      {/* Card Content */}
      <div className="p-6 relative">
        {/* Action buttons - positioned independently */}
        <div className="absolute top-4 right-4 flex gap-2">
          <ShareStore store={store} variant="icon" />
          <FavoriteButton storeId={store.id} variant="icon" />
        </div>

        <div className="flex items-start justify-between mb-3 pr-20">
          <div className="flex-1">
            <Link 
              to={`/store/${store.id}`}
              onClick={handleStoreClick}
              className="heading-sm text-foreground mb-1 hover:text-primary transition-colors block"
            >
              {store.store_name}
            </Link>
            <div className="flex items-center gap-2 flex-wrap mb-2">
              {store.store_type && (
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-spotify text-xs font-medium ${getStoreTypeColor(store.store_type)}`}>
                  <span className="text-sm">{getStoreTypeIcon(store.store_type)}</span>
                  {store.store_type}
                </span>
              )}
              {store.distance !== undefined && (
                <div className="bg-accent/10 text-accent-foreground px-2 py-1 rounded-spotify text-xs font-medium">
                  {store.distance.toFixed(1)} mi
                </div>
              )}
            </div>
            <StoreRatingDisplay storeId={store.id} className="mb-2" />
          </div>
          <Store className="h-6 w-6 text-muted-foreground ml-2 flex-shrink-0" />
        </div>

        <div className="space-y-2">
          {fullAddress && (
            <div className="flex items-start gap-2 body-sm text-muted-foreground">
              <MapPin className="h-4 w-4 mt-0.5 text-muted flex-shrink-0" />
              <div className="flex-1">
                <span>{fullAddress}</span>
                {!hasCompleteAddress && (
                  <div className="text-destructive caption mt-1">
                    ⚠️ Address may be incomplete
                  </div>
                )}
              </div>
            </div>
          )}

          {store.incentive_program && (
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-primary" />
              <span className="body-sm font-medium text-primary">
                {store.incentive_program}
              </span>
            </div>
          )}

          {store.grantee_name && (
            <div className="body-sm text-muted-foreground">
              <span className="font-medium">Operated by:</span> {store.grantee_name}
            </div>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
          <Link
            to={`/store/${store.id}`}
            onClick={handleStoreClick}
            className="body-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1"
          >
            View Details
            <ExternalLink className="h-3 w-3" />
          </Link>
          
          {store.latitude && store.longitude && (
            <button
              onClick={() => {
                const url = `https://www.google.com/maps/search/?api=1&query=${store.latitude},${store.longitude}`;
                window.open(url, '_blank');
              }}
              className="body-sm text-muted-foreground hover:text-foreground font-medium"
            >
              View on Map →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
