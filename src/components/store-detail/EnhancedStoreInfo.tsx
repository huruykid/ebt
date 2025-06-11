
import React from 'react';
import type { Tables } from '@/integrations/supabase/types';
import { ContactInfoCard } from './cards/ContactInfoCard';
import { BusinessHoursCard } from './cards/BusinessHoursCard';
import { CommunityReviewsCard } from './cards/CommunityReviewsCard';

type Store = Tables<'snap_stores'>;

interface EnhancedStoreInfoProps {
  store: Store;
}

export const EnhancedStoreInfo: React.FC<EnhancedStoreInfoProps> = ({ store }) => {
  return (
    <div className="space-y-6">
      <ContactInfoCard />
      <BusinessHoursCard store={store} />
      <CommunityReviewsCard />
    </div>
  );
};
