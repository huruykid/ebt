import React, { useState } from 'react';
import { Star, MapPin, Tag, Utensils, Building2, Phone, Clock, Navigation, ExternalLink, MoreVertical, Gift } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StoreRatingDisplay } from '@/components/reviews/StoreRatingDisplay';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AddPhoneModal } from './modals/AddPhoneModal';
import { AddHoursModal } from './modals/AddHoursModal';
import { ReportIssueModal } from './modals/ReportIssueModal';
import { ClaimBusinessModal } from './modals/ClaimBusinessModal';
import { FollowButton } from '@/components/gamification';
import { FavoriteButton } from '@/components/FavoriteButton';
import type { Tables } from '@/integrations/supabase/types';

type Store = Tables<'snap_stores'>;

interface StoreHeaderProps {
  store: Store;
  userDistance?: number;
  reviewCount?: number;
  averageRating?: number;
}

export const StoreHeader: React.FC<StoreHeaderProps> = ({ store, userDistance }) => {
  const [addedHours, setAddedHours] = useState<Record<string, { open: string; close: string; closed: boolean }> | null>(null);
  const [addedPhone, setAddedPhone] = useState<string | null>(null);

  const formatAddress = () => {
    const parts = [
      store.Store_Street_Address,
      store.City,
      store.State,
      store.Zip_Code
    ].filter(Boolean);
    return parts.join(', ');
  };

  const openInMaps = () => {
    const address = encodeURIComponent(formatAddress());
    window.open(`https://www.google.com/maps/search/?api=1&query=${address}`, '_blank');
  };

  const callStore = () => {
    const phone = getDisplayPhone();
    if (phone) window.location.href = `tel:${phone}`;
  };

  const openWebsite = () => {
    const website = store.google_website;
    if (website) {
      window.open(website.startsWith('http') ? website : `https://${website}`, '_blank');
    }
  };

  const getStoreTypeColor = (type: string | null) => {
    switch (type?.toLowerCase()) {
      case 'supermarket':
      case 'super store':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'convenience store':
        return 'bg-secondary/10 text-secondary-foreground border-secondary/20';
      default:
        return 'bg-muted/10 text-muted-foreground border-muted/20';
    }
  };

  const isRmpEnrolled = store.Incentive_Program?.toLowerCase().includes('rmp') || 
                       store.Incentive_Program?.toLowerCase().includes('restaurant meals program');

  const handleHoursAdded = (hours: Record<string, { open: string; close: string; closed: boolean }>) => {
    setAddedHours(hours);
  };

  const handlePhoneAdded = (phoneNumber: string) => {
    setAddedPhone(phoneNumber);
  };

  const formatTodayHours = (hours: Record<string, { open: string; close: string; closed: boolean }>) => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const todayHours = hours[today];
    if (!todayHours) return 'Hours available';
    if (todayHours.closed) return 'Closed today';
    return `${todayHours.open} - ${todayHours.close}`;
  };

  const formatGoogleHours = () => {
    if (!store.google_opening_hours) return null;
    try {
      const openingHours = typeof store.google_opening_hours === 'string' 
        ? JSON.parse(store.google_opening_hours) 
        : store.google_opening_hours;
      if (openingHours.weekday_text?.length > 0) {
        const today = new Date().getDay();
        const todayIndex = today === 0 ? 6 : today - 1;
        return openingHours.weekday_text[todayIndex] || openingHours.weekday_text[0];
      }
    } catch (error) {
      console.warn('Error parsing Google opening hours:', error);
    }
    return null;
  };

  const getDisplayPhone = () => addedPhone || store.google_formatted_phone_number;

  const getDisplayHours = () => {
    if (addedHours) return formatTodayHours(addedHours);
    const googleHours = formatGoogleHours();
    if (googleHours) return googleHours.split(': ')[1] || googleHours;
    return null;
  };

  const getOpenStatus = () => {
    try {
      if (store.google_opening_hours) {
        const openingHours = typeof store.google_opening_hours === 'string' 
          ? JSON.parse(store.google_opening_hours) 
          : store.google_opening_hours;
        return openingHours.open_now;
      }
    } catch (error) {
      console.warn('Error parsing opening hours:', error);
    }
    return null;
  };

  const isOpenNow = getOpenStatus();
  const hasMissingData = !getDisplayPhone() || !getDisplayHours();

  return (
    <Card className="overflow-hidden border-0 shadow-md">
      <CardContent className="p-3 sm:p-4">
        {/* Row 1: Name + Actions */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h1 className="text-lg sm:text-xl font-bold text-foreground leading-tight flex-1 min-w-0 line-clamp-2">
            {store.Store_Name}
          </h1>
          <div className="flex items-center gap-1 flex-shrink-0">
            <FavoriteButton storeId={store.id} variant="icon" />
            <FollowButton storeId={store.id} variant="icon" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <ClaimBusinessModal store={store}>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    Claim Business
                  </DropdownMenuItem>
                </ClaimBusinessModal>
                <ReportIssueModal store={store}>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                    Report Issue
                  </DropdownMenuItem>
                </ReportIssueModal>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Row 2: Rating + Status + Hours - Inline */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm mb-3">
          {store.ObjectId && <StoreRatingDisplay storeId={parseInt(store.ObjectId)} />}
          
          {isOpenNow !== null && (
            <Badge variant="outline" className={`text-xs py-0 h-5 ${
              isOpenNow 
                ? "bg-green-50 text-green-700 border-green-200" 
                : "bg-red-50 text-red-700 border-red-200"
            }`}>
              {isOpenNow ? 'Open' : 'Closed'}
            </Badge>
          )}
          
          {getDisplayHours() && (
            <span className="text-xs text-muted-foreground">
              {getDisplayHours()}
            </span>
          )}
          
          {userDistance && (
            <span className="text-xs text-muted-foreground">
              {userDistance.toFixed(1)} mi
            </span>
          )}
        </div>

        {/* Row 3: Address - Compact */}
        <div className="flex items-start gap-2 mb-3">
          <MapPin className="h-3.5 w-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
          <p className="text-sm text-muted-foreground leading-tight">
            {formatAddress() || 'Address not available'}
          </p>
        </div>

        {/* Row 4: Action Buttons - Full width, equal sizing */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          {getDisplayPhone() ? (
            <Button onClick={callStore} size="sm" className="w-full">
              <Phone className="h-4 w-4 mr-1.5" />
              Call
            </Button>
          ) : (
            <AddPhoneModal store={store} onPhoneAdded={handlePhoneAdded} />
          )}
          
          <Button onClick={openInMaps} variant="outline" size="sm" className="w-full">
            <Navigation className="h-4 w-4 mr-1.5" />
            Directions
          </Button>
        </div>

        {/* Row 5: Secondary Actions */}
        {(store.google_website || !getDisplayHours()) && (
          <div className="grid grid-cols-2 gap-2 mb-3">
            {store.google_website && (
              <Button onClick={openWebsite} variant="ghost" size="sm" className="w-full text-muted-foreground">
                <ExternalLink className="h-4 w-4 mr-1.5" />
                Website
              </Button>
            )}
            {!getDisplayHours() && (
              <AddHoursModal store={store} onHoursAdded={handleHoursAdded} />
            )}
          </div>
        )}

        {/* Row 6: Badges - Compact inline */}
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs py-0 h-5">
            <Tag className="h-2.5 w-2.5 mr-1" />
            EBT
          </Badge>
          
          {isRmpEnrolled && (
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs py-0 h-5">
              <Utensils className="h-2.5 w-2.5 mr-1" />
              Hot Foods
            </Badge>
          )}
          
          {store.Store_Type && (
            <Badge variant="outline" className={`${getStoreTypeColor(store.Store_Type)} text-xs py-0 h-5`}>
              <Building2 className="h-2.5 w-2.5 mr-1" />
              {store.Store_Type}
            </Badge>
          )}
          
          {store.Incentive_Program && !isRmpEnrolled && (
            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-xs py-0 h-5">
              <Star className="h-2.5 w-2.5 mr-1" />
              Incentive
            </Badge>
          )}
        </div>

        {/* Contribution CTA - Minimal, only shown when both missing */}
        {hasMissingData && !getDisplayPhone() && !getDisplayHours() && (
          <div className="flex items-center gap-1 mt-3 pt-2 border-t text-xs text-muted-foreground">
            <Gift className="h-3 w-3" />
            <span>Help complete this listing and earn points!</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
