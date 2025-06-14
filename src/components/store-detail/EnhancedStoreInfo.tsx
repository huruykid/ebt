
import React from 'react';
import { AddressCard } from './cards/AddressCard';
import { StoreDetailsCard } from './cards/StoreDetailsCard';
import { CommunityReviewsCard } from './cards/CommunityReviewsCard';
import { GoogleReviewsCard } from './cards/GoogleReviewsCard';
import { OverpassDataCard } from './cards/OverpassDataCard';
import { useGooglePlaces } from '@/hooks/useGooglePlaces';
import type { Tables } from '@/integrations/supabase/types';

type Store = Tables<'snap_stores'>;

interface EnhancedStoreInfoProps {
  store: Store;
}

export const EnhancedStoreInfo: React.FC<EnhancedStoreInfoProps> = ({ store }) => {
  return (
    <div className="space-y-4">
      {/* Location and directions card completely removed */}
    </div>
  );
};
