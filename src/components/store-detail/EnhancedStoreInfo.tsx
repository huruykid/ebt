
import React from 'react';
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
