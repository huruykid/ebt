
import React from 'react';
import { Clock, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Tables } from '@/integrations/supabase/types';

type Store = Tables<'snap_stores'>;

interface BusinessHoursCardProps {
  store?: Store;
}

export const BusinessHoursCard: React.FC<BusinessHoursCardProps> = ({ store }) => {
  const handleAddHours = () => {
    // TODO: Implement community hours submission
    console.log('Community hours submission coming soon');
  };

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
          <Button 
            onClick={handleAddHours}
            size="sm" 
            variant="outline"
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Store Hours
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
