
import React from 'react';
import { StoreCard } from './StoreCard';
import type { StoreWithLocationData } from '@/types/storeTypes';

interface StoreListProps {
  stores: StoreWithLocationData[];
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
