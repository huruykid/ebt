
import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { SmartSearchSuggestionsDropdown } from './SmartSearchSuggestionsDropdown';
import { sanitizeString, isValidText } from '@/utils/security';

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
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Basic input validation - allow reasonable search terms
    if (inputValue.length <= 100 && (inputValue === '' || isValidText(inputValue) || /^[a-zA-Z0-9\s.,'&-]+$/.test(inputValue))) {
      const sanitizedValue = sanitizeString(inputValue);
      onChange(sanitizedValue);
      setShowSuggestions(sanitizedValue.length > 0);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    const sanitizedSuggestion = sanitizeString(suggestion);
    onSuggestionClick(sanitizedSuggestion);
  };

  return (
    <div className="relative flex-1">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
      <Input
        type="text"
        value={value}
        onChange={handleInputChange}
        onFocus={() => setShowSuggestions(value.length > 0)}
        onBlur={() => setTimeout(() => { setShowSuggestions(false); onBlur && onBlur(); }, 200)}
        placeholder="Domino's, Bakery, Corner Store..."
        className="pl-10 pr-4"
        maxLength={100}
      />
      <SmartSearchSuggestionsDropdown
        suggestions={suggestions}
        onSuggestionClick={handleSuggestionClick}
        visible={showSuggestions && suggestions.length > 0}
      />
    </div>
  );
};
