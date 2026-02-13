import React, { useState, useEffect, useCallback } from 'react';
import { Camera, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AddPhotoModal } from './modals/AddPhotoModal';
import { supabase } from '@/integrations/supabase/client';
import { getBrandLogoHighRes, isKnownBrand } from '@/utils/brandLogos';
import type { Tables } from '@/integrations/supabase/types';

type Store = Tables<'snap_stores'>;

interface UserPhoto { id: string; file_path: string; created_at: string; }

interface StorePhotosProps {
  storeName: string;
  store: Store;
  onHoursAdded?: (hours: Record<string, { open: string; close: string; closed: boolean }>) => void;
}

const hashString = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash = hash & hash;
  }
  return hash;
};

const getDefaultImage = (type: string | null, name: string | null) => {
  const images = [
    'photo-1556909114-f6e7ad7d3136',
    'photo-1542838132-92c53300491e',
    'photo-1578662996442-48f60103fc96',
    'photo-1441986300917-64674bd600d8',
  ];
  return images[Math.floor(Math.abs(hashString(name || '')) % images.length)];
};

export const StorePhotos: React.FC<StorePhotosProps> = ({ storeName, store, onHoursAdded }) => {
  const [showModal, setShowModal] = useState(false);
  const [idx, setIdx] = useState(0);
  const [userPhotos, setUserPhotos] = useState<UserPhoto[]>([]);
  const [logoError, setLogoError] = useState(false);

  const isBrand = isKnownBrand(store.Store_Name);
  const brandLogo = getBrandLogoHighRes(store.Store_Name);

  const fetchUserPhotos = useCallback(async () => {
    const { data } = await supabase
      .from('public_store_photos' as any)
      .select('id, file_path, created_at')
      .eq('store_id', store.id)
      .order('created_at', { ascending: false });
    setUserPhotos((data as unknown as UserPhoto[]) || []);
  }, [store.id]);

  useEffect(() => { fetchUserPhotos(); }, [fetchUserPhotos]);

  const googlePhotos = (() => {
    if (!store.google_photos) return [];
    try {
      const p = JSON.parse(store.google_photos as string);
      return Array.isArray(p) ? p : [];
    } catch { return []; }
  })();

  const allPhotos = [...googlePhotos.map((p: any) => {
    if (p.photo_url) return p.photo_url;
    if (p.photo_reference) return `https://vpnaaaocqqmkslwqrkyd.supabase.co/functions/v1/google-places-photo?photo_reference=${p.photo_reference}&maxwidth=800&maxheight=400`;
    return null;
  }).filter(Boolean), ...userPhotos.map(p => {
    const { data: { publicUrl } } = supabase.storage.from('store-photos').getPublicUrl(p.file_path);
    return publicUrl;
  })];

  const defaultImg = `https://images.unsplash.com/${getDefaultImage(store.Store_Type, store.Store_Name)}?auto=format&fit=crop&w=800&h=400&q=80`;
  const hasPhotos = allPhotos.length > 0;
  const showBrandHero = !hasPhotos && isBrand && brandLogo && !logoError;

  const currentUrl = hasPhotos ? allPhotos[idx % allPhotos.length] : defaultImg;

  return (
    <div className="relative h-48 sm:h-56 md:h-64 overflow-hidden bg-muted">
      {showBrandHero ? (
        <div className="absolute inset-0 flex items-center justify-center bg-background">
          <img src={brandLogo} alt={storeName} className="max-h-20 sm:max-h-28 object-contain" onError={() => setLogoError(true)} />
        </div>
      ) : (
        <img src={currentUrl} alt={storeName} className="w-full h-full object-cover" />
      )}

      {/* Gradient overlay */}
      {!showBrandHero && <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />}

      {/* Photo nav */}
      {hasPhotos && allPhotos.length > 1 && (
        <>
          <button onClick={() => setIdx(i => (i - 1 + allPhotos.length) % allPhotos.length)} className="absolute left-3 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm rounded-full p-1.5 text-foreground hover:bg-background transition-colors" aria-label="Previous photo">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button onClick={() => setIdx(i => (i + 1) % allPhotos.length)} className="absolute right-3 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm rounded-full p-1.5 text-foreground hover:bg-background transition-colors" aria-label="Next photo">
            <ChevronRight className="h-4 w-4" />
          </button>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-background/70 backdrop-blur-sm text-foreground text-xs px-2.5 py-1 rounded-full">
            {(idx % allPhotos.length) + 1} / {allPhotos.length}
          </div>
        </>
      )}

      {/* Add photo button */}
      <Button
        onClick={() => setShowModal(true)}
        variant="secondary"
        size="sm"
        className="absolute top-3 right-3 bg-background/80 backdrop-blur-sm text-foreground hover:bg-background text-xs"
      >
        <Camera className="h-3.5 w-3.5 mr-1" />
        Add Photo
      </Button>

      <AddPhotoModal isOpen={showModal} onClose={() => setShowModal(false)} store={store} onPhotoUploaded={() => { fetchUserPhotos(); setIdx(0); }} />
    </div>
  );
};
