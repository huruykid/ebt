import React, { useState, useEffect, useCallback } from 'react';
import { Camera, Share, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ShareStore } from '@/components/ShareStore';
import { AddPhotoModal } from './modals/AddPhotoModal';
import { supabase } from '@/integrations/supabase/client';
import { getBrandLogoHighRes, isKnownBrand } from '@/utils/brandLogos';
import type { Tables } from '@/integrations/supabase/types';

type Store = Tables<'snap_stores'>;

interface UserPhoto {
  id: string;
  file_path: string;
  created_at: string;
}

interface StorePhotosProps {
  storeName: string;
  store: Store;
  onHoursAdded?: (hours: Record<string, { open: string; close: string; closed: boolean }>) => void;
}

// Improved store images with more variety and better matching
const getDefaultStoreImage = (storeType: string | null, storeName: string | null) => {
  const name = storeName?.toLowerCase() || '';
  const type = storeType?.toLowerCase() || '';
  
  // Store type based images
  if (type.includes('supermarket') || type.includes('super store')) {
    const supermarketImages = [
      'photo-1556909114-f6e7ad7d3136',
      'photo-1542838132-92c53300491e',
      'photo-1578662996442-48f60103fc96',
      'photo-1601598851547-4302969d0f8a'
    ];
    return supermarketImages[Math.floor(Math.abs(hashString(name)) % supermarketImages.length)];
  }
  
  if (type.includes('convenience')) {
    const convenienceImages = [
      'photo-1578662996442-48f60103fc96',
      'photo-1576671081837-49000212a370',
      'photo-1441986300917-64674bd600d8'
    ];
    return convenienceImages[Math.floor(Math.abs(hashString(name)) % convenienceImages.length)];
  }
  
  if (type.includes('grocery')) {
    const groceryImages = [
      'photo-1542838132-92c53300491e',
      'photo-1556909114-f6e7ad7d3136',
      'photo-1584464491033-06628f3a6b7b'
    ];
    return groceryImages[Math.floor(Math.abs(hashString(name)) % groceryImages.length)];
  }
  
  // Generic fallback
  const genericImages = [
    'photo-1556909114-f6e7ad7d3136',
    'photo-1441986300917-64674bd600d8',
    'photo-1578662996442-48f60103fc96',
    'photo-1542838132-92c53300491e'
  ];
  return genericImages[Math.floor(Math.abs(hashString(name)) % genericImages.length)];
};

// Simple hash function to ensure consistent image selection for same store
const hashString = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash;
};

export const StorePhotos: React.FC<StorePhotosProps> = ({ storeName, store, onHoursAdded }) => {
  const [showAddPhotoModal, setShowAddPhotoModal] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [userPhotos, setUserPhotos] = useState<UserPhoto[]>([]);
  const [photoSource, setPhotoSource] = useState<'google' | 'user'>('google');
  const [logoError, setLogoError] = useState(false);
  
  // Check if this is a known brand
  const isBrand = isKnownBrand(store.Store_Name);
  const brandLogoUrl = getBrandLogoHighRes(store.Store_Name);
  
  // Fetch user-uploaded photos using public view (excludes user_id for privacy)
  const fetchUserPhotos = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('public_store_photos' as any)
        .select('id, file_path, created_at')
        .eq('store_id', store.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setUserPhotos((data as unknown as UserPhoto[]) || []);
    } catch (error) {
      console.error('Error fetching user photos:', error);
    }
  }, [store.id]);

  useEffect(() => {
    fetchUserPhotos();
  }, [fetchUserPhotos]);
  
  // Parse Google Places photos
  const getGooglePhotos = () => {
    if (!store.google_photos) return [];
    
    try {
      const photos = JSON.parse(store.google_photos as string);
      return Array.isArray(photos) ? photos : [];
    } catch (error) {
      console.warn('Error parsing Google photos:', error);
      return [];
    }
  };

  const googlePhotos = getGooglePhotos();
  const hasGooglePhotos = googlePhotos.length > 0;
  const hasUserPhotos = userPhotos.length > 0;
  
  // Determine which photos to show based on source
  const currentPhotos = photoSource === 'google' ? googlePhotos : userPhotos;
  const hasCurrentPhotos = currentPhotos.length > 0;
  
  const defaultImageId = getDefaultStoreImage(store.Store_Type, store.Store_Name);
  const defaultBackgroundImage = `https://images.unsplash.com/${defaultImageId}?auto=format&fit=crop&w=1200&h=400&q=80`;
  
  // Get photo URL based on source
  const getPhotoUrl = (index: number) => {
    if (photoSource === 'user' && userPhotos[index]) {
      const { data: { publicUrl } } = supabase.storage
        .from('store-photos')
        .getPublicUrl(userPhotos[index].file_path);
      return publicUrl;
    }
    
    if (photoSource === 'google' && googlePhotos[index]) {
      const photo = googlePhotos[index];
      if (photo.photo_url) {
        return photo.photo_url;
      } else if (photo.photo_reference) {
        const supabaseUrl = 'https://vpnaaaocqqmkslwqrkyd.supabase.co';
        return `${supabaseUrl}/functions/v1/google-places-photo?photo_reference=${photo.photo_reference}&maxwidth=1200&maxheight=400`;
      }
    }
    
    return defaultBackgroundImage;
  };

  const getCurrentBackgroundImage = () => {
    if (hasCurrentPhotos && currentPhotoIndex < currentPhotos.length) {
      return getPhotoUrl(currentPhotoIndex);
    }
    return defaultBackgroundImage;
  };

  const nextPhoto = () => {
    if (hasCurrentPhotos) {
      setCurrentPhotoIndex((prev) => (prev + 1) % currentPhotos.length);
    }
  };

  const prevPhoto = () => {
    if (hasCurrentPhotos) {
      setCurrentPhotoIndex((prev) => (prev - 1 + currentPhotos.length) % currentPhotos.length);
    }
  };

  const handlePhotoUploaded = () => {
    fetchUserPhotos();
    // Switch to user photos to show the new upload
    setPhotoSource('user');
    setCurrentPhotoIndex(0);
  };

  // Reset photo index when switching sources
  const handleSourceChange = (source: 'google' | 'user') => {
    setPhotoSource(source);
    setCurrentPhotoIndex(0);
  };

  // Determine if we should show brand logo hero (no photos but known brand)
  const showBrandLogoHero = !hasGooglePhotos && !hasUserPhotos && isBrand && brandLogoUrl && !logoError;

  return (
    <div 
      className={`relative h-48 sm:h-64 md:h-80 overflow-hidden ${showBrandLogoHero ? 'bg-white' : 'bg-cover bg-center'}`}
      style={showBrandLogoHero ? undefined : { backgroundImage: `url(${getCurrentBackgroundImage()})` }}
    >
      {/* Show brand logo hero when no photos available for known brands */}
      {showBrandLogoHero ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-muted/20 to-muted/40">
          <div className="text-center px-4">
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-8 shadow-lg inline-block mb-2 sm:mb-4">
              <img
                src={brandLogoUrl}
                alt={`${storeName} logo`}
                className="max-h-16 sm:max-h-24 md:max-h-32 max-w-32 sm:max-w-48 md:max-w-64 object-contain"
                onError={() => setLogoError(true)}
              />
            </div>
            <h1 className="text-lg sm:text-2xl md:text-4xl font-bold text-foreground line-clamp-2">
              {storeName}
            </h1>
          </div>
        </div>
      ) : (
        <>
          {/* Improved overlay for better text readability */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"></div>
        </>
      )}
      
      {/* Photo source toggle - only show when we have photos */}
      {(hasGooglePhotos || hasUserPhotos) && (
        <div className="absolute top-4 left-4 flex gap-1 z-10">
          {hasGooglePhotos && (
            <button
              onClick={() => handleSourceChange('google')}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                photoSource === 'google'
                  ? 'bg-white text-foreground'
                  : 'bg-black/50 text-white hover:bg-black/70'
              }`}
            >
              Google ({googlePhotos.length})
            </button>
          )}
          {hasUserPhotos && (
            <button
              onClick={() => handleSourceChange('user')}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors flex items-center gap-1 ${
                photoSource === 'user'
                  ? 'bg-white text-foreground'
                  : 'bg-black/50 text-white hover:bg-black/70'
              }`}
            >
              <Users className="h-3 w-3" />
              Community ({userPhotos.length})
            </button>
          )}
        </div>
      )}
      
      {/* Photo navigation */}
      {hasCurrentPhotos && currentPhotos.length > 1 && (
        <>
          <button
            onClick={prevPhoto}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full backdrop-blur-sm transition-colors z-10"
            aria-label="Previous photo"
          >
            ←
          </button>
          <button
            onClick={nextPhoto}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full backdrop-blur-sm transition-colors z-10"
            aria-label="Next photo"
          >
            →
          </button>
          
          {/* Photo indicators */}
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {currentPhotos.map((_, index) => (
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
        </>
      )}
      
      {/* Photo source indicator */}
      {hasCurrentPhotos && (
        <div className="absolute top-4 right-4 bg-black/50 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
          Photo {currentPhotoIndex + 1} of {currentPhotos.length} • {photoSource === 'google' ? 'Google Places' : 'Community'}
        </div>
      )}
      
      {/* Content overlay - don't show when brand logo hero is active */}
      {!showBrandLogoHero && (
        <div className="absolute inset-0 flex items-center justify-center text-white">
          <div className="text-center space-y-3 sm:space-y-6 px-4 max-w-4xl">
            <h1 className="text-lg sm:text-2xl md:text-4xl font-bold drop-shadow-lg text-white [text-shadow:_2px_2px_4px_rgb(0_0_0_/_80%)] line-clamp-2">
              {storeName}
            </h1>
            
            {/* Photo Thumbnail Gallery - Hidden on mobile for cleaner look */}
            {hasCurrentPhotos && currentPhotos.length > 1 && (
              <div className="hidden sm:flex justify-center">
                <div className="bg-black/30 backdrop-blur-sm rounded-lg p-3">
                  <div className="flex gap-2 max-w-sm overflow-x-auto scrollbar-hide">
                    {currentPhotos.map((_, index) => {
                      const thumbnailUrl = getPhotoUrl(index);
                      
                      return (
                        <button
                          key={index}
                          onClick={() => setCurrentPhotoIndex(index)}
                          className={`relative w-16 h-12 md:w-20 md:h-14 rounded-md overflow-hidden transition-all duration-200 flex-shrink-0 ${
                            index === currentPhotoIndex 
                              ? 'ring-2 ring-white shadow-lg scale-105' 
                              : 'ring-1 ring-white/40 hover:ring-white/80 hover:scale-105'
                          }`}
                        >
                          <img
                            src={thumbnailUrl}
                            alt={`Store photo ${index + 1}`}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                          {index === currentPhotoIndex && (
                            <div className="absolute inset-0 bg-white/20 flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <div className="text-xs text-white/80 mt-2 text-center">
                    {currentPhotos.length} photos from {photoSource === 'google' ? 'Google Places' : 'Community'}
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex flex-row gap-2 sm:gap-3 justify-center">
              <Button 
                onClick={() => setShowAddPhotoModal(true)}
                variant="secondary"
                size="sm"
                className="bg-white/95 text-foreground hover:bg-white font-medium shadow-lg text-xs sm:text-sm"
              >
                <Camera className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                Add Photos
              </Button>
              <ShareStore 
                store={store}
                variant="button"
                className="bg-white/20 text-white border-white/40 hover:bg-white/30 hover:text-white shadow-lg backdrop-blur-sm font-medium text-xs sm:text-sm h-8 sm:h-9 px-3 sm:px-4"
              />
            </div>
          </div>
        </div>
      )}

      {/* Action buttons for brand logo hero */}
      {showBrandLogoHero && (
        <div className="absolute bottom-4 sm:bottom-6 left-0 right-0 flex justify-center gap-2 sm:gap-3 px-4">
          <Button 
            onClick={() => setShowAddPhotoModal(true)}
            variant="secondary"
            size="sm"
            className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium shadow-lg text-xs sm:text-sm"
          >
            <Camera className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            Add Photos
          </Button>
          <ShareStore 
            store={store}
            variant="button"
            className="bg-muted text-foreground border-border hover:bg-muted/80 shadow-lg font-medium text-xs sm:text-sm h-8 sm:h-9 px-3 sm:px-4"
          />
        </div>
      )}

      <AddPhotoModal
        isOpen={showAddPhotoModal}
        onClose={() => setShowAddPhotoModal(false)}
        store={store}
        onPhotoUploaded={handlePhotoUploaded}
      />
    </div>
  );
};
