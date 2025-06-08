
import React, { useState, useEffect } from 'react';
import { useGooglePlacesSearch, getGooglePlacesPhotoUrl } from '@/hooks/useGooglePlaces';
import { Store, Camera, ImageIcon } from 'lucide-react';

interface StorePhotoProps {
  storeName: string;
  address?: string;
  className?: string;
}

export const StorePhoto: React.FC<StorePhotoProps> = ({ 
  storeName, 
  address, 
  className = "w-full h-32 object-cover rounded-t-lg" 
}) => {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  // Create search query for Google Places
  const searchQuery = address ? `${storeName} ${address}` : storeName;
  
  const { data: places, isLoading: searchLoading } = useGooglePlacesSearch(
    searchQuery,
    !!storeName
  );

  useEffect(() => {
    const loadPhoto = async () => {
      if (!places || places.length === 0 || !places[0].photos) return;

      setLoading(true);
      try {
        const firstPhoto = places[0].photos[0];
        if (firstPhoto?.photo_reference) {
          const url = await getGooglePlacesPhotoUrl(firstPhoto.photo_reference, 400);
          setPhotoUrl(url);
        }
      } catch (err) {
        console.error('Failed to load store photo:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    loadPhoto();
  }, [places]);

  if (searchLoading || loading) {
    return (
      <div className={`${className} bg-gray-100 flex items-center justify-center`}>
        <div className="text-center text-gray-400">
          <ImageIcon className="h-6 w-6 mx-auto mb-1 animate-pulse" />
          <span className="text-xs">Loading...</span>
        </div>
      </div>
    );
  }

  if (error || !photoUrl) {
    return (
      <div className={`${className} bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center`}>
        <div className="text-center text-gray-500">
          <Store className="h-6 w-6 mx-auto mb-1" />
          <span className="text-xs font-medium">{storeName}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-t-lg">
      <img
        src={photoUrl}
        alt={`${storeName} store photo`}
        className={className}
        onError={() => setError(true)}
      />
      {/* Subtle overlay for better text readability if needed */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
    </div>
  );
};
