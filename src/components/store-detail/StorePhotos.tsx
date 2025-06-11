
import React from 'react';
import { Camera, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Tables } from '@/integrations/supabase/types';

type Store = Tables<'snap_stores'>;

interface StorePhotosProps {
  storeName: string;
  store?: Store;
}

export const StorePhotos: React.FC<StorePhotosProps> = ({ storeName }) => {
  // Placeholder for future user-generated photos functionality
  const handleAddPhoto = () => {
    // TODO: Implement photo upload functionality
    console.log('Photo upload functionality coming soon');
  };

  return (
    <div className="h-[20vh] min-h-32 max-h-48 bg-gradient-to-r from-green-400 to-blue-500 relative overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
        <div className="text-center text-white">
          <Camera className="h-8 w-8 mx-auto mb-2 opacity-70" />
          <h3 className="text-base font-semibold mb-2">{storeName}</h3>
          <p className="text-xs opacity-90 mb-3">Help the community by adding photos</p>
          <Button 
            onClick={handleAddPhoto}
            size="sm"
            variant="secondary"
            className="bg-white/20 hover:bg-white/30 text-white border-white/30"
          >
            <Upload className="h-4 w-4 mr-2" />
            Add Photo
          </Button>
        </div>
      </div>
    </div>
  );
};
