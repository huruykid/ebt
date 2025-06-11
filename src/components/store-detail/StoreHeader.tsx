
import React from 'react';
import { Star, MapPin, Phone, Clock, Tag, Globe, Utensils } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Tables } from '@/integrations/supabase/types';

type Store = Tables<'snap_stores'>;

interface StoreHeaderProps {
  store: Store;
}

export const StoreHeader: React.FC<StoreHeaderProps> = ({ store }) => {
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

  const getStoreTypeColor = (type: string | null) => {
    switch (type?.toLowerCase()) {
      case 'supermarket':
        return 'bg-primary/10 text-primary';
      case 'convenience store':
        return 'bg-secondary text-secondary-foreground';
      case 'grocery store':
        return 'bg-accent/10 text-accent-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  // Check if store is enrolled in RMP (Restaurant Meals Program)
  const isRmpEnrolled = store.incentive_program?.toLowerCase().includes('rmp') || 
                       store.incentive_program?.toLowerCase().includes('restaurant meals program');

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-foreground mb-2">{store.store_name}</h1>
            <div className="flex flex-col gap-1 mb-3">
              {/* Community review placeholder */}
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star} 
                    className="h-5 w-5 text-gray-300 stroke-gray-400 stroke-2"
                  />
                ))}
                <span className="ml-2 text-muted-foreground text-xs">
                  No community reviews yet
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {store.store_type && (
                <span className={`inline-block px-3 py-1 rounded-spotify text-sm font-medium ${getStoreTypeColor(store.store_type)}`}>
                  {store.store_type}
                </span>
              )}
              {store.incentive_program && (
                <span className="inline-block px-3 py-1 rounded-spotify text-sm font-medium bg-primary/10 text-primary">
                  <Star className="h-3 w-3 inline mr-1" />
                  {store.incentive_program}
                </span>
              )}
              <span className="inline-block px-3 py-1 rounded-spotify text-sm font-medium bg-accent text-accent-foreground">
                <Tag className="h-3 w-3 inline mr-1" />
                EBT Accepted
              </span>
              {isRmpEnrolled && (
                <span className="inline-block px-3 py-1 rounded-spotify text-sm font-medium bg-secondary text-secondary-foreground">
                  <Utensils className="h-3 w-3 inline mr-1" />
                  Hot Foods Accepted
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-2 items-end">
            <Button variant="outline" size="sm">
              Claim this Business
            </Button>
            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
              Report a Problem
            </Button>
          </div>
        </div>

        {/* Quick Info - Using only available data */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4 border-t border-border">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4 flex-shrink-0" />
            <span className="body-sm">{formatAddress() || 'Address not available'}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone className="h-4 w-4 flex-shrink-0" />
            <span className="body-sm">Phone: Community can add</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4 flex-shrink-0" />
            <span className="body-sm">Hours: Community can add</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
