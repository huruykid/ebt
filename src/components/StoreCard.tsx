
import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star, Phone, Clock, Globe, ExternalLink, Utensils, MessageCircle } from 'lucide-react';
import { StorePhoto } from './StorePhoto';
import { FavoriteButton } from './FavoriteButton';
import { ShareStore } from './ShareStore';
import { StoreRatingDisplay } from './reviews/StoreRatingDisplay';
import { useStoreClickTracking } from '@/hooks/useStoreClickTracking';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type Store = Tables<'snap_stores'>;

interface StoreCardProps {
  store: Store & { distance?: number };
}

export const StoreCard: React.FC<StoreCardProps> = ({ store }) => {
  const { trackStoreClick } = useStoreClickTracking();
  const { latitude, longitude } = useGeolocation();

  // Fetch latest comment for this store
  const { data: latestComment } = useQuery({
    queryKey: ['store-latest-comment', store.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('store_comments')
        .select('comment_text, user_name, created_at')
        .eq('store_id', store.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    }
  });

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
    <div className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200">
      {/* Enhanced horizontal layout */}
      <div className="flex">
        {/* Store Photo - Left side */}
        <div className="w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0">
          <StorePhoto 
            storeName={store.Store_Name || ''}
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
              {store.Store_Name}
            </Link>
            
            {/* Rating and Review Count */}
            <div className="flex items-center gap-2 mt-1">
              <StoreRatingDisplay storeId={parseInt(store.id)} />
              <span className="text-sm text-muted-foreground">No reviews yet</span>
            </div>
          </div>

          {/* Store Type and EBT Tags */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            {store.Store_Type && (
              <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${getStoreTypeColor(store.Store_Type)}`}>
                {store.Store_Type}
              </span>
            )}
            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-accent/20 text-accent-foreground border border-accent/20">
              EBT Accepted
            </span>
          {isRmpEnrolled && (
            <a 
              href="https://www.fns.usda.gov/snap/retailer/restaurant-meals-program"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors"
            >
              <Utensils className="h-3 w-3 mr-1" />
              Hot Foods
            </a>
          )}
          </div>

          {/* Community Tip Preview */}
          {latestComment && (
            <div className="mb-3 p-2 bg-blue-50 dark:bg-blue-950 rounded-md border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-1 mb-1">
                <MessageCircle className="h-3 w-3 text-blue-600" />
                <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                  {latestComment.user_name}
                </span>
              </div>
              <p className="text-xs text-blue-800 dark:text-blue-200 line-clamp-2">
                {latestComment.comment_text}
              </p>
            </div>
          )}

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

          {/* Contact Information - Enhanced style */}
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

            {store.google_formatted_phone_number && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 flex-shrink-0" />
                <span>{store.google_formatted_phone_number}</span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 flex-shrink-0" />
              <span>
                {(() => {
                  const openingHours = store.google_opening_hours as { open_now?: boolean } | null;
                  if (openingHours?.open_now !== undefined) {
                    return openingHours.open_now ? 'Open Now' : 'Closed';
                  }
                  return 'Hours not available';
                })()}
              </span>
            </div>

            {store.google_website && (
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 flex-shrink-0" />
                <a 
                  href={store.google_website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80 text-sm"
                >
                  Visit Website
                </a>
              </div>
            )}
          </div>

          {/* Favorites and Share - Bottom row */}
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
