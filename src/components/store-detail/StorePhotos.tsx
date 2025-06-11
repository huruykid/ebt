
import React from 'react';
import { Camera, Upload, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useContributionTracking } from '@/hooks/useContributionTracking';
import type { Tables } from '@/integrations/supabase/types';

type Store = Tables<'snap_stores'>;

interface StorePhotosProps {
  storeName: string;
  store?: Store;
}

export const StorePhotos: React.FC<StorePhotosProps> = ({ storeName, store }) => {
  const { trackContribution } = useContributionTracking();

  const handleAddPhoto = () => {
    // TODO: Implement photo upload functionality
    console.log('Photo upload functionality coming soon');
    
    // Track the contribution when photo is added
    if (store) {
      trackContribution('store_photo', store.id);
    }
  };

  return (
    <div className="relative h-[40vh] min-h-[300px] max-h-[500px] bg-gradient-to-br from-primary/20 via-primary/10 to-secondary/20 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px'
        }} />
      </div>
      
      {/* Content Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent flex items-center justify-center">
        <div className="text-center text-white px-4 max-w-2xl">
          {/* Store Icon */}
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full mb-4">
            <Image className="h-8 w-8" />
          </div>
          
          {/* Store Name */}
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-3 drop-shadow-lg">
            {storeName}
          </h2>
          
          {/* Photo CTA */}
          <div className="space-y-3">
            <p className="text-sm sm:text-base opacity-90 drop-shadow">
              Help the community by adding photos of this store
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <Button 
                onClick={handleAddPhoto}
                size="lg"
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white shadow-lg"
              >
                <Upload className="h-5 w-5 mr-2" />
                Add Photos
              </Button>
              
              <div className="flex items-center gap-2 text-xs sm:text-sm opacity-75">
                <Camera className="h-4 w-4" />
                <span>Earn 10 points for each photo</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Decorative Elements */}
      <div className="absolute top-4 left-4 w-8 h-8 border-2 border-white/30 rounded-full opacity-60" />
      <div className="absolute bottom-4 right-4 w-6 h-6 border-2 border-white/20 rounded-full opacity-40" />
      <div className="absolute top-1/3 right-8 w-4 h-4 bg-white/20 rounded-full opacity-50" />
    </div>
  );
};
