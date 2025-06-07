
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from '@/components/ui/carousel';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Camera, Image as ImageIcon, X, ArrowLeft, ArrowRight } from 'lucide-react';
import { getGooglePlacesPhotoUrl } from '@/hooks/useGooglePlaces';

interface StorePhotosProps {
  photos?: Array<{
    photo_reference: string;
    height: number;
    width: number;
  }>;
  storeName: string;
}

export const StorePhotos: React.FC<StorePhotosProps> = ({ photos, storeName }) => {
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  useEffect(() => {
    const loadPhotos = async () => {
      if (!photos || photos.length === 0) return;

      setLoading(true);
      try {
        const urls = await Promise.all(
          photos.slice(0, 5).map(photo => getGooglePlacesPhotoUrl(photo.photo_reference, 1200))
        );
        setPhotoUrls(urls.filter(url => url !== null) as string[]);
      } catch (error) {
        console.error('Failed to load store photos:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPhotos();
  }, [photos]);

  if (!photos || photos.length === 0) {
    return (
      <div className="h-[20vh] min-h-32 max-h-48 bg-gradient-to-r from-green-400 to-blue-500 relative overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
          <div className="text-center text-white">
            <Camera className="h-8 w-8 mx-auto mb-1 opacity-70" />
            <h3 className="text-base font-semibold mb-1">No Photos Available</h3>
            <p className="text-xs opacity-90">Photos will appear here when available</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="h-[20vh] min-h-32 max-h-48 bg-gray-100 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center animate-pulse">
          <div className="text-center text-gray-500">
            <ImageIcon className="h-8 w-8 mx-auto mb-1" />
            <p className="text-sm font-medium">Loading Photos...</p>
          </div>
        </div>
      </div>
    );
  }

  if (photoUrls.length === 0) {
    return (
      <div className="h-[20vh] min-h-32 max-h-48 bg-gradient-to-r from-gray-400 to-gray-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
          <div className="text-center text-white">
            <Camera className="h-8 w-8 mx-auto mb-1 opacity-70" />
            <h3 className="text-base font-semibold mb-1">Photos Unavailable</h3>
            <p className="text-xs opacity-90">Could not load store photos</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="relative h-[20vh] min-h-32 max-h-48 bg-black overflow-hidden">
        <Carousel className="w-full h-full">
          <CarouselContent className="h-full">
            {photoUrls.map((url, index) => (
              <CarouselItem key={index} className="h-full">
                <div className="relative h-full cursor-pointer" onClick={() => setSelectedImageIndex(index)}>
                  <img
                    src={url}
                    alt={`${storeName} - Photo ${index + 1}`}
                    className="w-full h-full object-cover"
                    style={{ 
                      objectFit: 'cover',
                      objectPosition: 'center'
                    }}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  {/* Overlay gradient for better text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  {/* Click indicator */}
                  <div className="absolute inset-0 hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
                    <div className="bg-black/50 text-white px-3 py-2 rounded-full text-sm font-medium">
                      Click to expand
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          {photoUrls.length > 1 && (
            <>
              <CarouselPrevious className="left-4" />
              <CarouselNext className="right-4" />
            </>
          )}
        </Carousel>
        
        {/* Photo counter overlay */}
        <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded-full text-xs">
          {photoUrls.length} of {photos.length} photos
        </div>
        
        {/* Google Places attribution */}
        <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded-full text-xs">
          Powered by Google Places
        </div>
      </div>

      {/* Full-size image modal */}
      {selectedImageIndex !== null && (
        <Dialog open={selectedImageIndex !== null} onOpenChange={() => setSelectedImageIndex(null)}>
          <DialogContent className="max-w-4xl w-full h-[90vh] p-0 bg-black">
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                src={photoUrls[selectedImageIndex]}
                alt={`${storeName} - Photo ${selectedImageIndex + 1}`}
                className="max-w-full max-h-full object-contain"
              />
              <button
                onClick={() => setSelectedImageIndex(null)}
                className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
              
              {/* Navigation in modal */}
              {photoUrls.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImageIndex(selectedImageIndex > 0 ? selectedImageIndex - 1 : photoUrls.length - 1);
                    }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImageIndex(selectedImageIndex < photoUrls.length - 1 ? selectedImageIndex + 1 : 0);
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                  >
                    <ArrowRight className="h-5 w-5" />
                  </button>
                </>
              )}
              
              {/* Image counter in modal */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-2 rounded-full text-sm">
                {selectedImageIndex + 1} of {photoUrls.length}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};
