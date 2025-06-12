
import React from 'react';
import { MapPin, Navigation } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Tables } from '@/integrations/supabase/types';

type Store = Tables<'snap_stores'>;

interface AddressCardProps {
  store: Store;
}

export const AddressCard: React.FC<AddressCardProps> = ({ store }) => {
  const formatAddress = () => {
    const parts = [
      store.Store_Street_Address,
      store.Additional_Address,
      store.City,
      store.State,
      store.Zip_Code
    ].filter(Boolean);
    
    return parts.join(', ');
  };

  const openInMaps = () => {
    const address = encodeURIComponent(formatAddress());
    const url = `https://www.google.com/maps/search/?api=1&query=${address}`;
    window.open(url, '_blank');
  };

  const openDirections = () => {
    if (store.Latitude && store.Longitude) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${store.Latitude},${store.Longitude}`;
      window.open(url, '_blank');
    } else {
      // Fallback to address search
      openInMaps();
    }
  };

  return (
    <Card className="border-0 shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          Location
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {formatAddress() ? (
          <div className="space-y-3">
            <button
              onClick={openInMaps}
              className="text-sm text-muted-foreground leading-relaxed hover:text-primary hover:underline transition-colors text-left w-full"
            >
              {formatAddress()}
            </button>
            
            {(!store.Store_Street_Address || !store.City) && (
              <div className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-md border border-amber-200">
                ⚠️ Address information may be incomplete
              </div>
            )}
            
            <Button 
              onClick={openDirections}
              size="sm" 
              className="w-full"
            >
              <Navigation className="h-4 w-4 mr-2" />
              Get Directions
            </Button>
          </div>
        ) : (
          <div className="text-center py-4">
            <MapPin className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Address not available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
