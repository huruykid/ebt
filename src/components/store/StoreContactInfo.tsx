import React from 'react';
import { MapPin, Phone, Clock, Globe } from 'lucide-react';

interface OpeningHours {
  open_now?: boolean;
}

interface StoreContactInfoProps {
  address: string;
  distance?: number;
  phone?: string | null;
  openingHours?: OpeningHours | null;
  website?: string | null;
}

export const StoreContactInfo: React.FC<StoreContactInfoProps> = ({
  address,
  distance,
  phone,
  openingHours,
  website
}) => {
  const getOpenStatus = () => {
    if (openingHours?.open_now !== undefined) {
      return openingHours.open_now ? 'Open Now' : 'Closed';
    }
    return 'Hours not available';
  };

  return (
    <div className="space-y-1 text-sm text-muted-foreground">
      {address && (
        <div className="flex items-start gap-2">
          <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span className="truncate">{address}</span>
          {distance !== undefined && (
            <span className="text-xs whitespace-nowrap">• {distance.toFixed(1)} mi</span>
          )}
        </div>
      )}

      <div className="flex items-center gap-2">
        <Phone className="h-4 w-4 flex-shrink-0" />
        <span>{phone || 'Phone not available'}</span>
      </div>

      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 flex-shrink-0" />
        <span>{getOpenStatus()}</span>
      </div>

      {website && (
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 flex-shrink-0" />
          <a 
            href={website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-primary/80 text-sm"
          >
            Visit Website
          </a>
        </div>
      )}
    </div>
  );
};
