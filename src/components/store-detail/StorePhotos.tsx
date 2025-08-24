import React, { useState } from 'react';
import { Camera, Share } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ShareStore } from '@/components/ShareStore';
import { AddPhotoModal } from './modals/AddPhotoModal';
import { PhotoGallery } from './photo/PhotoGallery';
import { getDefaultStoreImageUrl } from './photo/DefaultStoreImage';
import type { Tables } from '@/integrations/supabase/types';

type Store = Tables<'snap_stores'>;

interface StorePhotosProps {
  storeName: string;
  store: Store;
  onHoursAdded?: (hours: Record<string, { open: string; close: string; closed: boolean }>) => void;
}

export const StorePhotos: React.FC<StorePhotosProps> = ({ storeName, store, onHoursAdded }) => {
  const [showAddPhotoModal, setShowAddPhotoModal] = useState(false);
  
  // Check if we have Google Places photos
  const hasGooglePhotos = store.google_photos && JSON.parse(store.google_photos as string || '[]').length > 0;
  
  const defaultBackgroundImage = getDefaultStoreImageUrl(store.Store_Type, store.Store_Name);

  return (
    <div 
      className="relative h-64 md:h-80 bg-cover bg-center overflow-hidden"
      style={{ backgroundImage: `url(${defaultBackgroundImage})` }}
    >
      {/* Improved overlay for better text readability */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"></div>
      
      {/* Google Places Photo Gallery Overlay */}
      {hasGooglePhotos && (
        <div className="absolute inset-0">
          <PhotoGallery store={store} storeName={storeName} />
        </div>
      )}
      
      {/* Content overlay with better contrast */}
      <div className="absolute inset-0 flex items-center justify-center text-white">
        <div className="text-center px-4 max-w-4xl mx-auto">
          {/* Store name with improved typography */}
          <h1 className="text-3xl md:text-5xl font-bold mb-2 text-white drop-shadow-2xl leading-tight">
            {storeName}
          </h1>
          
          {/* Store type with better visibility */}
          {store.Store_Type && (
            <p className="text-lg md:text-xl text-white/90 mb-6 font-medium drop-shadow-xl">
              {store.Store_Type}
            </p>
          )}
          
          {/* Action buttons with better styling */}
          <div className="flex flex-wrap gap-3 justify-center">
            <Button
              onClick={() => setShowAddPhotoModal(true)}
              className="bg-white/20 hover:bg-white/30 text-white border border-white/20 backdrop-blur-sm transition-all duration-200 hover:scale-105"
            >
              <Camera className="h-4 w-4 mr-2" />
              Add Photo
            </Button>
            
          <ShareStore 
            store={store}
            variant="button"
            className="bg-white/20 hover:bg-white/30 text-white border border-white/20 backdrop-blur-sm transition-all duration-200 hover:scale-105"
          />
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddPhotoModal
        isOpen={showAddPhotoModal}
        onClose={() => setShowAddPhotoModal(false)}
        store={store}
      />
    </div>
  );
};