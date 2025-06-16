
import React from 'react';
import { useGeolocation } from '@/hooks/useGeolocation';
import { Button } from '@/components/ui/button';
import { Navigation } from 'lucide-react';

interface SearchHeaderProps {
  onLocationSearch: (latitude: number, longitude: number) => void;
}

export const SearchHeader: React.FC<SearchHeaderProps> = ({
  onLocationSearch
}) => {
  const { latitude, longitude, loading: locationLoading } = useGeolocation();

  const handleLocationSearch = () => {
    if (latitude && longitude) {
      onLocationSearch(latitude, longitude);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">Find SNAP/EBT Stores</h1>
        <p className="text-muted-foreground">
          Discover stores near your current location that accept EBT/SNAP benefits
        </p>
      </div>

      {latitude && longitude && (
        <div className="text-center">
          <Button
            onClick={handleLocationSearch}
            disabled={locationLoading}
            variant="outline"
            size="lg"
            className="w-full sm:w-auto"
          >
            <Navigation className="h-4 w-4 mr-2" />
            Search near your current location
          </Button>
        </div>
      )}
    </div>
  );
};
