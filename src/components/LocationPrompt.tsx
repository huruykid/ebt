
import React from 'react';
import { MapPin, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface LocationPromptProps {
  onRequestLocation: () => void;
  error?: string | null;
}

export const LocationPrompt: React.FC<LocationPromptProps> = ({ onRequestLocation, error }) => {
  return (
    <Card className="max-w-md mx-auto">
      <CardContent className="p-6 text-center">
        <div className="mb-4">
          <MapPin className="h-12 w-12 text-blue-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Find SNAP Stores Near You
          </h3>
          <p className="text-gray-600 text-sm">
            Allow location access to discover EBT-accepting stores and restaurants in your area.
          </p>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <Button onClick={onRequestLocation} className="w-full">
          <Navigation className="h-4 w-4 mr-2" />
          Enable Location Services
        </Button>
        
        <p className="text-xs text-gray-500 mt-3">
          Your location is only used to find nearby stores and is not stored.
        </p>
      </CardContent>
    </Card>
  );
};
