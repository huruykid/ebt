
import React from 'react';
import { Camera } from 'lucide-react';
import { useYelpBusiness } from '@/hooks/useYelp';
import type { Tables } from '@/integrations/supabase/types';

type Store = Tables<'snap_stores'>;

interface StorePhotosProps {
  photos?: Array<{
    photo_reference: string;
    height: number;
    width: number;
  }>;
  storeName: string;
  store?: Store;
}

export const StorePhotos: React.FC<StorePhotosProps> = ({ storeName, store }) => {
  // Fetch Yelp data to get photos
  const { data: yelpData } = useYelpBusiness(
    store?.store_name || storeName,
    store?.latitude || 0,
    store?.longitude || 0,
    !!(store?.latitude && store?.longitude)
  );

  // Use Yelp photo if available
  const photoUrl = yelpData?.image_url;

  if (photoUrl) {
    return (
      <div className="h-[20vh] min-h-32 max-h-48 relative overflow-hidden">
        <img 
          src={photoUrl}
          alt={storeName}
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-4">
          <h3 className="text-base font-semibold text-white mb-1">{storeName}</h3>
          <p className="text-xs text-white/90">Photo from Yelp</p>
        </div>
      </div>
    );
  }

  // Fallback design when no photo is available
  return (
    <div className="h-[20vh] min-h-32 max-h-48 bg-gradient-to-r from-green-400 to-blue-500 relative overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
        <div className="text-center text-white">
          <Camera className="h-8 w-8 mx-auto mb-1 opacity-70" />
          <h3 className="text-base font-semibold mb-1">{storeName}</h3>
          <p className="text-xs opacity-90">Store location</p>
        </div>
      </div>
    </div>
  );
};
