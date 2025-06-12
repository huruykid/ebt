
import React from 'react';
import { MapPin, Search } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface SearchSuggestionsProps {
  onSearchSuggestion: (suggestion: string) => void;
}

export const SearchSuggestions: React.FC<SearchSuggestionsProps> = ({ onSearchSuggestion }) => {
  const suggestions = [
    { type: 'city', text: 'Los Angeles, CA', icon: MapPin },
    { type: 'zip', text: '90210', icon: MapPin },
    { type: 'store', text: 'Walmart', icon: Search },
    { type: 'city', text: 'New York, NY', icon: MapPin },
    { type: 'store', text: 'Target', icon: Search },
    { type: 'zip', text: '10001', icon: MapPin }
  ];

  return (
    <div className="space-y-3">
      <div className="text-center">
        <h3 className="font-medium text-foreground mb-1">Try searching for:</h3>
        <p className="text-sm text-muted-foreground">Enter a city, zip code, or store name</p>
      </div>
      
      <div className="flex flex-wrap gap-2 justify-center">
        {suggestions.map((suggestion, index) => {
          const IconComponent = suggestion.icon;
          return (
            <button
              key={index}
              onClick={() => onSearchSuggestion(suggestion.text)}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-muted hover:bg-muted/80 rounded-full transition-colors"
            >
              <IconComponent className="h-3 w-3" />
              {suggestion.text}
            </button>
          );
        })}
      </div>
    </div>
  );
};
