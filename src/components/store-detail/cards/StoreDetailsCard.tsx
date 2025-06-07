
import React from 'react';
import { CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Tables } from '@/integrations/supabase/types';

type Store = Tables<'snap_stores'>;

interface GooglePlacesDetails {
  business_status?: string;
}

interface StoreDetailsCardProps {
  store: Store;
  googlePlacesData?: GooglePlacesDetails | null;
}

export const StoreDetailsCard: React.FC<StoreDetailsCardProps> = ({ store, googlePlacesData }) => {
  const businessStatus = googlePlacesData?.business_status;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Store Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {businessStatus && (
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium">
              Business Status: {businessStatus.replace('_', ' ').toUpperCase()}
            </span>
          </div>
        )}

        {store.grantee_name && (
          <div>
            <p className="text-sm font-medium text-gray-500">Operated by</p>
            <p className="text-gray-900">{store.grantee_name}</p>
          </div>
        )}
        
        {store.county && (
          <div>
            <p className="text-sm font-medium text-gray-500">County</p>
            <p className="text-gray-900">{store.county}</p>
          </div>
        )}
        
        <div>
          <p className="text-sm font-medium text-gray-500">Store ID</p>
          <p className="text-gray-900">{store.id}</p>
        </div>
      </CardContent>
    </Card>
  );
};
