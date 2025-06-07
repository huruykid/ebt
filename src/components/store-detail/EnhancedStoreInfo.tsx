
import React from 'react';
import { MapPin, Star, Phone, Clock, Globe, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Tables } from '@/integrations/supabase/types';

type Store = Tables<'snap_stores'>;

interface GooglePlacesDetails {
  formatted_phone_number?: string;
  international_phone_number?: string;
  opening_hours?: {
    open_now: boolean;
    weekday_text: string[];
  };
  rating?: number;
  user_ratings_total?: number;
  website?: string;
  business_status?: string;
}

interface EnhancedStoreInfoProps {
  store: Store;
  googlePlacesData?: GooglePlacesDetails | null;
}

export const EnhancedStoreInfo: React.FC<EnhancedStoreInfoProps> = ({ 
  store, 
  googlePlacesData 
}) => {
  const formatAddress = () => {
    const parts = [
      store.store_street_address,
      store.additional_address,
      store.city,
      store.state,
      store.zip_code
    ].filter(Boolean);
    
    return parts.join(', ');
  };

  const formatPhoneNumber = (phone: string) => {
    // Simple phone number formatting
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    }
    return phone;
  };

  const isBusinessOpen = googlePlacesData?.opening_hours?.open_now;
  const businessStatus = googlePlacesData?.business_status;

  // Check if store participates in Restaurant Meals Program (RMP)
  const participatesInRMP = store.incentive_program?.toLowerCase().includes('restaurant meals program') || 
                           store.incentive_program?.toLowerCase().includes('rmp');

  return (
    <div className="space-y-6">
      {/* Address */}
      <Card>
        <CardHeader>
          <CardTitle>Address</CardTitle>
        </CardHeader>
        <CardContent>
          {formatAddress() ? (
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-gray-900">{formatAddress()}</p>
                {(!store.store_street_address || !store.city) && (
                  <p className="text-amber-600 text-sm mt-1">
                    ⚠️ Address information may be incomplete
                  </p>
                )}
              </div>
            </div>
          ) : (
            <p className="text-gray-500">Address not available</p>
          )}
        </CardContent>
      </Card>

      {/* Contact Information */}
      {googlePlacesData && (
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {googlePlacesData.formatted_phone_number && (
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-gray-900 font-medium">Phone</p>
                  <a 
                    href={`tel:${googlePlacesData.formatted_phone_number}`}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {formatPhoneNumber(googlePlacesData.formatted_phone_number)}
                  </a>
                </div>
              </div>
            )}

            {googlePlacesData.website && (
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-gray-900 font-medium">Website</p>
                  <a 
                    href={googlePlacesData.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Visit Website
                  </a>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Business Hours */}
      {googlePlacesData?.opening_hours && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Hours
              {isBusinessOpen !== undefined && (
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                  isBusinessOpen 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  <div className={`h-2 w-2 rounded-full ${
                    isBusinessOpen ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                  {isBusinessOpen ? 'Open Now' : 'Closed'}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {googlePlacesData.opening_hours.weekday_text.map((day, index) => (
                <p key={index} className="text-sm text-gray-600">
                  {day}
                </p>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Google Rating */}
      {googlePlacesData?.rating && (
        <Card>
          <CardHeader>
            <CardTitle>Google Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star} 
                    className={`h-4 w-4 ${
                      star <= (googlePlacesData.rating || 0)
                        ? 'text-yellow-400 fill-current' 
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="font-medium">{googlePlacesData.rating.toFixed(1)}</span>
              {googlePlacesData.user_ratings_total && (
                <span className="text-gray-500 text-sm">
                  ({googlePlacesData.user_ratings_total} reviews)
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600">Based on Google Reviews</p>
          </CardContent>
        </Card>
      )}

      {/* EBT & SNAP Information */}
      <Card>
        <CardHeader>
          <CardTitle>EBT & SNAP Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium text-green-700">EBT/SNAP Accepted</span>
          </div>
          
          {store.incentive_program && (
            <div className="flex items-start gap-3">
              <Star className="h-5 w-5 text-yellow-500 mt-0.5" />
              <div>
                <p className="text-gray-900 font-medium">Incentive Program</p>
                <p className="text-gray-600">{store.incentive_program}</p>
              </div>
            </div>
          )}

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">EBT Usage Notes</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              {participatesInRMP ? (
                <li>• <span className="font-medium">Hot Meals Available:</span> This location participates in the Restaurant Meals Program (RMP)</li>
              ) : (
                <li>• Hot Meals: Check with store for availability</li>
              )}
              <li>• Double value programs: Check incentive details above</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Store Details */}
      <Card>
        <CardHeader>
          <CardTitle>Store Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {businessStatus && (
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">
                Business Status: {businessStatus.replace('_', ' ').toUpperCase()}
              </span>
            </div>
          )}

          {store.grantee_name && (
            <div>
              <p className="text-sm font-medium text-gray-500">Operated by</p>
              <p className="text-gray-900">{store.grantee_name}</p>
            </div>
          )}
          
          {store.county && (
            <div>
              <p className="text-sm font-medium text-gray-500">County</p>
              <p className="text-gray-900">{store.county}</p>
            </div>
          )}
          
          <div>
            <p className="text-sm font-medium text-gray-500">Store ID</p>
            <p className="text-gray-900">{store.id}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
