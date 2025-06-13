
import React from 'react';
import { Store } from 'lucide-react';

interface StorePhotoProps {
  storeName: string;
  address?: string;
  className?: string;
  storeType?: string | null;
}

// Default store images based on store type or name
const getDefaultStoreImage = (storeType: string | null, storeName: string) => {
  const name = storeName?.toLowerCase() || '';
  const type = storeType?.toLowerCase() || '';
  
  // Chain-specific images
  if (name.includes('pizza hut')) return 'photo-1513104890138-7c749659a591'; // Pizza
  if (name.includes('subway')) return 'photo-1555396273-367ea4eb4db5'; // Sandwich
  if (name.includes('mcdonalds') || name.includes("mcdonald's")) return 'photo-1571091718767-18b5b1457add'; // Burger
  if (name.includes('starbucks')) return 'photo-1461023058943-07fcbe16d735'; // Coffee
  if (name.includes('kfc')) return 'photo-1626645738196-c2a7c87a8f58'; // Fried chicken
  if (name.includes('taco bell')) return 'photo-1565299624946-b28f40a0ca4b'; // Tacos
  
  // Store type based images
  if (type.includes('supermarket') || type.includes('super store')) {
    return 'photo-1556909114-f6e7ad7d3136'; // Grocery store
  }
  if (type.includes('convenience')) {
    return 'photo-1578662996442-48f60103fc96'; // Convenience store
  }
  if (type.includes('grocery')) {
    return 'photo-1542838132-92c53300491e'; // Grocery items
  }
  
  // Default fallback
  return 'photo-1556909114-f6e7ad7d3136'; // Generic store
};

export const StorePhoto: React.FC<StorePhotoProps> = ({ 
  storeName, 
  address, 
  storeType,
  className = "w-full h-32 object-cover rounded-t-lg" 
}) => {
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
