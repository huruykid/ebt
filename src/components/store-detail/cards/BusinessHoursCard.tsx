
import React from 'react';
import { Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AddHoursModal } from '../modals/AddHoursModal';
import type { Tables } from '@/integrations/supabase/types';

type Store = Tables<'snap_stores'>;

interface BusinessHoursCardProps {
  store: Store;
}

export const BusinessHoursCard: React.FC<BusinessHoursCardProps> = ({ store }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Hours
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-6">
          <Clock className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground mb-4">Store hours not yet available</p>
          <p className="text-sm text-muted-foreground mb-4">
            Help the community by sharing the store hours
          </p>
          <AddHoursModal store={store} />
        </div>
      </CardContent>
    </Card>
  );
};
