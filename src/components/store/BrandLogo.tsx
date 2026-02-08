import React, { useState } from 'react';
import { Store } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getBrandLogo, getBrandLogoHighRes } from '@/utils/brandLogos';

interface BrandLogoProps {
  storeName: string | null;
  variant?: 'card' | 'detail' | 'hero';
  className?: string;
  fallbackElement?: React.ReactNode;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  storeName,
  variant = 'card',
  className,
  fallbackElement,
}) => {
  const [hasError, setHasError] = useState(false);
  
  const brandInfo = variant === 'hero' 
    ? (storeName ? { logoUrl: getBrandLogoHighRes(storeName), brandName: storeName } : null)
    : getBrandLogo(storeName);
  
  // If no brand match or logo failed to load, render fallback
  if (!brandInfo?.logoUrl || hasError) {
    if (fallbackElement) {
      return <>{fallbackElement}</>;
    }
    
    // Default fallback with store icon
    return (
      <div className={cn(
        "bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center",
        className
      )}>
        <div className="text-center text-muted-foreground p-2">
          <Store className="h-6 w-6 mx-auto mb-1" />
          <span className="text-xs font-medium line-clamp-2">{storeName}</span>
        </div>
      </div>
    );
  }

  const sizeClasses = {
    card: 'p-3',
    detail: 'p-4',
    hero: 'p-6',
  };

  const logoSizeClasses = {
    card: 'max-h-14 max-w-20',
    detail: 'max-h-20 max-w-28',
    hero: 'max-h-32 max-w-48',
  };

  return (
    <div 
      className={cn(
        "bg-white flex items-center justify-center",
        sizeClasses[variant],
        className
      )}
    >
      <img
        src={brandInfo.logoUrl}
        alt={`${storeName} logo`}
        className={cn(
          "object-contain",
          logoSizeClasses[variant]
        )}
        onError={() => setHasError(true)}
        loading="lazy"
      />
    </div>
  );
};
