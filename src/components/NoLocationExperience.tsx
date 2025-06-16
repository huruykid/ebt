
import React from 'react';
import { MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NoLocationExperienceProps {
  onSmartSearch: (query: string) => void;
  onRequestLocation: () => void;
}

const NoLocationExperience: React.FC<NoLocationExperienceProps> = ({
  onRequestLocation,
}) => {
  return (
    <div className="text-center py-12">
      <div className="max-w-md mx-auto">
        <div className="text-6xl mb-6">📍</div>
        <h2 className="text-2xl font-bold text-foreground mb-4">
          Find Stores Near You
        </h2>
        <p className="text-muted-foreground mb-6">
          To show you the best nearby stores that accept EBT/SNAP benefits, we need access to your location.
        </p>
        <Button
          onClick={onRequestLocation}
          size="lg"
          className="w-full sm:w-auto"
        >
          <MapPin className="h-4 w-4 mr-2" />
          Enable Location Access
        </Button>
        <p className="text-xs text-muted-foreground mt-4">
          Your location is only used to find nearby stores and is not stored or shared.
        </p>
      </div>
    </div>
  );
};

export default NoLocationExperience;
