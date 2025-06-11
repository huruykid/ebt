
import React from 'react';
import { Camera } from 'lucide-react';

interface StorePhotosProps {
  photos?: Array<{
    photo_reference: string;
    height: number;
    width: number;
  }>;
  storeName: string;
}

export const StorePhotos: React.FC<StorePhotosProps> = ({ storeName }) => {
  // Since we're using OSM/Nominatim, photos are not available
  // Show a clean fallback design
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
