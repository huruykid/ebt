
import React from 'react';
import { MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Tables } from '@/integrations/supabase/types';

type Store = Tables<'snap_stores'>;

interface StoreMapProps {
  store: Store;
}

export const StoreMap: React.FC<StoreMapProps> = ({ store }) => {
  const openDirections = () => {
    if (store?.latitude && store?.longitude) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${store.latitude},${store.longitude}`;
      window.open(url, '_blank');
    }
  };

  const openInMaps = () => {
    if (store?.latitude && store?.longitude) {
      const url = `https://www.google.com/maps/search/?api=1&query=${store.latitude},${store.longitude}`;
      window.open(url, '_blank');
    }
  };

  if (!store?.latitude || !store?.longitude) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Location</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Location coordinates not available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Location & Directions</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Embedded map placeholder - will be replaced with Google Maps later */}
        <div className="aspect-video bg-gray-100 rounded-lg mb-4 flex items-center justify-center border">
          <div className="text-center text-gray-500">
            <MapPin className="h-12 w-12 mx-auto mb-2" />
            <p className="font-medium">Interactive Google Map</p>
            <p className="text-sm">Coming soon!</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={openDirections} className="flex-1">
            <MapPin className="h-4 w-4 mr-2" />
            Get Directions
          </Button>
          <Button onClick={openInMaps} variant="outline" className="flex-1">
            View on Google Maps
          </Button>
        </div>
        
        <div className="mt-4 text-sm text-gray-600">
          <p><strong>Coordinates:</strong> {store.latitude}, {store.longitude}</p>
        </div>
      </CardContent>
    </Card>
  );
};
