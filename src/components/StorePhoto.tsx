
import React from 'react';
import { Store } from 'lucide-react';

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
  
  // Chain-specific images with more variety
  if (name.includes('pizza hut')) return 'photo-1513104890138-7c749659a591'; // Pizza
  if (name.includes('dominos') || name.includes("domino's")) return 'photo-1571066811602-716837d681de'; // Different pizza
  if (name.includes('subway')) return 'photo-1555396273-367ea4eb4db5'; // Sandwich
  if (name.includes('mcdonalds') || name.includes("mcdonald's")) return 'photo-1571091718767-18b5b1457add'; // Burger
  if (name.includes('burger king')) return 'photo-1568901346375-23c9450c58cd'; // Different burger
  if (name.includes('starbucks')) return 'photo-1461023058943-07fcbe16d735'; // Coffee
  if (name.includes('dunkin')) return 'photo-1509042239860-f550ce710b93'; // Different coffee
  if (name.includes('kfc')) return 'photo-1626645738196-c2a7c87a8f58'; // Fried chicken
  if (name.includes('taco bell')) return 'photo-1565299624946-b28f40a0ca4b'; // Tacos
  if (name.includes('chipotle')) return 'photo-1599974579688-8dbdd335c77f'; // Mexican food
  if (name.includes('walmart')) return 'photo-1601598851547-4302969d0f8a'; // Retail store
  if (name.includes('target')) return 'photo-1441986300917-64674bd600d8'; // Different retail
  if (name.includes('cvs') || name.includes('walgreens')) return 'photo-1576671081837-49000212a370'; // Pharmacy
  if (name.includes('7-eleven') || name.includes('circle k')) return 'photo-1578662996442-48f60103fc96'; // Convenience
  
  // Store type based images with more variety
  if (type.includes('supermarket') || type.includes('super store')) {
    const supermarketImages = [
      'photo-1556909114-f6e7ad7d3136', // Main grocery
      'photo-1542838132-92c53300491e', // Produce section
      'photo-1578662996442-48f60103fc96', // Store aisle
      'photo-1601598851547-4302969d0f8a'  // Shopping carts
    ];
    return supermarketImages[Math.floor(Math.abs(hashString(name)) % supermarketImages.length)];
  }
  
  if (type.includes('convenience')) {
    const convenienceImages = [
      'photo-1578662996442-48f60103fc96', // Store front
      'photo-1576671081837-49000212a370', // Interior
      'photo-1441986300917-64674bd600d8'   // Products
    ];
    return convenienceImages[Math.floor(Math.abs(hashString(name)) % convenienceImages.length)];
  }
  
  if (type.includes('grocery')) {
    const groceryImages = [
      'photo-1542838132-92c53300491e', // Fresh produce
      'photo-1556909114-f6e7ad7d3136', // Store interior
      'photo-1584464491033-06628f3a6b7b'  // Shopping basket
    ];
    return groceryImages[Math.floor(Math.abs(hashString(name)) % groceryImages.length)];
  }
  
  // Generic fallback with variety
  const genericImages = [
    'photo-1556909114-f6e7ad7d3136', // Generic store 1
    'photo-1441986300917-64674bd600d8', // Generic store 2
    'photo-1578662996442-48f60103fc96', // Generic store 3
    'photo-1542838132-92c53300491e'   // Generic store 4
  ];
  return genericImages[Math.floor(Math.abs(hashString(name)) % genericImages.length)];
};

// Simple hash function to ensure consistent image selection for same store
const hashString = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash;
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
