
import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Store, Star, ExternalLink, Sparkles } from 'lucide-react';
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
        return 'bg-gradient-to-r from-primary/20 to-primary/10 text-primary border-primary/30';
      case 'convenience store':
        return 'bg-gradient-to-r from-info/20 to-info/10 text-info border-info/30';
      case 'grocery store':
        return 'bg-gradient-to-r from-success/20 to-success/10 text-success border-success/30';
      default:
        return 'bg-gradient-to-r from-accent/20 to-accent/10 text-accent-foreground border-accent/30';
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
    <div className="card-gradient hover-lift rounded-spotify-lg border-2 border-primary/10 hover:border-primary/30 overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300">
      {/* Store Photo with overlay gradient */}
      <div className="relative">
        <StorePhoto 
          storeName={store.store_name}
          address={fullAddress}
          className="w-full h-32 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
        
        {/* Special badge for incentive programs */}
        {store.incentive_program && (
          <div className="absolute top-2 left-2">
            <div className="bg-gradient-to-r from-warning to-warning/80 text-warning-foreground px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 shadow-lg">
              <Sparkles className="h-3 w-3" />
              Special Program
            </div>
          </div>
        )}
      </div>

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
              className="heading-sm text-foreground mb-1 hover:text-primary transition-colors block gradient-text font-bold"
            >
              {store.store_name}
            </Link>
            <div className="flex items-center gap-2 flex-wrap mb-2">
              {store.store_type && (
                <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-spotify-lg text-xs font-semibold border-2 transition-all duration-200 hover:scale-105 ${getStoreTypeColor(store.store_type)}`}>
                  <span className="text-sm">{getStoreTypeIcon(store.store_type)}</span>
                  {store.store_type}
                </span>
              )}
              {store.distance !== undefined && (
                <div className="bg-gradient-to-r from-accent/30 to-accent/20 text-accent-foreground px-3 py-1.5 rounded-spotify-lg text-xs font-semibold border-2 border-accent/30 animate-pulse-spotify">
                  📍 {store.distance.toFixed(1)} mi
                </div>
              )}
            </div>
            <StoreRatingDisplay storeId={store.id} className="mb-2" />
          </div>
          <Store className="h-6 w-6 text-primary/60 ml-2 flex-shrink-0" />
        </div>

        <div className="space-y-3">
          {fullAddress && (
            <div className="flex items-start gap-2 body-sm text-muted-foreground">
              <MapPin className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
              <div className="flex-1">
                <span>{fullAddress}</span>
                {!hasCompleteAddress && (
                  <div className="text-warning caption mt-1 flex items-center gap-1">
                    ⚠️ Address may be incomplete
                  </div>
                )}
              </div>
            </div>
          )}

          {store.incentive_program && (
            <div className="flex items-center gap-2 p-2 bg-gradient-to-r from-primary/10 to-accent/10 rounded-spotify border border-primary/20">
              <Star className="h-4 w-4 text-primary animate-bounce-gentle" />
              <span className="body-sm font-semibold text-primary">
                {store.incentive_program}
              </span>
            </div>
          )}

          {store.grantee_name && (
            <div className="body-sm text-muted-foreground p-2 bg-muted/50 rounded-spotify">
              <span className="font-semibold text-foreground">Operated by:</span> {store.grantee_name}
            </div>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-gradient-to-r from-primary/20 via-accent/20 to-info/20 flex items-center justify-between">
          <Link
            to={`/store/${store.id}`}
            onClick={handleStoreClick}
            className="btn-spotify-outline body-sm flex items-center gap-2 px-4 py-2 rounded-spotify-lg font-semibold"
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
              className="body-sm text-info hover:text-info/80 font-semibold hover:scale-105 transition-all duration-200"
            >
              View on Map →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
