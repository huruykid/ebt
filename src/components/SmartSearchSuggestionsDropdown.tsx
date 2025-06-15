
import React from 'react';

interface SmartSearchSuggestionsDropdownProps {
  suggestions: string[];
  onSuggestionClick: (suggestion: string) => void;
  visible: boolean;
  className?: string;
}

export const SmartSearchSuggestionsDropdown: React.FC<SmartSearchSuggestionsDropdownProps> = ({
  suggestions,
  onSuggestionClick,
  visible,
  className = ''
}) => {
  if (!visible || suggestions.length === 0) return null;
  return (
    <div className={`absolute top-full left-0 right-0 mt-1 bg-background border border-input rounded-md shadow-lg z-50 max-h-40 overflow-y-auto ${className}`}>
      {suggestions.map((suggestion, index) => (
        <button
          key={index}
          type="button"
          onClick={() => onSuggestionClick(suggestion)}
          className="w-full text-left px-3 py-2 hover:bg-muted text-sm border-b border-muted last:border-0"
        >
          {suggestion}
        </button>
      ))}
    </div>
  );
};
