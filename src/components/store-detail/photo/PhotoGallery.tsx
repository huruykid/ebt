import React, { useState, useEffect } from 'react';
import { APP_CONFIG } from '@/constants/app';
import { GooglePlacesService } from '@/services/googlePlaces';
import type { Tables } from '@/integrations/supabase/types';

type Store = Tables<'snap_stores'>;

interface Photo {
  id: string;
  url: string;
  source: 'google' | 'community';
  caption?: string;
  photo_reference?: string;
}

interface PhotoGalleryProps {
  store: Store;
  storeName: string;
}

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({ store, storeName }) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState<string>('');
  const [loadingPhotos, setLoadingPhotos] = useState<Set<string>>(new Set());

  // Parse Google Places photos
  const getGooglePhotos = (): Photo[] => {
    if (!store.google_photos) return [];
    
    try {
      const photos = JSON.parse(store.google_photos as string);
      return Array.isArray(photos) ? photos.map((photo, index) => ({
        id: `google-${index}`,
        url: '', // Will be loaded dynamically
        source: 'google' as const,
        photo_reference: photo.photo_reference,
        caption: `${storeName} - Photo ${index + 1}`
      })) : [];
    } catch (error) {
      console.warn('Error parsing Google photos:', error);
      return [];
    }
  };

  const googlePhotos = getGooglePhotos();
  const allPhotos = [...googlePhotos]; // Add community photos here when implemented
  
  // Load photo URL effect
  useEffect(() => {
    const loadCurrentPhoto = async () => {
      const photo = allPhotos[currentPhotoIndex];
      if (photo && photo.source === 'google' && photo.photo_reference) {
        setLoadingPhotos(prev => new Set(prev).add(photo.id));
        
        try {
          const url = await GooglePlacesService.getPhotoUrl(
            photo.photo_reference, 
            APP_CONFIG.IMAGE_SETTINGS.DEFAULT_MAX_WIDTH
          );
          setCurrentPhotoUrl(url || getPlaceholderUrl(photo));
        } catch (error) {
          console.error('Error loading photo:', error);
          setCurrentPhotoUrl(getPlaceholderUrl(photo));
        } finally {
          setLoadingPhotos(prev => {
            const newSet = new Set(prev);
            newSet.delete(photo.id);
            return newSet;
          });
        }
      } else {
        setCurrentPhotoUrl(getPlaceholderUrl(photo));
      }
    };

    if (allPhotos.length > 0) {
      loadCurrentPhoto();
    }
  }, [currentPhotoIndex, allPhotos, storeName]);

  const getPlaceholderUrl = (photo: Photo): string => {
    return `https://via.placeholder.com/${APP_CONFIG.IMAGE_SETTINGS.DEFAULT_MAX_WIDTH}x400/4f46e5/ffffff?text=${encodeURIComponent(photo.caption || storeName)}`;
  };

  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev + 1) % allPhotos.length);
  };

  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev - 1 + allPhotos.length) % allPhotos.length);
  };

  const currentPhoto = allPhotos[currentPhotoIndex];
  
  if (allPhotos.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      {/* Main Photo Display */}
      <div className="relative h-64 md:h-80 bg-cover bg-center overflow-hidden rounded-lg">
        <img
          src={currentPhotoUrl || getPlaceholderUrl(currentPhoto)}
          alt={currentPhoto.caption || storeName}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        
        {/* Loading indicator */}
        {loadingPhotos.has(currentPhoto.id) && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        )}

        {/* Navigation Controls */}
        {allPhotos.length > 1 && (
          <>
            <button
              onClick={prevPhoto}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur-sm transition-colors z-10"
              aria-label="Previous photo"
            >
              ←
            </button>
            <button
              onClick={nextPhoto}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur-sm transition-colors z-10"
              aria-label="Next photo"
            >
              →
            </button>
          </>
        )}

        {/* Photo Indicators */}
        {allPhotos.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {allPhotos.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPhotoIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentPhotoIndex 
                    ? 'bg-white' 
                    : 'bg-white/50 hover:bg-white/75'
                }`}
                aria-label={`Go to photo ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Photo Source Indicator */}
        <div className="absolute top-4 right-4 bg-black/50 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
          Photo {currentPhotoIndex + 1} of {allPhotos.length}
          {currentPhoto.source === 'google' && ' • Google Places'}
        </div>
      </div>
    </div>
  );
};