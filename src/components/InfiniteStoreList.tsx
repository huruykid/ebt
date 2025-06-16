
import React, { useEffect } from 'react';
import { EnhancedStoreCard } from './EnhancedStoreCard';
import { LoadingSpinner } from './LoadingSpinner';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import type { StoreWithLocationData } from '@/types/storeTypes';

interface InfiniteStoreListProps {
  stores: StoreWithLocationData[][];
  isLoading: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  fetchNextPage: () => void;
}

export const InfiniteStoreList: React.FC<InfiniteStoreListProps> = ({
  stores,
  isLoading,
  isFetchingNextPage,
  hasNextPage,
  fetchNextPage
}) => {
  const { ref: loadMoreRef, isIntersecting } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '100px'
  });

  // Fetch next page when intersection observer triggers
  useEffect(() => {
    if (isIntersecting && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [isIntersecting, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Flatten all pages into a single array
  const allStores = stores.flat();

  if (isLoading && allStores.length === 0) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (!allStores || allStores.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {allStores.map((store, index) => (
        <EnhancedStoreCard key={`${store.id}-${index}`} store={store} />
      ))}
      
      {/* Load more trigger */}
      {hasNextPage && (
        <div ref={loadMoreRef} className="flex justify-center py-4">
          {isFetchingNextPage && <LoadingSpinner />}
        </div>
      )}
      
      {/* End of results indicator */}
      {!hasNextPage && allStores.length > 0 && (
        <div className="text-center py-4 text-muted-foreground text-sm">
          You've reached the end of the results
        </div>
      )}
    </div>
  );
};
