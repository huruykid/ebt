
import React from 'react';
import { FeaturedStoreTypes } from './FeaturedStoreTypes';
import { SearchSuggestions } from './SearchSuggestions';
import { EbtInfoSection } from './EbtInfoSection';
import { MapPin } from 'lucide-react';

interface Props {
  onSmartSearch: (query: string) => void;
  onRequestLocation: () => void;
}

export const NoLocationExperience: React.FC<Props> = ({ onSmartSearch, onRequestLocation }) => (
  <div className="space-y-8">
    <FeaturedStoreTypes onCategorySelect={onSmartSearch} />
    <SearchSuggestions onSearchSuggestion={onSmartSearch} />
    <EbtInfoSection />
    <div className="bg-muted/50 rounded-lg p-6 text-center">
      <h3 className="font-medium mb-2">Want personalized results?</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Enable location to see stores near you with accurate distances and directions.
      </p>
      <button
        onClick={onRequestLocation}
        className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
      >
        <MapPin className="h-4 w-4" />
        Enable Location
      </button>
    </div>
  </div>
);

export default NoLocationExperience;
