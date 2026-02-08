import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { StorePhoto } from './StorePhoto';
import { FavoriteButton } from './FavoriteButton';
import { ShareStore } from './ShareStore';
import { StoreRatingDisplay } from './reviews/StoreRatingDisplay';
import { 
  StoreTypeBadge, 
  EbtAcceptedBadge, 
  IncentiveProgramBadge, 
  StoreContactInfo, 
  StoreRating, 
  StorePhotoDisplay,
  DataQualityBadge,
  calculateStoreCompleteness,
  QuickActionButtons,
} from './store';
import { useStoreClickTracking } from '@/hooks/useStoreClickTracking';
import { getCachedIPGeolocation } from '@/hooks/useIPGeolocation';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { formatStoreAddress, getStorePhotos } from '@/utils/storeUtils';
import type { StoreWithDistance } from '@/types/storeTypes';

interface UnifiedStoreCardProps {
  store: StoreWithDistance;
  /** Show enhanced features like Google Photos and community tips */
  enhanced?: boolean;
  /** Show business actions like "Claim this Business" */
  showActions?: boolean;
}

export const UnifiedStoreCard: React.FC<UnifiedStoreCardProps> = ({ 
  store, 
  enhanced = true,
  showActions = false 
}) => {
  const { trackStoreClick } = useStoreClickTracking();
  const cachedLocation = getCachedIPGeolocation();

  // Only fetch latest comment if showing actions (basic card mode)
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
    },
    enabled: showActions,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const handleStoreClick = () => {
    if (cachedLocation) {
      trackStoreClick(store.id, cachedLocation.latitude, cachedLocation.longitude);
    }
  };

  const fullAddress = formatStoreAddress(store);
  const photos = enhanced ? getStorePhotos(store) : null;
  const rating = store.google_rating;
  const ratingsTotal = store.google_user_ratings_total;
  const openingHours = store.google_opening_hours as { open_now?: boolean } | null;
  const phone = store.google_formatted_phone_number;
  const website = store.google_website;
  
  // Calculate data completeness for badge
  const completeness = calculateStoreCompleteness(store);

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200">
      <div className="flex">
        {/* Store Photo */}
        <div className="w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0">
          {enhanced && photos ? (
            <StorePhotoDisplay 
              photos={photos}
              storeName={store.Store_Name}
              className="w-full h-full"
            />
          ) : (
            <StorePhoto 
              storeName={store.Store_Name || ''}
              address={fullAddress}
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-4 min-w-0">
          {/* Store Title, Rating, and Data Quality Badge */}
          <div className="mb-2">
            <div className="flex items-start justify-between gap-2">
              <Link 
                to={`/store/${store.id}`}
                onClick={handleStoreClick}
                className="text-lg font-semibold text-foreground hover:text-primary transition-colors block truncate flex-1"
              >
                {store.Store_Name}
              </Link>
              <DataQualityBadge {...completeness} />
            </div>
            
            <div className="flex items-center gap-2 mt-1">
              {enhanced && rating ? (
                <StoreRating rating={rating} reviewCount={ratingsTotal} />
              ) : (
                <>
                  {store.ObjectId && <StoreRatingDisplay storeId={parseInt(store.ObjectId)} />}
                </>
              )}
            </div>
          </div>

          {/* Store Type and EBT Tags */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <StoreTypeBadge storeType={store.Store_Type} />
            <EbtAcceptedBadge />
          </div>

          {/* Incentive Programs */}
          <IncentiveProgramBadge incentiveProgram={store.Incentive_Program} />

          {/* Community Tip Preview (only for basic card with actions) */}
          {showActions && latestComment && (
            <div className="mb-3 p-2 bg-info/10 rounded-md border border-info/20">
              <div className="flex items-center gap-1 mb-1">
                <MessageCircle className="h-3 w-3 text-info" />
                <span className="text-xs font-medium text-info">
                  {latestComment.user_name}
                </span>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {latestComment.comment_text}
              </p>
            </div>
          )}

          {/* Action Buttons (only for basic card) */}
          {showActions && (
            <>
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
              <div className="border-t border-border mb-3"></div>
            </>
          )}

          {/* Contact Information */}
          <StoreContactInfo
            address={fullAddress}
            distance={store.distance}
            phone={phone}
            openingHours={openingHours}
            website={website}
            hideEmptyFields={true}
          />

          {/* Quick Actions and Favorites */}
          <div className="flex items-center justify-between mt-3 pt-2 border-t border-border">
            <QuickActionButtons 
              phone={phone}
              address={fullAddress}
              storeName={store.Store_Name || ''}
              variant="compact"
            />
            <div className="flex items-center gap-1">
              <FavoriteButton storeId={store.id} variant="icon" />
              <ShareStore store={store} variant="icon" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Re-export for backward compatibility
export { UnifiedStoreCard as StoreCard };
