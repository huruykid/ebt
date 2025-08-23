import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import type { Tables } from '@/integrations/supabase/types';

type Store = Tables<'snap_stores'>;

interface GooglePhoto {
  photo_reference: string;
  photo_url?: string;
  width: number;
  height: number;
}

interface GooglePhotosGalleryProps {
  store: Store;
}

export const GooglePhotosGallery: React.FC<GooglePhotosGalleryProps> = ({ store }) => {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const googlePhotos = (store.google_photos as unknown as GooglePhoto[]) || null;

  if (!googlePhotos || googlePhotos.length === 0) {
    return null;
  }

  const openLightbox = (index: number) => {
    setSelectedPhotoIndex(index);
    setCurrentImageIndex(index);
  };

  const closeLightbox = () => {
    setSelectedPhotoIndex(null);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === googlePhotos.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? googlePhotos.length - 1 : prev - 1
    );
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Store Photos ({googlePhotos.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {googlePhotos.map((photo, index) => (
              <div
                key={index}
                className="aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => openLightbox(index)}
              >
                {photo.photo_url ? (
                  <img
                    src={photo.photo_url}
                    alt={`${store.Store_Name} photo ${index + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted">
                    <span className="text-xs text-muted-foreground">Loading...</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Lightbox Dialog */}
      <Dialog open={selectedPhotoIndex !== null} onOpenChange={closeLightbox}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0">
          {selectedPhotoIndex !== null && (
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 z-10 bg-black/50 hover:bg-black/70 text-white"
                onClick={closeLightbox}
              >
                <X className="h-4 w-4" />
              </Button>

              {googlePhotos.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white"
                    onClick={prevImage}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white"
                    onClick={nextImage}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </>
              )}

              <div className="relative">
                {googlePhotos[currentImageIndex]?.photo_url && (
                  <img
                    src={googlePhotos[currentImageIndex].photo_url}
                    alt={`${store.Store_Name} photo ${currentImageIndex + 1}`}
                    className="w-full max-h-[80vh] object-contain"
                  />
                )}
                
                {googlePhotos.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 rounded-full px-3 py-1">
                    <span className="text-white text-sm">
                      {currentImageIndex + 1} / {googlePhotos.length}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};