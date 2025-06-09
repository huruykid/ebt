import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Store, Star, ExternalLink } from 'lucide-react';
import { StorePhoto } from './StorePhoto';
import { FavoriteButton } from './FavoriteButton';
import { StoreRatingDisplay } from './reviews/StoreRatingDisplay';
import { useStoreClickTracking } from '@/hooks/useStoreClickTracking';
import { useGeolocation } from '@/hooks/useGeolocation';
import type { Tables } from '@/integrations/supabase/types';

type Store = Tables<'snap_stores'>;

interface StoreCardProps {
  store: Store & { distance?: number };
}

export const StoreCard: React.FC<StoreCardProps> = ({ store }) => {
  const { trackStoreClick } = useStoreClickTracking();
  const { latitude, longitude } = useGeolocation();

  const handleStoreClick = () => {
    if (latitude && longitude) {
      trackStoreClick(store.id, latitude, longitude);
    }
  };

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

  const getStoreTypeIcon = (type: string | null) => {
    const lowerType = type?.toLowerCase() || '';
    
    if (lowerType.includes('supermarket') || lowerType.includes('grocery') || lowerType.includes('supercenter')) {
      return '🏪';
    }
    if (lowerType.includes('restaurant') || lowerType.includes('fast food')) {
      return '🍔';
    }
    if (lowerType.includes('cafeteria')) {
      return '🍽️';
    }
    if (lowerType.includes('bakery')) {
      return '🥖';
    }
    if (lowerType.includes('convenience') || lowerType.includes('corner')) {
      return '🏬';
    }
    if (lowerType.includes('dollar') || lowerType.includes('discount')) {
      return '💵';
    }
    
    return '🏪'; // Default icon
  };

  const hasCompleteAddress = store.store_street_address && store.city;
  const fullAddress = formatAddress();

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow overflow-hidden">
      {/* Store Photo */}
      <StorePhoto 
        storeName={store.store_name}
        address={fullAddress}
        className="w-full h-32 object-cover"
      />

      {/* Card Content */}
      <div className="p-6 relative">
        {/* Favorite button - positioned independently */}
        <div className="absolute top-4 right-4">
          <FavoriteButton storeId={store.id} variant="icon" />
        </div>

        <div className="flex items-start justify-between mb-3 pr-12">
          <div className="flex-1">
            <Link 
              to={`/store/${store.id}`}
              onClick={handleStoreClick}
              className="text-lg font-semibold text-gray-900 mb-1 hover:text-blue-600 transition-colors block"
            >
              {store.store_name}
            </Link>
            <div className="flex items-center gap-2 flex-wrap mb-2">
              {store.store_type && (
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStoreTypeColor(store.store_type)}`}>
                  <span className="text-sm">{getStoreTypeIcon(store.store_type)}</span>
                  {store.store_type}
                </span>
              )}
              {store.distance !== undefined && (
                <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                  {store.distance.toFixed(1)} mi
                </div>
              )}
            </div>
            <StoreRatingDisplay storeId={store.id} className="mb-2" />
          </div>
          <Store className="h-6 w-6 text-gray-400 ml-2 flex-shrink-0" />
        </div>

        <div className="space-y-2">
          {fullAddress && (
            <div className="flex items-start gap-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4 mt-0.5 text-gray-400 flex-shrink-0" />
              <div className="flex-1">
                <span>{fullAddress}</span>
                {!hasCompleteAddress && (
                  <div className="text-amber-600 text-xs mt-1">
                    ⚠️ Address may be incomplete
                  </div>
                )}
              </div>
            </div>
          )}

          {store.incentive_program && (
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium text-yellow-700">
                {store.incentive_program}
              </span>
            </div>
          )}

          {store.grantee_name && (
            <div className="text-sm text-gray-500">
              <span className="font-medium">Operated by:</span> {store.grantee_name}
            </div>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-gray-200 flex items-center justify-between">
          <Link
            to={`/store/${store.id}`}
            onClick={handleStoreClick}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
          >
            View Details
            <ExternalLink className="h-3 w-3" />
          </Link>
          
          {store.latitude && store.longitude && (
            <button
              onClick={() => {
                const url = `https://www.google.com/maps/search/?api=1&query=${store.latitude},${store.longitude}`;
                window.open(url, '_blank');
              }}
              className="text-sm text-gray-600 hover:text-gray-800 font-medium"
            >
              View on Map →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
