import React from 'react';
import { Star, MapPin, Phone, Navigation, ExternalLink, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FavoriteButton } from '@/components/FavoriteButton';
import { ShareStore } from '@/components/ShareStore';
import type { Tables } from '@/integrations/supabase/types';

type Store = Tables<'snap_stores'>;

interface StoreHeaderProps {
  store: Store;
  userDistance?: number;
}

export const StoreHeader: React.FC<StoreHeaderProps> = ({ store, userDistance }) => {
  const formatAddress = () => {
    return [store.Store_Street_Address, store.City, store.State, store.Zip_Code].filter(Boolean).join(', ');
  };

  const openInMaps = () => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(formatAddress())}`, '_blank');
  };

  const callStore = () => {
    if (store.google_formatted_phone_number) {
      window.location.href = `tel:${store.google_formatted_phone_number}`;
    }
  };

  const getOpenStatus = () => {
    try {
      if (store.google_opening_hours) {
        const hours = typeof store.google_opening_hours === 'string'
          ? JSON.parse(store.google_opening_hours)
          : store.google_opening_hours;
        return hours.open_now;
      }
    } catch { /* ignore */ }
    return undefined;
  };

  const isOpen = getOpenStatus();
  const rating = store.google_rating;
  const ratingsTotal = store.google_user_ratings_total;
  const phone = store.google_formatted_phone_number;
  const website = store.google_website;

  return (
    <div className="space-y-4">
      {/* Name + actions */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-bold text-foreground leading-tight">
            {store.Store_Name}
          </h1>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-2 mt-1.5">
            {rating ? (
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="text-sm font-medium text-foreground">{rating}</span>
                {ratingsTotal ? (
                  <span className="text-sm text-muted-foreground">({ratingsTotal})</span>
                ) : null}
              </div>
            ) : null}
            {store.Store_Type ? (
              <span className="text-sm text-muted-foreground">· {store.Store_Type}</span>
            ) : null}
            {isOpen !== undefined ? (
              <span className={`text-sm font-medium ${isOpen ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                · {isOpen ? 'Open' : 'Closed'}
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          <FavoriteButton storeId={store.id} variant="icon" />
          <ShareStore store={store} variant="icon" />
        </div>
      </div>

      {/* Address */}
      <div className="flex items-start gap-2 text-muted-foreground">
        <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
        <span className="text-sm">{formatAddress()}</span>
        {userDistance !== undefined ? (
          <span className="text-sm font-medium text-foreground whitespace-nowrap ml-auto">
            {userDistance.toFixed(1)} mi
          </span>
        ) : null}
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        {phone ? (
          <Button onClick={callStore} size="sm" className="flex-1">
            <Phone className="h-4 w-4 mr-1.5" />
            Call
          </Button>
        ) : null}
        <Button onClick={openInMaps} variant="outline" size="sm" className="flex-1">
          <Navigation className="h-4 w-4 mr-1.5" />
          Directions
        </Button>
        {website ? (
          <Button
            onClick={() => window.open(website.startsWith('http') ? website : `https://${website}`, '_blank')}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            <ExternalLink className="h-4 w-4 mr-1.5" />
            Website
          </Button>
        ) : null}
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 text-xs">
        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium">EBT Accepted</span>
        {store.Incentive_Program ? (
          <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-medium">
            {store.Incentive_Program}
          </span>
        ) : null}
      </div>
    </div>
  );
};
