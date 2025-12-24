import React from 'react';
import { Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { SearchSuggestion, SearchHistory } from '@/types/searchTypes';

interface SuggestionItemProps {
  suggestion: SearchSuggestion;
  onClick: () => void;
}

export const SuggestionItem: React.FC<SuggestionItemProps> = ({ suggestion, onClick }) => (
  <button
    onClick={onClick}
    className="w-full text-left px-3 py-2 hover:bg-muted/50 rounded-lg flex items-center gap-3"
  >
    <span className="text-lg">{suggestion.icon}</span>
    <div>
      <div className="font-medium">{suggestion.value}</div>
      {suggestion.subtitle && (
        <div className="text-sm text-muted-foreground">{suggestion.subtitle}</div>
      )}
    </div>
  </button>
);

interface HistoryItemProps {
  item: SearchHistory;
  onClick: () => void;
}

export const HistoryItem: React.FC<HistoryItemProps> = ({ item, onClick }) => (
  <button
    onClick={onClick}
    className="w-full text-left px-3 py-2 hover:bg-muted/50 rounded-lg flex items-center gap-3"
  >
    <Clock className="h-4 w-4 text-muted-foreground" />
    <div>
      <div className="font-medium">{item.query}</div>
      {item.location && (
        <div className="text-sm text-muted-foreground">in {item.location}</div>
      )}
    </div>
  </button>
);

interface SearchSuggestionsDropdownProps {
  suggestions: SearchSuggestion[];
  searchHistory: SearchHistory[];
  onSuggestionClick: (suggestion: SearchSuggestion) => void;
  onHistoryClick: (item: SearchHistory) => void;
  onClearHistory: () => void;
  compact?: boolean;
}

export const SearchSuggestionsDropdown: React.FC<SearchSuggestionsDropdownProps> = ({
  suggestions,
  searchHistory,
  onSuggestionClick,
  onHistoryClick,
  onClearHistory,
  compact = false
}) => {
  if (suggestions.length === 0 && searchHistory.length === 0) {
    return null;
  }

  if (compact) {
    return (
      <Card className="absolute top-full left-0 right-0 mt-1 z-50 max-h-80 overflow-y-auto">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSuggestionClick(suggestion)}
            className="w-full text-left px-4 py-3 hover:bg-muted/50 border-b border-muted/20 last:border-0 flex items-center gap-3"
          >
            <span className="text-lg">{suggestion.icon}</span>
            <div>
              <div className="font-medium">{suggestion.value}</div>
              {suggestion.subtitle && (
                <div className="text-sm text-muted-foreground">{suggestion.subtitle}</div>
              )}
            </div>
          </button>
        ))}
      </Card>
    );
  }

  return (
    <Card className="border-t border-muted/20 mt-4 -mx-6 -mb-6 rounded-t-none">
      <div className="p-4">
        {searchHistory.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Clock className="h-4 w-4" />
                Recent Searches
              </div>
              <Button variant="ghost" size="sm" onClick={onClearHistory}>
                Clear
              </Button>
            </div>
            <div className="space-y-1">
              {searchHistory.slice(0, 3).map((item) => (
                <HistoryItem
                  key={item.id}
                  item={item}
                  onClick={() => onHistoryClick(item)}
                />
              ))}
            </div>
          </div>
        )}

        {suggestions.length > 0 && (
          <div className="space-y-1">
            {suggestions.map((suggestion, index) => (
              <SuggestionItem
                key={index}
                suggestion={suggestion}
                onClick={() => onSuggestionClick(suggestion)}
              />
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};
