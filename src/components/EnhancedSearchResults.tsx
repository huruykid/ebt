import React, { useState } from 'react';
import { UnifiedStoreCard } from '@/components/UnifiedStoreCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Filter, SortAsc, Grid, List } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';
import { cn } from '@/lib/utils';

type Store = Tables<'snap_stores'>;

interface StoreWithDistance extends Store {
  distance?: number;
}

interface EnhancedSearchResultsProps {
  stores: StoreWithDistance[];
  isLoading: boolean;
  error?: Error | null;
  className?: string;
  compact?: boolean;
  showEmptyPrompt?: boolean;
}

type SortOption = 'relevance' | 'distance' | 'name' | 'rating' | 'recent';
type ViewMode = 'grid' | 'list';

export const EnhancedSearchResults: React.FC<EnhancedSearchResultsProps> = ({
  stores,
  isLoading,
  error,
  className,
  compact = false,
  showEmptyPrompt = false
}) => {
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Get unique store types for filtering
  const storeTypes = React.useMemo(() => {
    const types = stores
      .map(store => store.Store_Type)
      .filter(Boolean)
      .reduce((acc, type) => {
        acc[type!] = (acc[type!] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
    
    return Object.entries(types)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10); // Top 10 most common types
  }, [stores]);

  // Filter and sort stores
  const filteredAndSortedStores = React.useMemo(() => {
    let filtered = stores;

    // Apply type filters
    if (selectedTypes.length > 0) {
      filtered = filtered.filter(store => 
        selectedTypes.includes(store.Store_Type || '')
      );
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'distance':
          return (a.distance || 0) - (b.distance || 0);
        case 'name':
          return (a.Store_Name || '').localeCompare(b.Store_Name || '');
        case 'rating':
          return (b.google_rating || 0) - (a.google_rating || 0);
        case 'recent':
          return new Date(b.google_last_updated || 0).getTime() - new Date(a.google_last_updated || 0).getTime();
        default: // relevance
          return 0;
      }
    });

    return sorted;
  }, [stores, selectedTypes, sortBy]);

  const toggleTypeFilter = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const clearFilters = () => {
    setSelectedTypes([]);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="text-center">
          <LoadingSpinner />
          <p className="text-muted-foreground mt-4">Searching for stores...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-8 text-center border-destructive/20">
        <div className="text-destructive text-lg font-semibold mb-2">
          ⚠️ Search Error
        </div>
        <p className="text-muted-foreground">
          Unable to search for stores. Please try again.
        </p>
      </Card>
    );
  }

  if (stores.length === 0) {
    if (showEmptyPrompt) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          <p>Enter a store name or use your location to find nearby EBT-accepting stores.</p>
        </div>
      );
    }
    return (
      <Card className="p-12 text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-xl font-semibold mb-2">No stores found</h3>
        <p className="text-muted-foreground text-lg mb-6">
          We couldn't find any EBT-accepting stores matching your search.
        </p>
        <div className="bg-muted/50 rounded-lg p-4 text-sm space-y-2">
          <p className="font-medium">Try these suggestions:</p>
          <ul className="space-y-1 text-muted-foreground">
            <li>• Search for specific store names (e.g., "Walmart", "Subway")</li>
            <li>• Use broader terms like "grocery" or "restaurant"</li>
            <li>• Add your location to find nearby stores</li>
            <li>• Check different store categories</li>
          </ul>
        </div>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Results Header */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div>
              <p className="text-lg font-semibold">
                {filteredAndSortedStores.length} store{filteredAndSortedStores.length !== 1 ? 's' : ''}
              </p>
              <p className="text-sm text-muted-foreground">
                {stores.length !== filteredAndSortedStores.length && 
                  `${stores.length} total, filtered to ${filteredAndSortedStores.length}`
                }
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex bg-muted rounded-lg p-1">
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="h-8 px-3"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="h-8 px-3"
              >
                <Grid className="h-4 w-4" />
              </Button>
            </div>

            {/* Sort Dropdown */}
            <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
              <SelectTrigger className="w-40">
                <SortAsc className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Relevance</SelectItem>
                <SelectItem value="distance">Distance</SelectItem>
                <SelectItem value="name">Name A-Z</SelectItem>
                <SelectItem value="rating">Rating</SelectItem>
                <SelectItem value="recent">Recently Updated</SelectItem>
              </SelectContent>
            </Select>

            {/* Filter Toggle */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
              {selectedTypes.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {selectedTypes.length}
                </Badge>
              )}
            </Button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Store Types</h4>
                {selectedTypes.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear All
                  </Button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {storeTypes.map(([type, count]) => (
                  <Button
                    key={type}
                    variant={selectedTypes.includes(type) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleTypeFilter(type)}
                    className="flex items-center gap-2"
                  >
                    {type}
                    <Badge variant="secondary" className="text-xs">
                      {count}
                    </Badge>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Results Grid/List */}
      <div className={cn(
        "grid gap-4",
        viewMode === 'grid' 
          ? "md:grid-cols-2 lg:grid-cols-3" 
          : "grid-cols-1"
      )}>
        {filteredAndSortedStores.map((store) => (
          <UnifiedStoreCard 
            key={store.id}
            store={store}
            enhanced
          />
        ))}
      </div>

      {/* Load More (if needed for pagination) */}
      {filteredAndSortedStores.length >= 50 && (
        <Card className="p-4 text-center">
          <p className="text-muted-foreground mb-3">
            Showing first 50 results. Refine your search to see more specific results.
          </p>
        </Card>
      )}
    </div>
  );
};