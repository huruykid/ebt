import React, { useState } from 'react';
import { Store } from 'lucide-react';
import { getBrandLogo } from '@/utils/brandLogos';

interface StorePhotoProps {
  storeName: string;
  address?: string;
  className?: string;
  storeType?: string | null;
}

// Expanded store images with more variety and better matching
const getDefaultStoreImage = (storeType: string | null, storeName: string) => {
  const name = storeName?.toLowerCase() || '';
  const type = storeType?.toLowerCase() || '';
  
  // Store type based images with more variety
  if (type.includes('supermarket') || type.includes('super store')) {
    const supermarketImages = [
      'photo-1556909114-f6e7ad7d3136',
      'photo-1542838132-92c53300491e',
      'photo-1578662996442-48f60103fc96',
      'photo-1601598851547-4302969d0f8a'
    ];
    return supermarketImages[Math.floor(Math.abs(hashString(name)) % supermarketImages.length)];
  }
  
  if (type.includes('convenience')) {
    const convenienceImages = [
      'photo-1578662996442-48f60103fc96',
      'photo-1576671081837-49000212a370',
      'photo-1441986300917-64674bd600d8'
    ];
    return convenienceImages[Math.floor(Math.abs(hashString(name)) % convenienceImages.length)];
  }
  
  if (type.includes('grocery')) {
    const groceryImages = [
      'photo-1542838132-92c53300491e',
      'photo-1556909114-f6e7ad7d3136',
      'photo-1584464491033-06628f3a6b7b'
    ];
    return groceryImages[Math.floor(Math.abs(hashString(name)) % groceryImages.length)];
  }
  
  // Generic fallback with variety
  const genericImages = [
    'photo-1556909114-f6e7ad7d3136',
    'photo-1441986300917-64674bd600d8',
    'photo-1578662996442-48f60103fc96',
    'photo-1542838132-92c53300491e'
  ];
  return genericImages[Math.floor(Math.abs(hashString(name)) % genericImages.length)];
};

// Simple hash function to ensure consistent image selection for same store
const hashString = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash;
};

export const StorePhoto: React.FC<StorePhotoProps> = ({ 
  storeName, 
  address, 
  storeType,
  className = "w-full h-32 object-cover rounded-t-lg" 
}) => {
  const [logoError, setLogoError] = useState(false);
  
  // Check if this is a known brand
  const brandInfo = getBrandLogo(storeName);
  
  // If it's a known brand and logo hasn't errored, show the brand logo
  if (brandInfo && !logoError) {
    return (
      <div 
        className={`${className} bg-white flex items-center justify-center p-3`}
      >
        <img
          src={brandInfo.logoUrl}
          alt={`${storeName} logo`}
          className="max-h-20 max-w-24 object-contain"
          onError={() => setLogoError(true)}
          loading="lazy"
        />
      </div>
    );
  }
  
  // Fallback to Unsplash image
  const defaultImageId = getDefaultStoreImage(storeType, storeName);
  const imageUrl = `https://images.unsplash.com/${defaultImageId}?auto=format&fit=crop&w=400&h=200&q=80`;
  
  return (
    <div 
      className={`${className} bg-cover bg-center relative overflow-hidden`}
      style={{ backgroundImage: `url(${imageUrl})` }}
    >
      {/* Overlay for better text visibility */}
      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
        <div className="text-center text-white">
          <Store className="h-6 w-6 mx-auto mb-1 drop-shadow-lg" />
          <span className="text-xs font-medium drop-shadow-lg">{storeName}</span>
        </div>
      </div>
    </div>
  );
};
