
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
          photos.slice(0, 5).map(photo => getGooglePlacesPhotoUrl(photo.photo_reference, 800))
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
      <Card>
        <CardContent className="p-6">
          <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
            <div className="text-center text-gray-500">
              <Camera className="h-12 w-12 mx-auto mb-2" />
              <p className="font-medium">No Photos Available</p>
              <p className="text-sm">Photos will appear here when available</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center animate-pulse">
            <div className="text-center text-gray-500">
              <ImageIcon className="h-12 w-12 mx-auto mb-2" />
              <p className="font-medium">Loading Photos...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (photoUrls.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
            <div className="text-center text-gray-500">
              <Camera className="h-12 w-12 mx-auto mb-2" />
              <p className="font-medium">Photos Unavailable</p>
              <p className="text-sm">Could not load store photos</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <Carousel className="w-full">
          <CarouselContent>
            {photoUrls.map((url, index) => (
              <CarouselItem key={index}>
                <div className="aspect-video relative">
                  <img
                    src={url}
                    alt={`${storeName} - Photo ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          {photoUrls.length > 1 && (
            <>
              <CarouselPrevious />
              <CarouselNext />
            </>
          )}
        </Carousel>
        <div className="mt-2 text-center">
          <p className="text-sm text-gray-500">
            {photoUrls.length} of {photos.length} photos • Powered by Google Places
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
