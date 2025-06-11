
import React from 'react';
import { StoreCard } from './StoreCard';
import type { StoreWithGoogleData } from '@/hooks/useStoreGoogleData';

interface StoreListProps {
  stores: StoreWithGoogleData[];
}

export const StoreList: React.FC<StoreListProps> = ({ stores }) => {
  if (!stores || !Array.isArray(stores) || stores.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {stores.map((store) => (
        <StoreCard key={store.id} store={store} />
      ))}
    </div>
  );
};
