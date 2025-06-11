
import React from 'react';
import { Phone, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AddPhoneModal } from '../modals/AddPhoneModal';
import type { Tables } from '@/integrations/supabase/types';

type Store = Tables<'snap_stores'>;

interface ContactInfoCardProps {
  store: Store;
}

export const ContactInfoCard: React.FC<ContactInfoCardProps> = ({ store }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Contact Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-6">
          <div className="flex justify-center gap-2 mb-3">
            <Phone className="h-6 w-6 text-muted-foreground" />
            <Globe className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground mb-4">Contact information not yet available</p>
          <p className="text-sm text-muted-foreground mb-4">
            Help the community by sharing contact details
          </p>
          <AddPhoneModal store={store} />
        </div>
      </CardContent>
    </Card>
  );
};
