
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
}

// Default store images based on store type
const getDefaultStoreImage = (storeType: string | null, storeName: string | null) => {
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

export const StorePhotos: React.FC<StorePhotosProps> = ({ storeName, store }) => {
  const [showAddPhotoModal, setShowAddPhotoModal] = useState(false);
  
  const defaultImageId = getDefaultStoreImage(store.Store_Type, store.Store_Name);
  const backgroundImage = `https://images.unsplash.com/${defaultImageId}?auto=format&fit=crop&w=1200&h=400&q=80`;

  return (
    <div 
      className="relative h-64 md:h-80 bg-cover bg-center overflow-hidden"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      {/* Improved overlay for better text readability */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"></div>
      
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
