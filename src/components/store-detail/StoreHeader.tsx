
import React from 'react';
import { Star, MapPin, Phone, Clock, Tag, Globe, Utensils } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Tables } from '@/integrations/supabase/types';

type Store = Tables<'snap_stores'>;

interface GooglePlacesDetails {
  formatted_phone_number?: string;
  opening_hours?: {
    open_now: boolean;
  };
  rating?: number;
  user_ratings_total?: number;
  website?: string;
}

interface StoreHeaderProps {
  store: Store;
  googlePlacesData?: GooglePlacesDetails | null;
}

export const StoreHeader: React.FC<StoreHeaderProps> = ({ store, googlePlacesData }) => {
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

  const getStoreTypeColor = (type: string | null) => {
    switch (type?.toLowerCase()) {
      case 'supermarket':
        return 'bg-green-100 text-green-800';
      case 'convenience store':
        return 'bg-blue-100 text-blue-800';
      case 'grocery store':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const isOpen = googlePlacesData?.opening_hours?.open_now;
  
  // Check if store is enrolled in RMP (Restaurant Meals Program)
  const isRmpEnrolled = store.incentive_program?.toLowerCase().includes('rmp') || 
                       store.incentive_program?.toLowerCase().includes('restaurant meals program');

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{store.store_name}</h1>
            <div className="flex items-center gap-2 mb-3">
              {/* Google rating if available, otherwise placeholder */}
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star} 
                    className={`h-5 w-5 ${
                      googlePlacesData?.rating && star <= googlePlacesData.rating
                        ? 'text-yellow-400 fill-current' 
                        : 'text-gray-300'
                    }`}
                  />
                ))}
                <span className="ml-2 text-gray-600 text-sm">
                  {googlePlacesData?.rating 
                    ? `${googlePlacesData.rating.toFixed(1)} (${googlePlacesData.user_ratings_total || 0} reviews)`
                    : 'No reviews yet'
                  }
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {store.store_type && (
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStoreTypeColor(store.store_type)}`}>
                  {store.store_type}
                </span>
              )}
              {store.incentive_program && (
                <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                  <Star className="h-3 w-3 inline mr-1" />
                  {store.incentive_program}
                </span>
              )}
              <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                <Tag className="h-3 w-3 inline mr-1" />
                EBT Accepted
              </span>
              {isRmpEnrolled && (
                <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                  <Utensils className="h-3 w-3 inline mr-1" />
                  Hot Foods Accepted
                </span>
              )}
              {isOpen !== undefined && (
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  isOpen 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {isOpen ? 'Open Now' : 'Closed'}
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Button variant="outline" size="sm">
              Claim this Business
            </Button>
            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
              Report a Problem
            </Button>
          </div>
        </div>

        {/* Quick Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4 border-t border-gray-200">
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin className="h-4 w-4" />
            <span className="text-sm">{formatAddress() || 'Address not available'}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Phone className="h-4 w-4" />
            <span className="text-sm">
              {googlePlacesData?.formatted_phone_number || 'Phone coming soon'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            {googlePlacesData?.website ? (
              <>
                <Globe className="h-4 w-4" />
                <a 
                  href={googlePlacesData.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Visit Website
                </a>
              </>
            ) : (
              <>
                <Clock className="h-4 w-4" />
                <span className="text-sm">
                  {isOpen !== undefined 
                    ? (isOpen ? 'Open Now' : 'Closed') 
                    : 'Hours coming soon'
                  }
                </span>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
