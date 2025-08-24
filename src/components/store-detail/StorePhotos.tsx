import React, { useState } from 'react';
import { Camera, Share } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ShareStore } from '@/components/ShareStore';
import { AddPhotoModal } from './modals/AddPhotoModal';
import type { Tables } from '@/integrations/supabase/types';

type Store = Tables<'snap_stores'>;

interface StorePhotosProps {
  storeName: string;
  store: Store;
  onHoursAdded?: (hours: Record<string, { open: string; close: string; closed: boolean }>) => void;
}

// Improved store images with more variety and better matching
const getDefaultStoreImage = (storeType: string | null, storeName: string | null) => {
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

export const StorePhotos: React.FC<StorePhotosProps> = ({ storeName, store, onHoursAdded }) => {
  const [showAddPhotoModal, setShowAddPhotoModal] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  
  // Parse Google Places photos
  const getGooglePhotos = () => {
    if (!store.google_photos) return [];
    
    try {
      const photos = JSON.parse(store.google_photos as string);
      return Array.isArray(photos) ? photos : [];
    } catch (error) {
      console.warn('Error parsing Google photos:', error);
      return [];
    }
  };

  const googlePhotos = getGooglePhotos();
  const hasGooglePhotos = googlePhotos.length > 0;
  
  const defaultImageId = getDefaultStoreImage(store.Store_Type, store.Store_Name);
  const defaultBackgroundImage = `https://images.unsplash.com/${defaultImageId}?auto=format&fit=crop&w=1200&h=400&q=80`;
  
  // Generate Google Places Photo API URL from photo_reference
  const getCurrentBackgroundImage = () => {
    if (hasGooglePhotos && googlePhotos[currentPhotoIndex]) {
      const photo = googlePhotos[currentPhotoIndex];
      if (photo.photo_url) {
        // Use the direct photo URL if available
        return photo.photo_url;
      } else if (photo.photo_reference) {
        // Use our edge function to serve Google Places photos
        const supabaseUrl = 'https://vpnaaaocqqmkslwqrkyd.supabase.co';
        return `${supabaseUrl}/functions/v1/google-places-photo?photo_reference=${photo.photo_reference}&maxwidth=1200&maxheight=400`;
      }
    }
    return defaultBackgroundImage;
  };

  const nextPhoto = () => {
    if (hasGooglePhotos) {
      setCurrentPhotoIndex((prev) => (prev + 1) % googlePhotos.length);
    }
  };

  const prevPhoto = () => {
    if (hasGooglePhotos) {
      setCurrentPhotoIndex((prev) => (prev - 1 + googlePhotos.length) % googlePhotos.length);
    }
  };

  return (
    <div 
      className="relative h-64 md:h-80 bg-cover bg-center overflow-hidden"
      style={{ backgroundImage: `url(${getCurrentBackgroundImage()})` }}
    >
      {/* Improved overlay for better text readability */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"></div>
      
      {/* Photo navigation for Google Photos */}
      {hasGooglePhotos && googlePhotos.length > 1 && (
        <>
          <button
            onClick={prevPhoto}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full backdrop-blur-sm transition-colors z-10"
            aria-label="Previous photo"
          >
            ←
          </button>
          <button
            onClick={nextPhoto}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full backdrop-blur-sm transition-colors z-10"
            aria-label="Next photo"
          >
            →
          </button>
          
          {/* Photo indicators */}
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {googlePhotos.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPhotoIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentPhotoIndex 
                    ? 'bg-white' 
                    : 'bg-white/50 hover:bg-white/75'
                }`}
                aria-label={`Go to photo ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
      
      {/* Photo source indicator */}
      {hasGooglePhotos && (
        <div className="absolute top-4 right-4 bg-black/50 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
          Photo {currentPhotoIndex + 1} of {googlePhotos.length} • Google Places
        </div>
      )}
      
      {/* Content overlay with better contrast */}
      <div className="absolute inset-0 flex items-center justify-center text-white">
        <div className="text-center space-y-4 px-4">
          <h1 className="text-2xl md:text-4xl font-bold drop-shadow-lg text-white [text-shadow:_2px_2px_4px_rgb(0_0_0_/_80%)]">
            {storeName}
          </h1>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              onClick={() => setShowAddPhotoModal(true)}
              variant="secondary"
              className="bg-white/95 text-gray-900 hover:bg-white font-medium shadow-lg"
            >
              <Camera className="h-4 w-4 mr-2" />
              Add Photos
            </Button>
            <ShareStore 
              store={store}
              variant="button"
              className="bg-white/20 text-white border-white/40 hover:bg-white/30 hover:text-white shadow-lg backdrop-blur-sm font-medium"
            />
          </div>
        </div>
      </div>

      <AddPhotoModal
        isOpen={showAddPhotoModal}
        onClose={() => setShowAddPhotoModal(false)}
        store={store}
      />
    </div>
  );
};
