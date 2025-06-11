
import React, { useState } from 'react';
import { Camera, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useYelpBusiness } from '@/hooks/useYelp';
import { Dialog, DialogContent, DialogClose } from '@/components/ui/dialog';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import type { Tables } from '@/integrations/supabase/types';

type Store = Tables<'snap_stores'>;

interface StorePhotosProps {
  photos?: Array<{
    photo_reference: string;
    height: number;
    width: number;
  }>;
  storeName: string;
  store?: Store;
}

export const StorePhotos: React.FC<StorePhotosProps> = ({ storeName, store }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch Yelp data to get photos
  const { data: yelpData } = useYelpBusiness(
    store?.store_name || storeName,
    store?.latitude || 0,
    store?.longitude || 0,
    !!(store?.latitude && store?.longitude)
  );

  console.log('📸 StorePhotos - Yelp data:', yelpData);

  // Get all available photos from Yelp
  const photos = React.useMemo(() => {
    if (!yelpData) return [];
    
    // Use the photos array from Yelp, which should now include multiple photos
    let allPhotos = [];
    
    if (yelpData.photos && Array.isArray(yelpData.photos) && yelpData.photos.length > 0) {
      allPhotos = [...yelpData.photos];
    } else if (yelpData.image_url) {
      // Fallback to main image if photos array is empty
      allPhotos = [yelpData.image_url];
    }
    
    console.log('📸 All photos compiled:', allPhotos);
    return allPhotos;
  }, [yelpData]);

  const hasPhotos = photos.length > 0;

  console.log('📸 StorePhotos render:', { 
    hasPhotos, 
    photosCount: photos.length, 
    yelpDataExists: !!yelpData 
  });

  const openImageDialog = (index: number) => {
    setSelectedImageIndex(index);
    setIsDialogOpen(true);
  };

  const navigateImage = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
    } else {
      setSelectedImageIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
    }
  };

  if (hasPhotos) {
    return (
      <>
        <div className="h-[20vh] min-h-32 max-h-48 relative overflow-hidden">
          <Carousel className="w-full h-full">
            <CarouselContent className="h-full">
              {photos.map((photoUrl, index) => (
                <CarouselItem key={index} className="h-full">
                  <div 
                    className="h-full cursor-pointer relative group"
                    onClick={() => openImageDialog(index)}
                  >
                    <img 
                      src={photoUrl}
                      alt={`${storeName} - Image ${index + 1}`}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      onError={(e) => {
                        console.error('❌ Image failed to load:', photoUrl);
                        e.currentTarget.style.display = 'none';
                      }}
                      onLoad={() => {
                        console.log('✅ Image loaded successfully:', photoUrl);
                      }}
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-4">
                      <h3 className="text-base font-semibold text-white mb-1">{storeName}</h3>
                      <p className="text-xs text-white/90">
                        Photo {index + 1} of {photos.length} • Yelp
                      </p>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            {photos.length > 1 && (
              <>
                <CarouselPrevious className="left-2" />
                <CarouselNext className="right-2" />
              </>
            )}
          </Carousel>
        </div>

        {/* Full-screen image dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] p-0 bg-black">
            <div className="relative w-full h-full">
              <img
                src={photos[selectedImageIndex]}
                alt={`${storeName} - Image ${selectedImageIndex + 1}`}
                className="w-full h-full object-contain"
              />
              
              {/* Navigation buttons */}
              {photos.length > 1 && (
                <>
                  <button
                    onClick={() => navigateImage('prev')}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    onClick={() => navigateImage('next')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              )}

              {/* Image counter */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                {selectedImageIndex + 1} / {photos.length}
              </div>

              {/* Close button */}
              <DialogClose className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors">
                <X className="h-6 w-6" />
              </DialogClose>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // Fallback design when no photo is available
  return (
    <div className="h-[20vh] min-h-32 max-h-48 bg-gradient-to-r from-green-400 to-blue-500 relative overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
        <div className="text-center text-white">
          <Camera className="h-8 w-8 mx-auto mb-1 opacity-70" />
          <h3 className="text-base font-semibold mb-1">{storeName}</h3>
          <p className="text-xs opacity-90">Store location</p>
        </div>
      </div>
    </div>
  );
};
