import React from 'react';
import { MapPin, Clock, Globe } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface OpeningHours {
  open_now?: boolean;
}

interface StoreContactInfoProps {
  address: string;
  distance?: number;
  phone?: string | null;
  openingHours?: OpeningHours | null;
  website?: string | null;
  /** Hide fields that don't have data instead of showing "not available" */
  hideEmptyFields?: boolean;
}

export const StoreContactInfo: React.FC<StoreContactInfoProps> = ({
  address,
  distance,
  phone,
  openingHours,
  website,
  hideEmptyFields = true,
}) => {
  const getOpenStatus = () => {
    if (openingHours?.open_now !== undefined) {
      return openingHours.open_now ? 'Open Now' : 'Closed';
    }
    return null;
  };

  const openStatus = getOpenStatus();
  const hasPhone = Boolean(phone);
  const hasHours = openStatus !== null;
  const hasWebsite = Boolean(website);

  return (
    <div className="space-y-1.5 text-sm text-muted-foreground">
      {/* Address - always shown */}
      {address && (
        <div className="flex items-start gap-2">
          <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
          <span className="line-clamp-2">{address}</span>
          {distance !== undefined && (
            <span className="text-xs whitespace-nowrap font-medium text-foreground ml-1">
              • {distance.toFixed(1)} mi
            </span>
          )}
        </div>
      )}

      {/* Hours - only show if available or hideEmptyFields is false */}
      {(hasHours || !hideEmptyFields) && (
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
          {openStatus ? (
            <Badge 
              variant={openStatus === 'Open Now' ? 'default' : 'secondary'}
              className={
                openStatus === 'Open Now' 
                  ? 'bg-success/15 text-success border-success/20 text-xs px-2 py-0' 
                  : 'bg-muted text-muted-foreground text-xs px-2 py-0'
              }
            >
              {openStatus}
            </Badge>
          ) : !hideEmptyFields ? (
            <span className="text-xs text-muted-foreground">Hours not available</span>
          ) : null}
        </div>
      )}

      {/* Website - only show if available */}
      {hasWebsite && (
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
          <a 
            href={website!}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-primary/80 text-sm hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            Visit Website
          </a>
        </div>
      )}
    </div>
  );
};
