
import React from 'react';
import type { Tables } from '@/integrations/supabase/types';
import { ContactInfoCard } from './cards/ContactInfoCard';
import { BusinessHoursCard } from './cards/BusinessHoursCard';
import { StoreMap } from './StoreMap';
import { AddressCard } from './cards/AddressCard';

type Store = Tables<'snap_stores'>;

interface EnhancedStoreInfoProps {
  store: Store;
}

export const EnhancedStoreInfo: React.FC<EnhancedStoreInfoProps> = ({ store }) => {
  return (
    <div className="space-y-4">
      <AddressCard store={store} />
      <StoreMap store={store} />
      <ContactInfoCard />
      <BusinessHoursCard store={store} />
    </div>
  );
};
