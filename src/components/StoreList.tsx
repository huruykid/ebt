
import React from 'react';
import { StoreCard } from './StoreCard';
import type { StoreWithGoogleData } from '@/hooks/useStoreGoogleData';

interface StoreListProps {
  stores: StoreWithGoogleData[];
}

export const StoreList: React.FC<StoreListProps> = ({ stores }) => {
  return (
    <div className="space-y-4">
      {stores.map((store) => (
        <StoreCard key={store.id} store={store} />
      ))}
    </div>
  );
};
