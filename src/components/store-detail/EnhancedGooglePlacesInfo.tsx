import React from 'react';
import { Phone, Globe, Clock, Star, MapPin, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  if (!googleData) {
    return null;
  }

  const formatPhoneNumber = (phone: string) => {
    // Remove any extra formatting and make it clickable
    const cleanPhone = phone.replace(/\D/g, '');
    return {
      display: phone,
      tel: cleanPhone
    };
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
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
    <div className="space-y-6">
      {/* Business Name & Rating Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl font-bold">
                {googleData.name || storeName}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Verified business information from Google 
                {googleData.cached && <span className="text-yellow-600">• Cached data</span>}
              </p>
            </div>
            <div className="text-right">
              {googleData.rating && (
                <div className="flex items-center gap-2">
                  {renderStars(googleData.rating)}
                  <span className="font-semibold">{googleData.rating.toFixed(1)}</span>
                </div>
              )}
              {googleData.user_ratings_total && (
                <p className="text-sm text-muted-foreground">
                  {googleData.user_ratings_total} reviews
                </p>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {isOpenNow !== undefined && (
              <Badge variant={isOpenNow ? "default" : "secondary"} className="gap-1">
                <Clock className="h-3 w-3" />
                {isOpenNow ? 'Open Now' : 'Closed'}
              </Badge>
            )}
            {getPriceLevel() && (
              <Badge variant="outline">
                Price: {getPriceLevel()}
              </Badge>
            )}
            {googleData.business_status === 'OPERATIONAL' && (
              <Badge variant="outline" className="text-green-700 border-green-200">
                Operational
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Contact & Location */}
      <Card>
        <CardHeader>
          <CardTitle>Contact & Location</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Address */}
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Address</p>
              <p className="text-muted-foreground">
                {googleData.formatted_address || fallbackAddress || 'Address not available'}
              </p>
            </div>
          </div>

          {/* Phone */}
          {googleData.formatted_phone_number && (
            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Phone</p>
                <a 
                  href={`tel:${formatPhoneNumber(googleData.formatted_phone_number).tel}`}
                  className="text-primary hover:underline"
                >
                  {googleData.formatted_phone_number}
                </a>
              </div>
            </div>
          )}

          {/* Website */}
          {googleData.website && (
            <div className="flex items-start gap-3">
              <Globe className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Website</p>
                <a 
                  href={googleData.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline inline-flex items-center gap-1"
                >
                  Visit Website
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Store Hours */}
      {weekdayText.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Store Hours
              {isOpenNow !== undefined && (
                <Badge variant={isOpenNow ? "default" : "secondary"} className="ml-2">
                  {isOpenNow ? 'Open' : 'Closed'}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {weekdayText.map((dayHours, index) => {
                const [day, hours] = dayHours.split(': ');
                const isToday = new Date().getDay() === (index === 6 ? 0 : index + 1); // Adjust for Sunday being 0
                
                return (
                  <div 
                    key={index}
                    className={`flex justify-between py-1 ${
                      isToday ? 'font-semibold bg-primary/10 rounded px-2 -mx-2' : ''
                    }`}
                  >
                    <span className={isToday ? 'text-primary' : 'text-muted-foreground'}>
                      {day}
                    </span>
                    <span className={isToday ? 'text-primary' : ''}>
                      {hours}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Business Categories */}
      {googleData.types && googleData.types.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Business Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {googleData.types
                .filter(type => !['establishment', 'point_of_interest'].includes(type))
                .slice(0, 6) // Limit to prevent overwhelming UI
                .map((type) => (
                  <Badge key={type} variant="outline">
                    {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Badge>
                ))
              }
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};