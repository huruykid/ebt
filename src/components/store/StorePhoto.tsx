import React, { useState } from 'react';
import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getBrandLogo } from '@/utils/brandLogos';

interface StorePhotoProps {
  photos?: Array<{ photo_url?: string }> | null;
  storeName: string | null;
  className?: string;
}

export const StorePhotoDisplay: React.FC<StorePhotoProps> = ({ 
  photos, 
  storeName,
  className 
}) => {
  const [hasError, setHasError] = useState(false);
  const [logoError, setLogoError] = useState(false);

  const photoUrl = photos?.[0]?.photo_url;
  const brandInfo = getBrandLogo(storeName);

  // Priority 1: If we have a Google photo, use it
  if (photoUrl && !hasError) {
    return (
      <img 
        src={photoUrl}
        alt={storeName || 'Store'}
        className={cn("object-cover", className)}
        loading="lazy"
        onError={() => setHasError(true)}
      />
    );
  }

  // Priority 2: If it's a known brand, show brand logo
  if (brandInfo && !logoError) {
    return (
      <div className={cn(
        "bg-white flex items-center justify-center p-3",
        className
      )}>
        <img
          src={brandInfo.logoUrl}
          alt={`${storeName} logo`}
          className="max-h-14 max-w-20 object-contain"
          onError={() => setLogoError(true)}
          loading="lazy"
        />
      </div>
    );
  }

  // Priority 3: Fallback to generic placeholder
  return (
    <div className={cn(
      "bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center",
      className
    )}>
      <div className="text-center text-muted-foreground">
        <MapPin className="h-6 w-6 mx-auto mb-1" />
        <span className="text-xs font-medium line-clamp-2 px-2">{storeName}</span>
      </div>
    </div>
  );
};
