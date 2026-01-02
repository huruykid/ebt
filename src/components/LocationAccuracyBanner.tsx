import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Navigation, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { GeolocationSource } from '@/lib/core';

interface LocationAccuracyBannerProps {
  source: GeolocationSource;
  loading: boolean;
  onUpgradeLocation: () => void;
  city?: string;
  region?: string;
}

export const LocationAccuracyBanner: React.FC<LocationAccuracyBannerProps> = ({
  source,
  loading,
  onUpgradeLocation,
  city,
  region,
}) => {
  const [dismissed, setDismissed] = useState(false);

  // Don't show if already using precise GPS or dismissed
  if (source === 'browser' || dismissed) {
    return null;
  }

  // Don't show while still loading initial location (source is null)
  if (source === null) {
    return null;
  }

  const locationText = city && region ? `${city}, ${region}` : 'your approximate area';

  return (
    <div className="bg-primary/10 border border-primary/20 rounded-lg px-4 py-3 flex items-center justify-between gap-3 animate-fade-in">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <Navigation className="h-4 w-4 text-primary shrink-0" />
        <p className="text-sm text-foreground truncate">
          Showing stores near <span className="font-medium">{locationText}</span>
        </p>
      </div>
      
      <div className="flex items-center gap-2 shrink-0">
        <Button
          onClick={onUpgradeLocation}
          variant="default"
          size="sm"
          disabled={loading}
          className="text-xs"
        >
          {loading ? (
            <>
              <Navigation className="h-3 w-3 mr-1 animate-pulse" />
              Getting...
            </>
          ) : (
            <>
              <Navigation className="h-3 w-3 mr-1" />
              Use precise location
            </>
          )}
        </Button>
        
        <Button
          onClick={() => setDismissed(true)}
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
