
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from '@/components/ui/carousel';
import { Camera, Image as ImageIcon } from 'lucide-react';
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
      <div className="h-32 bg-gradient-to-r from-green-400 to-blue-500 relative">
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
      <div className="h-32 bg-gray-100 relative">
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
      <div className="h-32 bg-gradient-to-r from-gray-400 to-gray-600 relative">
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
    <div className="relative h-32 bg-black">
      <Carousel className="w-full h-full">
        <CarouselContent className="h-full">
          {photoUrls.map((url, index) => (
            <CarouselItem key={index} className="h-full">
              <div className="relative h-full">
                <img
                  src={url}
                  alt={`${storeName} - Photo ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                {/* Overlay gradient for better text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
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
  );
};
