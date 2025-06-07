
import React from 'react';
import { MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Tables } from '@/integrations/supabase/types';

type Store = Tables<'snap_stores'>;

interface AddressCardProps {
  store: Store;
}

export const AddressCard: React.FC<AddressCardProps> = ({ store }) => {
  const formatAddress = () => {
    const parts = [
      store.store_street_address,
      store.additional_address,
      store.city,
      store.state,
      store.zip_code
    ].filter(Boolean);
    
    return parts.join(', ');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Address</CardTitle>
      </CardHeader>
      <CardContent>
        {formatAddress() ? (
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-gray-900">{formatAddress()}</p>
              {(!store.store_street_address || !store.city) && (
                <p className="text-amber-600 text-sm mt-1">
                  ⚠️ Address information may be incomplete
                </p>
              )}
            </div>
          </div>
        ) : (
          <p className="text-gray-500">Address not available</p>
        )}
      </CardContent>
    </Card>
  );
};
