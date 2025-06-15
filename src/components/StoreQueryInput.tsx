
import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { SmartSearchSuggestionsDropdown } from './SmartSearchSuggestionsDropdown';

interface StoreQueryInputProps {
  value: string;
  onChange: (v: string) => void;
  onSuggestionClick: (s: string) => void;
  suggestions: string[];
  showSuggestions: boolean;
  setShowSuggestions: (v: boolean) => void;
  onBlur?: () => void;
}

export const StoreQueryInput: React.FC<StoreQueryInputProps> = ({
  value,
  onChange,
  onSuggestionClick,
  suggestions,
  showSuggestions,
  setShowSuggestions,
  onBlur,
}) => {
  return (
    <div className="relative flex-1">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
      <Input
        type="text"
        value={value}
        onChange={(e) => { onChange(e.target.value); setShowSuggestions(e.target.value.length > 0); }}
        onFocus={() => setShowSuggestions(value.length > 0)}
        onBlur={() => setTimeout(() => { setShowSuggestions(false); onBlur && onBlur(); }, 200)}
        placeholder="Domino's, Bakery, Corner Store..."
        className="pl-10 pr-4"
      />
      <SmartSearchSuggestionsDropdown
        suggestions={suggestions}
        onSuggestionClick={onSuggestionClick}
        visible={showSuggestions && suggestions.length > 0}
      />
    </div>
  );
};
