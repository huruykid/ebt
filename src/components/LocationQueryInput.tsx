import React from 'react';
import { MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { SmartSearchSuggestionsDropdown } from './SmartSearchSuggestionsDropdown';

interface LocationQueryInputProps {
  value: string;
  onChange: (v: string) => void;
  onSuggestionClick: (s: string) => void;
  suggestions: string[];
  showSuggestions: boolean;
  setShowSuggestions: (v: boolean) => void;
  onBlur?: () => void;
  state?: string;
  setState?: (v: string) => void;
}

export const LocationQueryInput: React.FC<LocationQueryInputProps> = ({
  value,
  onChange,
  onSuggestionClick,
  suggestions,
  showSuggestions,
  setShowSuggestions,
  onBlur,
  state,
  setState,
}) => {
  return (
    <div className="relative flex-1">
      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
      <Input
        type="text"
        value={value}
        onChange={(e) => { onChange(e.target.value); setShowSuggestions(e.target.value.length > 0); }}
        onFocus={() => setShowSuggestions(value.length > 0)}
        onBlur={() => setTimeout(() => { setShowSuggestions(false); onBlur && onBlur(); }, 200)}
        placeholder="Fresno or 90015"
        className="pl-10 pr-4"
        autoCapitalize="words"
      />
      <SmartSearchSuggestionsDropdown
        suggestions={suggestions}
        onSuggestionClick={onSuggestionClick}
        visible={showSuggestions && suggestions.length > 0}
      />
    </div>
  );
};
