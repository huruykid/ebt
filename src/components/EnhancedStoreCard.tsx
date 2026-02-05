import React from 'react';
import { Link } from 'react-router-dom';
import { FavoriteButton } from './FavoriteButton';
import { ShareStore } from './ShareStore';
import { StoreTypeBadge, EbtAcceptedBadge, IncentiveProgramBadge, StoreContactInfo, StoreRating, StorePhotoDisplay } from './store';
import { useStoreClickTracking } from '@/hooks/useStoreClickTracking';
import { getCachedIPGeolocation } from '@/hooks/useIPGeolocation';
import { useStoredGooglePlaces } from '@/hooks/useStoredGooglePlaces';
import { formatStoreAddress, getStorePhotos } from '@/utils/storeUtils';
import type { StoreWithDistance } from '@/types/storeTypes';

interface EnhancedStoreCardProps {
  store: StoreWithDistance;
}

export const EnhancedStoreCard: React.FC<EnhancedStoreCardProps> = ({ store }) => {
  const { trackStoreClick } = useStoreClickTracking();
  // Use cached location synchronously to avoid triggering additional API calls
  const cachedLocation = getCachedIPGeolocation();
  const googlePlacesData = useStoredGooglePlaces(store);

  const handleStoreClick = () => {
    if (cachedLocation) {
      trackStoreClick(store.id, cachedLocation.latitude, cachedLocation.longitude);
    }
  };

  const fullAddress = formatStoreAddress(store);
  const photos = getStorePhotos(store);
  const rating = store.google_rating || googlePlacesData?.rating;
  const ratingsTotal = store.google_user_ratings_total || googlePlacesData?.user_ratings_total;
  const openingHours = (store.google_opening_hours || googlePlacesData?.opening_hours) as { open_now?: boolean } | null;
  const phone = store.google_formatted_phone_number || googlePlacesData?.formatted_phone_number;
  const website = store.google_website || googlePlacesData?.website;

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200">
      <div className="flex">
        {/* Store Photo */}
        <div className="w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0">
          <StorePhotoDisplay 
            photos={photos}
            storeName={store.Store_Name}
            className="w-full h-full"
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
            
            <div className="mt-1">
              <StoreRating rating={rating} reviewCount={ratingsTotal} />
            </div>
          </div>

          {/* Store Type and EBT Tags */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <StoreTypeBadge storeType={store.Store_Type} />
            <EbtAcceptedBadge />
          </div>

          {/* Incentive Programs */}
          <IncentiveProgramBadge incentiveProgram={store.Incentive_Program} />

          {/* Contact Information */}
          <StoreContactInfo
            address={fullAddress}
            distance={store.distance}
            phone={phone || 'Phone coming soon'}
            openingHours={openingHours}
            website={website}
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
