
import React from 'react';
import { SearchResults } from './SearchResults';
import type { SortOption } from '@/components/SortDropdown';
import type { StoreWithDistance } from '@/types/storeTypes';

interface CategorySearchResultsProps {
  stores: StoreWithDistance[];
  isLoading: boolean;
  error: Error | null;
  locationSearch: { lat: number; lng: number } | null;
  activeCategory: string;
  selectedStoreTypes: string[];
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  radius: number;
  onRadiusChange: (radius: number) => void;
  onCategoryChange: (categoryId: string, storeTypes?: string[], namePatterns?: string[]) => void;
  openNowFilter?: boolean;
  onOpenNowChange?: (enabled: boolean) => void;
}

export const CategorySearchResults: React.FC<CategorySearchResultsProps> = ({
  stores,
  isLoading,
  error,
  locationSearch,
  activeCategory,
  selectedStoreTypes,
  sortBy,
  onSortChange,
  radius,
  onRadiusChange,
  openNowFilter,
  onOpenNowChange,
}) => {
  return (
    <SearchResults
      stores={stores}
      isLoading={isLoading}
      error={error}
      locationSearch={locationSearch}
      activeCategory={activeCategory}
      selectedStoreTypes={selectedStoreTypes}
      sortBy={sortBy}
      onSortChange={onSortChange}
      radius={radius}
      onRadiusChange={onRadiusChange}
      openNowFilter={openNowFilter}
      onOpenNowChange={onOpenNowChange}
    />
  );
};
