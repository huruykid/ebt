
import React from 'react';
import { MapPin, Navigation, Clock, Car } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useNominatimReverse } from '@/hooks/useNominatimSearch';
import type { Tables } from '@/integrations/supabase/types';

type Store = Tables<'snap_stores'>;

interface StoreMapProps {
  store: Store;
}

// Calculate distance between two points using Haversine formula
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Estimate travel time (assuming average city driving speed of 25 mph)
const estimateTravelTime = (distance: number): string => {
  const avgSpeed = 25; // mph
  const timeInHours = distance / avgSpeed;
  const minutes = Math.round(timeInHours * 60);
  
  if (minutes < 60) {
    return `${minutes} min`;
  } else {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  }
};

export const StoreMap: React.FC<StoreMapProps> = ({ store }) => {
  const { latitude: userLat, longitude: userLon, error: locationError } = useGeolocation();
  
  // Get enhanced address information from OSM if coordinates are available
  const { data: osmData } = useNominatimReverse(
    store?.Latitude || 0,
    store?.Longitude || 0,
    !!(store?.Latitude && store?.Longitude)
  );

  const openDirections = () => {
    if (store?.Latitude && store?.Longitude) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${store.Latitude},${store.Longitude}`;
      window.open(url, '_blank');
    }
  };

  const openInMaps = () => {
    if (store?.Latitude && store?.Longitude) {
      // Use OpenStreetMap for viewing
      const url = `https://www.openstreetmap.org/?mlat=${store.Latitude}&mlon=${store.Longitude}&zoom=16`;
      window.open(url, '_blank');
    }
  };

  if (!store?.Latitude || !store?.Longitude) {
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

  // Calculate distance and travel time if user location is available
  let distance: number | null = null;
  let travelTime: string | null = null;
  
  if (userLat && userLon && !locationError) {
    distance = calculateDistance(userLat, userLon, store.Latitude, store.Longitude);
    travelTime = estimateTravelTime(distance);
  }

  const formatAddress = () => {
    // Use OSM data if available, otherwise fall back to store data
    if (osmData?.address) {
      const parts = [
        osmData.address.house_number,
        osmData.address.road,
        osmData.address.city || osmData.address.suburb,
        osmData.address.state,
        osmData.address.postcode
      ].filter(Boolean);
      return parts.join(', ');
    }
    
    // Fallback to original store data
    const parts = [
      store.Store_Street_Address,
      store.Additional_Address,
      store.City,
      store.State,
      store.Zip_Code
    ].filter(Boolean);
    
    return parts.join(', ');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Location & Directions</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Enhanced location info */}
        <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-lg p-6 mb-4">
          <div className="flex items-start gap-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <MapPin className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-2">Store Address</h3>
              <p className="text-gray-700 mb-3">{formatAddress()}</p>
              
              {/* Distance and travel time info */}
              {distance && travelTime && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Navigation className="h-4 w-4 text-green-600" />
                    <span className="text-gray-600">
                      <span className="font-medium text-gray-900">{distance.toFixed(1)} mi</span> away
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-orange-600" />
                    <span className="text-gray-600">
                      <span className="font-medium text-gray-900">{travelTime}</span> drive
                    </span>
                  </div>
                </div>
              )}
              
              {locationError && (
                <div className="text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded-md">
                  💡 Enable location access to see distance and travel time
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <Button onClick={openDirections} className="flex items-center gap-2">
            <Car className="h-4 w-4" />
            Get Directions
          </Button>
          <Button onClick={openInMaps} variant="outline" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            View on OpenStreetMap
          </Button>
        </div>
        
        {/* Coordinates for reference */}
        <div className="pt-4 border-t border-gray-200">
          <div className="text-xs text-gray-500">
            <strong>Coordinates:</strong> {store.Latitude}, {store.Longitude}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
