
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { StoreCard } from '@/components/StoreCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import type { Tables } from '@/integrations/supabase/types';

type Store = Tables<'snap_stores'>;

interface StoreWithDistance extends Store {
  distance?: number;
}

interface SmartSearchResultsProps {
  stores: StoreWithDistance[];
  isLoading: boolean;
  error: Error | null;
  searchParams: {
    searchText: string;
    city?: string;
    zipCode?: string;
  };
  onBackToCategories: () => void;
}

export const SmartSearchResults: React.FC<SmartSearchResultsProps> = ({
  stores,
  isLoading,
  error,
  searchParams,
  onBackToCategories
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="card-gradient rounded-spotify-xl p-6 border-2 border-destructive/20">
          <p className="text-destructive font-semibold">⚠️ Error loading stores. Please try again.</p>
        </div>
      </div>
    );
  }

  if (stores.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="card-gradient rounded-spotify-xl p-8 border-2 border-muted/20">
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-muted-foreground text-lg">
            No stores found for "{searchParams.searchText}"
            {searchParams.city && ` in ${searchParams.city}`}
            {searchParams.zipCode && ` (${searchParams.zipCode})`}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Try adjusting your search terms or location filters
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="card-gradient rounded-spotify-lg p-4 border-2 border-success/20">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Found {stores.length} stores
            {searchParams.city && ` in ${searchParams.city}`}
            {searchParams.zipCode && ` (${searchParams.zipCode})`}
          </p>
          <button
            onClick={onBackToCategories}
            className="text-sm text-primary hover:underline"
          >
            Back to categories
          </button>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1">
        {stores.map((store) => (
          <StoreCard 
            key={store.id}
            store={store}
          />
        ))}
      </div>
    </div>
  );
};
