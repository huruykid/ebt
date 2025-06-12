import React, { useState } from 'react';
import { Camera, Share } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AddPhotoModal } from './modals/AddPhotoModal';
import type { Tables } from '@/integrations/supabase/types';

type Store = Tables<'snap_stores'>;

interface StorePhotosProps {
  storeName: string;
  store: Store;
}

export const StorePhotos: React.FC<StorePhotosProps> = ({ storeName, store }) => {
  const [showAddPhotoModal, setShowAddPhotoModal] = useState(false);

  return (
    <div className="relative h-64 md:h-80 bg-gradient-to-br from-green-100 to-blue-100 overflow-hidden">
      {/* Background and Gradient Overlay */}
      <div className="absolute inset-0 bg-muted/20 backdrop-blur-sm z-0"></div>
      
      {/* Content overlay */}
      <div className="absolute inset-0 flex items-center justify-center text-white">
        <div className="text-center space-y-4 px-4">
          <h1 className="text-2xl md:text-4xl font-bold drop-shadow-lg">
            {storeName}
          </h1>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              onClick={() => setShowAddPhotoModal(true)}
              variant="secondary"
              className="bg-white/90 text-gray-900 hover:bg-white"
            >
              <Camera className="h-4 w-4 mr-2" />
              Add Photos
            </Button>
            <Button 
              variant="outline" 
              className="border-white text-white hover:bg-white/10"
            >
              <Share className="h-4 w-4 mr-2" />
              Share Store
            </Button>
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
