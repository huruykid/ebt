
import React from 'react';
import { Store, ImageIcon } from 'lucide-react';

interface StorePhotoProps {
  storeName: string;
  address?: string;
  className?: string;
}

export const StorePhoto: React.FC<StorePhotoProps> = ({ 
  storeName, 
  address, 
  className = "w-full h-32 object-cover rounded-t-lg" 
}) => {
  // Since we're moving away from Google Places API, we'll show a fallback design
  // This can be enhanced later with store-specific images or other photo sources
  
  return (
    <div className={`${className} bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center`}>
      <div className="text-center text-gray-500">
        <Store className="h-6 w-6 mx-auto mb-1" />
        <span className="text-xs font-medium">{storeName}</span>
      </div>
    </div>
  );
};
