
import React from 'react';
import { MapPin, Store, Star } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type Store = Tables<'snap_stores'>;

interface StoreCardProps {
  store: Store;
}

export const StoreCard: React.FC<StoreCardProps> = ({ store }) => {
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

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {store.store_name}
          </h3>
          {store.store_type && (
            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStoreTypeColor(store.store_type)}`}>
              {store.store_type}
            </span>
          )}
        </div>
        <Store className="h-6 w-6 text-gray-400 ml-2" />
      </div>

      <div className="space-y-2">
        {formatAddress() && (
          <div className="flex items-start gap-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4 mt-0.5 text-gray-400 flex-shrink-0" />
            <span>{formatAddress()}</span>
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

      {store.latitude && store.longitude && (
        <div className="mt-4 pt-3 border-t border-gray-200">
          <button
            onClick={() => {
              const url = `https://www.google.com/maps/search/?api=1&query=${store.latitude},${store.longitude}`;
              window.open(url, '_blank');
            }}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            View on Map →
          </button>
        </div>
      )}
    </div>
  );
};
