import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { StorePhoto } from './StorePhoto';
import { FavoriteButton } from './FavoriteButton';
import { ShareStore } from './ShareStore';
import { StoreRatingDisplay } from './reviews/StoreRatingDisplay';
import { StoreTypeBadge, EbtAcceptedBadge, IncentiveProgramBadge, StoreContactInfo } from './store';
import { useStoreClickTracking } from '@/hooks/useStoreClickTracking';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { formatStoreAddress } from '@/utils/storeUtils';
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
      trackStoreClick(store.id, latitude, longitude);
    }
  };

  const fullAddress = formatStoreAddress(store);
  const openingHours = store.google_opening_hours as { open_now?: boolean } | null;

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200">
      <div className="flex">
        {/* Store Photo */}
        <div className="w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0">
          <StorePhoto 
            storeName={store.Store_Name || ''}
            address={fullAddress}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content */}
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
            
            <div className="flex items-center gap-2 mt-1">
              {store.ObjectId && <StoreRatingDisplay storeId={parseInt(store.ObjectId)} />}
              <span className="text-sm text-muted-foreground">No reviews yet</span>
            </div>
          </div>

          {/* Store Type and EBT Tags */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <StoreTypeBadge storeType={store.Store_Type} />
            <EbtAcceptedBadge />
          </div>

          {/* Incentive Programs */}
          <IncentiveProgramBadge incentiveProgram={store.Incentive_Program} />

          {/* Community Tip Preview */}
          {latestComment && (
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

          {/* Contact Information */}
          <StoreContactInfo
            address={fullAddress}
            distance={store.distance}
            phone={store.google_formatted_phone_number}
            openingHours={openingHours}
            website={store.google_website}
          />

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
