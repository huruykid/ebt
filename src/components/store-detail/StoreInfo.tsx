
import React from 'react';
import { MapPin, Star, Phone, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Tables } from '@/integrations/supabase/types';

type Store = Tables<'snap_stores'>;

interface StoreInfoProps {
  store: Store;
}

export const StoreInfo: React.FC<StoreInfoProps> = ({ store }) => {
  const formatAddress = () => {
    const parts = [
      store.Store_Street_Address,
      store.Additional_Address,
      store.City,
      store.State,
      store.Zip_Code
    ].filter(Boolean);
    
    return parts.join(', ');
  };

  return (
    <div className="space-y-6">
      {/* Address */}
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
                {(!store.Store_Street_Address || !store.City) && (
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

      {/* EBT & SNAP Information */}
      <Card>
        <CardHeader>
          <CardTitle>EBT & SNAP Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium text-green-700">EBT/SNAP Accepted</span>
          </div>
          
          {store.Incentive_Program && (
            <div className="flex items-start gap-3">
              <Star className="h-5 w-5 text-yellow-500 mt-0.5" />
              <div>
                <p className="text-gray-900 font-medium">Incentive Program</p>
                <p className="text-gray-600">{store.Incentive_Program}</p>
              </div>
            </div>
          )}

          {/* EBT-specific notes placeholder */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">EBT Usage Notes</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Hot meal eligibility: Information coming soon</li>
              <li>• Restaurant meal program: Check with store</li>
              <li>• Double value programs: Check incentive details above</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Store Details */}
      <Card>
        <CardHeader>
          <CardTitle>Store Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {store.Grantee_Name && (
            <div>
              <p className="text-sm font-medium text-gray-500">Operated by</p>
              <p className="text-gray-900">{store.Grantee_Name}</p>
            </div>
          )}
          
          {store.County && (
            <div>
              <p className="text-sm font-medium text-gray-500">County</p>
              <p className="text-gray-900">{store.County}</p>
            </div>
          )}
          
          <div>
            <p className="text-sm font-medium text-gray-500">Store ID</p>
            <p className="text-gray-900">{store.id}</p>
          </div>
          
          {store.Record_ID && (
            <div>
              <p className="text-sm font-medium text-gray-500">Record ID</p>
              <p className="text-gray-900">{store.Record_ID}</p>
            </div>
          )}

          {/* Contact Information Placeholder */}
          <div className="pt-4 border-t border-gray-200">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-500">
                <Phone className="h-4 w-4" />
                <span className="text-sm">Phone number coming soon</span>
              </div>
              <div className="flex items-center gap-2 text-gray-500">
                <Clock className="h-4 w-4" />
                <span className="text-sm">Store hours coming soon</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
