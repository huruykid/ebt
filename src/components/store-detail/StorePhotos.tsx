import React, { useState } from 'react';
import { Camera, Upload, Image, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AddPhotoModal } from './modals/AddPhotoModal';
import { ShareStore } from '@/components/ShareStore';
import { FavoriteButton } from '@/components/FavoriteButton';
import type { Tables } from '@/integrations/supabase/types';

type Store = Tables<'snap_stores'>;

interface StorePhotosProps {
  storeName: string;
  store?: Store;
}

export const StorePhotos: React.FC<StorePhotosProps> = ({ storeName, store }) => {
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleAddPhoto = () => {
    if (!store) {
      console.log('Store data not available');
      return;
    }
    setIsPhotoModalOpen(true);
  };

  return (
    <>
      <div className="relative h-[40vh] min-h-[300px] max-h-[500px] bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 overflow-hidden">
        {/* Navigation Button - Top Left */}
        <div className="absolute top-4 left-4 z-20">
          <Button 
            onClick={() => navigate('/search')} 
            variant="secondary"
            size="icon"
            className="bg-white/90 hover:bg-white shadow-lg backdrop-blur-sm"
          >
            <ArrowLeft className="h-4 w-4 text-foreground" />
          </Button>
        </div>

        {/* Favorite and Share Buttons - Top Right */}
        {store && (
          <div className="absolute top-4 right-4 z-20 flex items-center gap-3">
            <Button
              variant="secondary"
              size="icon"
              className="bg-white/90 hover:bg-white shadow-lg backdrop-blur-sm"
            >
              <FavoriteButton storeId={store.id} variant="icon" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="bg-white/90 hover:bg-white shadow-lg backdrop-blur-sm"
            >
              <ShareStore store={store} variant="icon" />
            </Button>
          </div>
        )}

        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div 
            className="absolute inset-0" 
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              backgroundSize: '60px 60px'
            }}
          />
        </div>
        
        {/* Content Overlay with stronger dark gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/20 flex items-center justify-center">
          <div className="text-center text-white px-4 max-w-2xl">
            {/* Store Icon */}
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full mb-4 border border-white/30">
              <Image className="h-8 w-8" />
            </div>
            
            {/* Store Name */}
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-3 drop-shadow-2xl text-white">
              {storeName}
            </h2>
            
            {/* Photo CTA */}
            <div className="space-y-3">
              <p className="text-sm sm:text-base drop-shadow-lg text-white/90">
                Help the community by adding photos of this store
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                <Button 
                  onClick={handleAddPhoto}
                  size="lg"
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/40 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Upload className="h-5 w-5 mr-2" />
                  Add Photos
                </Button>
                
                <div className="flex items-center gap-2 text-xs sm:text-sm text-white/80 drop-shadow">
                  <Camera className="h-4 w-4" />
                  <span>Earn 10 points for each photo</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-4 left-4 w-8 h-8 border-2 border-white/40 rounded-full" />
        <div className="absolute bottom-4 right-4 w-6 h-6 border-2 border-white/30 rounded-full" />
        <div className="absolute top-1/3 right-8 w-4 h-4 bg-white/30 rounded-full" />
      </div>

      {/* Photo Upload Modal */}
      {store && (
        <AddPhotoModal
          isOpen={isPhotoModalOpen}
          onClose={() => setIsPhotoModalOpen(false)}
          store={store}
        />
      )}
    </>
  );
};
