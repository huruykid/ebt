import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MapPin, Star, ChevronRight, Store } from 'lucide-react';
import { FavoriteButton } from './FavoriteButton';
import { useStoreClickTracking } from '@/hooks/useStoreClickTracking';
import { getCachedIPGeolocation } from '@/hooks/useIPGeolocation';
import { saveNavigationReferrer } from '@/hooks/useNavigationReferrer';
import { formatStoreAddress, isRmpEnrolled } from '@/utils/storeUtils';
import { getBrandLogo } from '@/utils/brandLogos';
import type { StoreWithDistance } from '@/types/storeTypes';

interface UnifiedStoreCardProps {
  store: StoreWithDistance;
  enhanced?: boolean;
  showActions?: boolean;
}

export const UnifiedStoreCard: React.FC<UnifiedStoreCardProps> = ({ store }) => {
  const { trackStoreClick } = useStoreClickTracking();
  const cachedLocation = getCachedIPGeolocation();
  const location = useLocation();
  const [logoError, setLogoError] = useState(false);

  const brandInfo = getBrandLogo(store.Store_Name);

  const handleStoreClick = () => {
    saveNavigationReferrer(location.pathname + location.search);
    if (cachedLocation) {
      trackStoreClick(store.id, cachedLocation.latitude, cachedLocation.longitude);
    }
  };

  const fullAddress = formatStoreAddress(store);
  const rating = store.google_rating;
  const ratingsTotal = store.google_user_ratings_total;
  const openingHours = store.google_opening_hours as { open_now?: boolean } | null;
  const isOpen = openingHours?.open_now;
  const showRmp = isRmpEnrolled(store.Incentive_Program);

  return (
    <Link
      to={`/store/${store.id}`}
      onClick={handleStoreClick}
      className="group block bg-card border border-border rounded-xl p-4 hover:border-primary/20 transition-colors duration-150"
    >
      <div className="flex items-start justify-between gap-3">
        {/* Brand logo or fallback icon */}
        <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
          {brandInfo && !logoError ? (
            <img
              src={brandInfo.logoUrl}
              alt={`${store.Store_Name} logo`}
              className="w-10 h-10 object-contain"
              onError={() => setLogoError(true)}
              loading="lazy"
            />
          ) : (
            <Store className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          {/* Name */}
          <h3 className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
            {store.Store_Name}
          </h3>

          {/* Rating + Status row */}
          <div className="flex items-center gap-2 mt-1">
            {rating ? (
              <div className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                <span className="text-xs font-medium text-foreground">{rating}</span>
                {ratingsTotal ? (
                  <span className="text-xs text-muted-foreground">({ratingsTotal})</span>
                ) : null}
              </div>
            ) : null}
            {store.Store_Type ? (
              <span className="text-xs text-muted-foreground">· {store.Store_Type}</span>
            ) : null}
            {isOpen !== undefined ? (
              <span className={`text-xs font-medium ${isOpen ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                · {isOpen ? 'Open' : 'Closed'}
              </span>
            ) : null}
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800">
              EBT
            </span>
            {showRmp ? (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800">
                RMP
              </span>
            ) : null}
          </div>

          {/* Address + distance */}
          <div className="flex items-center gap-1.5 mt-2 text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="text-xs truncate">{fullAddress}</span>
            {store.distance !== undefined ? (
              <span className="text-xs font-medium text-foreground whitespace-nowrap ml-auto">
                {store.distance.toFixed(1)} mi
              </span>
            ) : null}
          </div>
        </div>

        {/* Right side actions */}
        <div className="flex flex-col items-center gap-2 flex-shrink-0">
          <FavoriteButton storeId={store.id} variant="icon" />
          <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
        </div>
      </div>
    </Link>
  );
};

export { UnifiedStoreCard as StoreCard };
