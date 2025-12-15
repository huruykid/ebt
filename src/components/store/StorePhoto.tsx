import React, { useState } from 'react';
import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

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

  const photoUrl = photos?.[0]?.photo_url;

  if (!photoUrl || hasError) {
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
  }

  return (
    <img 
      src={photoUrl}
      alt={storeName || 'Store'}
      className={cn("object-cover", className)}
      loading="lazy"
      onError={() => setHasError(true)}
    />
  );
};
