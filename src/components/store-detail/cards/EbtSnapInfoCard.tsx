
import React from 'react';
import { Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Tables } from '@/integrations/supabase/types';

type Store = Tables<'snap_stores'>;

interface EbtSnapInfoCardProps {
  store: Store;
}

export const EbtSnapInfoCard: React.FC<EbtSnapInfoCardProps> = ({ store }) => {
  const participatesInRMP = store.incentive_program?.toLowerCase().includes('restaurant meals program') || 
                           store.incentive_program?.toLowerCase().includes('rmp');

  return (
    <Card>
      <CardHeader>
        <CardTitle>EBT & SNAP Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 bg-green-500 rounded-full"></div>
          <span className="text-sm font-medium text-green-700">EBT/SNAP Accepted</span>
        </div>
        
        {participatesInRMP && (
          <div className="flex items-start gap-3">
            <Star className="h-5 w-5 text-yellow-500 mt-0.5" />
            <div>
              <p className="text-gray-900 font-medium">Hot Meals Available</p>
              <p className="text-gray-600">This location participates in the Restaurant Meals Program (RMP)</p>
            </div>
          </div>
        )}

        {store.incentive_program && !participatesInRMP && (
          <div className="flex items-start gap-3">
            <Star className="h-5 w-5 text-yellow-500 mt-0.5" />
            <div>
              <p className="text-gray-900 font-medium">Incentive Program</p>
              <p className="text-gray-600">{store.incentive_program}</p>
            </div>
          </div>
        )}

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">EBT Usage Notes</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            {participatesInRMP ? (
              <li>• <span className="font-medium">Hot Meals:</span> Available at this location through RMP</li>
            ) : (
              <li>• Hot Meals: Check with store for availability</li>
            )}
            <li>• Double value programs: Check incentive details above</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
