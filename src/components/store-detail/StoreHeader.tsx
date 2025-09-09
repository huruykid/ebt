
import React, { useState } from 'react';
import { Star, MapPin, Tag, Globe, Utensils, Building2, Phone, Clock, Navigation, ExternalLink, MoreVertical } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StoreRatingDisplay } from '@/components/reviews/StoreRatingDisplay';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AddPhoneModal } from './modals/AddPhoneModal';
import { AddHoursModal } from './modals/AddHoursModal';
import { ReportIssueModal } from './modals/ReportIssueModal';
import { ClaimBusinessModal } from './modals/ClaimBusinessModal';
import type { Tables } from '@/integrations/supabase/types';

type Store = Tables<'snap_stores'>;

interface StoreHeaderProps {
  store: Store;
  userDistance?: number; // Distance in miles
  reviewCount?: number;
  averageRating?: number;
}

export const StoreHeader: React.FC<StoreHeaderProps> = ({ store, userDistance, reviewCount = 0, averageRating = 0 }) => {
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
    const url = `https://www.google.com/maps/search/?api=1&query=${address}`;
    window.open(url, '_blank');
  };

  const callStore = () => {
    const phone = getDisplayPhone();
    if (phone) {
      window.location.href = `tel:${phone}`;
    }
  };

  const openWebsite = () => {
    const website = store.google_website;
    if (website) {
      const url = website.startsWith('http') ? website : `https://${website}`;
      window.open(url, '_blank');
    }
  };

  const getStoreTypeIcon = (type: string | null) => {
    switch (type?.toLowerCase()) {
      case 'supermarket':
      case 'super store':
        return Building2;
      case 'convenience store':
        return Building2;
      case 'grocery store':
        return Building2;
      default:
        return Building2;
    }
  };

  const getStoreTypeColor = (type: string | null) => {
    switch (type?.toLowerCase()) {
      case 'supermarket':
      case 'super store':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'convenience store':
        return 'bg-secondary/10 text-secondary-foreground border-secondary/20';
      case 'grocery store':
        return 'bg-accent/10 text-accent-foreground border-accent/20';
      default:
        return 'bg-muted/10 text-muted-foreground border-muted/20';
    }
  };

  const StoreTypeIcon = getStoreTypeIcon(store.Store_Type);

  // Check if store accepts hot foods (RMP)
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
    
    if (todayHours.closed) {
      return 'Closed today';
    }
    
    return `${todayHours.open} - ${todayHours.close}`;
  };

  const formatGoogleHours = () => {
    if (!store.google_opening_hours) return null;
    
    try {
      // Handle both string and object formats
      const openingHours = typeof store.google_opening_hours === 'string' 
        ? JSON.parse(store.google_opening_hours) 
        : store.google_opening_hours;
        
      if (openingHours.weekday_text && openingHours.weekday_text.length > 0) {
        const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
        const todayIndex = today === 0 ? 6 : today - 1; // Convert to Monday = 0 format
        return openingHours.weekday_text[todayIndex] || openingHours.weekday_text[0];
      }
    } catch (error) {
      console.warn('Error parsing Google opening hours:', error);
    }
    
    return null;
  };

  const getDisplayPhone = () => {
    return addedPhone || store.google_formatted_phone_number;
  };

  const getDisplayHours = () => {
    if (addedHours) {
      return formatTodayHours(addedHours);
    }
    
    const googleHours = formatGoogleHours();
    if (googleHours) {
      // Extract just the hours part after the day name
      return googleHours.split(': ')[1] || googleHours;
    }
    
    return null;
  };

  const getOpenStatus = () => {
    try {
      if (store.google_opening_hours) {
        // Handle both string and object formats
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

  return (
    <Card className="overflow-hidden border-0 shadow-lg">
      <CardContent className="p-6 lg:p-8">
        <div className="space-y-6">
          {/* Store Name, Rating, and Status */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2 leading-tight">
                  {store.Store_Name}
                </h1>
                
                {/* Rating, Distance, and Status Row */}
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <StoreRatingDisplay storeId={parseInt(store.id)} />
                  
                  {userDistance && (
                    <span className="text-sm text-muted-foreground">
                      • {userDistance.toFixed(1)} miles away
                    </span>
                  )}
                  
                  {isOpenNow !== null && (
                    <Badge variant={isOpenNow ? "secondary" : "outline"} className={
                      isOpenNow 
                        ? "bg-green-50 text-green-700 border-green-200" 
                        : "bg-red-50 text-red-700 border-red-200"
                    }>
                      <Clock className="h-3 w-3 mr-1" />
                      {isOpenNow ? 'Open Now' : 'Closed'}
                    </Badge>
                  )}
                </div>

                {/* Today's Hours */}
                {getDisplayHours() && (
                  <p className="text-sm text-muted-foreground mb-3">
                    Today: {getDisplayHours()}
                  </p>
                )}
              </div>
              
              {/* More Options Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
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

            {/* Primary Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              {getDisplayPhone() && (
                <Button onClick={callStore} size="lg" className="flex-1">
                  <Phone className="h-4 w-4 mr-2" />
                  Call Now
                </Button>
              )}
              
              <Button onClick={openInMaps} variant="outline" size="lg" className="flex-1">
                <Navigation className="h-4 w-4 mr-2" />
                Directions
              </Button>
              
              {store.google_website && (
                <Button onClick={openWebsite} variant="outline" size="lg" className="flex-1">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Website
                </Button>
              )}
            </div>

            {/* Store Badges - Compact Display */}
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <Tag className="h-3 w-3 mr-1" />
                EBT Accepted
              </Badge>
              
              {isRmpEnrolled && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  <Utensils className="h-3 w-3 mr-1" />
                  Hot Foods
                </Badge>
              )}
              
              {store.Store_Type && (
                <Badge variant="secondary" className={`${getStoreTypeColor(store.Store_Type)} border`}>
                  <StoreTypeIcon className="h-3 w-3 mr-1" />
                  {store.Store_Type}
                </Badge>
              )}
              
              {store.Incentive_Program && (
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                  <Star className="h-3 w-3 mr-1" />
                  {store.Incentive_Program}
                </Badge>
              )}
            </div>
          </div>

          {/* Address Card - Simplified */}
          <div className="bg-muted/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <MapPin className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground font-medium mb-1">
                  {formatAddress() || 'Address not available'}
                </p>
                
                {/* Display hours if available */}
                {getDisplayHours() && (
                  <div className="flex items-center gap-2 mt-2">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      Today: {getDisplayHours()}
                    </span>
                  </div>
                )}
                
                {/* Inline actions for missing data */}
                <div className="flex flex-wrap gap-2 mt-2">
                  {!getDisplayPhone() && (
                    <AddPhoneModal store={store} onPhoneAdded={handlePhoneAdded} />
                  )}
                  {!getDisplayHours() && (
                    <AddHoursModal store={store} onHoursAdded={handleHoursAdded} />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* EBT Information */}
          {store.Incentive_Program && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                <Star className="h-4 w-4" />
                Incentive Program Available
              </h3>
              <p className="text-green-800 text-sm">{store.Incentive_Program}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
