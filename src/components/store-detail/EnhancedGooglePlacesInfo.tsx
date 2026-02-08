import React, { useState } from 'react';
import { Phone, Globe, Clock, Star, MapPin, ExternalLink, CheckCircle2, ChevronDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useIsMobile } from '@/hooks/use-mobile';
import type { StoredGooglePlacesData } from '@/hooks/useStoredGooglePlaces';

interface EnhancedGooglePlacesInfoProps {
  googleData: StoredGooglePlacesData | null;
  storeName: string;
  fallbackAddress?: string;
}

export const EnhancedGooglePlacesInfo: React.FC<EnhancedGooglePlacesInfoProps> = ({ 
  googleData, 
  storeName,
  fallbackAddress 
}) => {
  const isMobile = useIsMobile();
  const [hoursOpen, setHoursOpen] = useState(!isMobile);

  if (!googleData) {
    return null;
  }

  const formatPhoneNumber = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    return {
      display: phone,
      tel: cleanPhone
    };
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-3.5 w-3.5 ${
              star <= Math.round(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const getPriceLevel = () => {
    if (!googleData.price_level) return null;
    return '$'.repeat(googleData.price_level);
  };

  const isOpenNow = googleData.opening_hours?.open_now;
  const weekdayText = googleData.opening_hours?.weekday_text || [];

  return (
    <div className="space-y-3 md:space-y-4">
      {/* Combined Business Info Card - Rating, Status, Contact */}
      <Card>
        <CardContent className="p-3 sm:p-4">
          <div className="space-y-3">
            {/* Name & Rating Row */}
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                  <h3 className="font-semibold text-base truncate">
                    {googleData.name || storeName}
                  </h3>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge variant="outline" className="bg-success/10 text-success border-success/20 gap-0.5 text-xs py-0 h-5">
                          <CheckCircle2 className="h-2.5 w-2.5" />
                          Verified
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">Verified by Google Places</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
              {googleData.rating && (
                <div className="flex items-center gap-1 flex-shrink-0">
                  {renderStars(googleData.rating)}
                  <span className="font-medium text-sm">{googleData.rating.toFixed(1)}</span>
                  {googleData.user_ratings_total && (
                    <span className="text-xs text-muted-foreground">({googleData.user_ratings_total})</span>
                  )}
                </div>
              )}
            </div>

            {/* Status Badges */}
            <div className="flex flex-wrap gap-1.5">
              {isOpenNow !== undefined && (
                <Badge variant={isOpenNow ? "default" : "secondary"} className="gap-0.5 text-xs py-0.5 h-5">
                  <Clock className="h-2.5 w-2.5" />
                  {isOpenNow ? 'Open' : 'Closed'}
                </Badge>
              )}
              {getPriceLevel() && (
                <Badge variant="outline" className="text-xs py-0.5 h-5">
                  {getPriceLevel()}
                </Badge>
              )}
              {googleData.business_status === 'OPERATIONAL' && (
                <Badge variant="outline" className="text-green-700 border-green-200 text-xs py-0.5 h-5">
                  Operational
                </Badge>
              )}
            </div>

            {/* Contact Info - Compact */}
            <div className="space-y-2 pt-1 border-t">
              {/* Address */}
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <p className="text-sm text-muted-foreground leading-tight">
                  {googleData.formatted_address || fallbackAddress || 'Address not available'}
                </p>
              </div>

              {/* Phone & Website Row */}
              <div className="flex flex-wrap gap-3">
                {googleData.formatted_phone_number && (
                  <a 
                    href={`tel:${formatPhoneNumber(googleData.formatted_phone_number).tel}`}
                    className="flex items-center gap-1.5 text-sm text-primary hover:underline"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    {googleData.formatted_phone_number}
                  </a>
                )}

                {googleData.website && (
                  <a 
                    href={googleData.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-primary hover:underline"
                  >
                    <Globe className="h-3.5 w-3.5" />
                    Website
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Store Hours - Collapsible on Mobile */}
      {weekdayText.length > 0 && (
        <Card>
          <Collapsible open={hoursOpen} onOpenChange={setHoursOpen}>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors py-3 px-3 sm:px-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Clock className="h-4 w-4" />
                    Hours
                    {isOpenNow !== undefined && (
                      <Badge variant={isOpenNow ? "default" : "secondary"} className="text-xs py-0 h-5">
                        {isOpenNow ? 'Open' : 'Closed'}
                      </Badge>
                    )}
                  </CardTitle>
                  <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${hoursOpen ? 'rotate-180' : ''}`} />
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0 px-3 sm:px-4 pb-3">
                <div className="space-y-1">
                  {weekdayText.map((dayHours, index) => {
                    const [day, hours] = dayHours.split(': ');
                    const isToday = new Date().getDay() === (index === 6 ? 0 : index + 1);
                    
                    return (
                      <div 
                        key={index}
                        className={`flex justify-between py-0.5 text-sm ${
                          isToday ? 'font-medium text-primary bg-primary/5 rounded px-2 -mx-2' : ''
                        }`}
                      >
                        <span className={isToday ? '' : 'text-muted-foreground'}>
                          {day}
                        </span>
                        <span>{hours}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      )}

      {/* Business Categories - Inline badges, hidden on mobile */}
      {googleData.types && googleData.types.length > 0 && (
        <div className="hidden md:block">
          <Card>
            <CardContent className="p-3 sm:p-4">
              <p className="text-xs text-muted-foreground mb-2">Categories</p>
              <div className="flex flex-wrap gap-1.5">
                {googleData.types
                  .filter(type => !['establishment', 'point_of_interest'].includes(type))
                  .slice(0, 5)
                  .map((type) => (
                    <Badge key={type} variant="outline" className="text-xs py-0.5">
                      {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Badge>
                  ))
                }
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
