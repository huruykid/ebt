
import React from 'react';
import { Star, MapPin, Tag, Globe, Utensils, Building2, Phone, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StoreRatingDisplay } from '@/components/reviews/StoreRatingDisplay';
import { AddPhoneModal } from './modals/AddPhoneModal';
import { AddHoursModal } from './modals/AddHoursModal';
import type { Tables } from '@/integrations/supabase/types';

type Store = Tables<'snap_stores'>;

interface StoreHeaderProps {
  store: Store;
}

export const StoreHeader: React.FC<StoreHeaderProps> = ({ store }) => {
  const formatAddress = () => {
    const parts = [
      store.store_street_address,
      store.city,
      store.state,
      store.zip_code
    ].filter(Boolean);
    
    return parts.join(', ');
  };

  const openInMaps = () => {
    const address = encodeURIComponent(formatAddress());
    const url = `https://www.google.com/maps/search/?api=1&query=${address}`;
    window.open(url, '_blank');
  };

  const getStoreTypeIcon = (type: string | null) => {
    switch (type?.toLowerCase()) {
      case 'supermarket':
      case 'super store':
        return Building2;
      case 'convenience store':
        return Building2;
      case 'grocery store':
        return Building2;
      default:
        return Building2;
    }
  };

  const getStoreTypeColor = (type: string | null) => {
    switch (type?.toLowerCase()) {
      case 'supermarket':
      case 'super store':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'convenience store':
        return 'bg-secondary/10 text-secondary-foreground border-secondary/20';
      case 'grocery store':
        return 'bg-accent/10 text-accent-foreground border-accent/20';
      default:
        return 'bg-muted/10 text-muted-foreground border-muted/20';
    }
  };

  const StoreTypeIcon = getStoreTypeIcon(store.store_type);

  // Check if store accepts hot foods (RMP)
  const isRmpEnrolled = store.incentive_program?.toLowerCase().includes('rmp') || 
                       store.incentive_program?.toLowerCase().includes('restaurant meals program');

  return (
    <Card className="overflow-hidden border-0 shadow-lg">
      <CardContent className="p-6 lg:p-8">
        <div className="space-y-6">
          {/* Store Name and Rating */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2 leading-tight">
                  {store.store_name}
                </h1>
                <StoreRatingDisplay storeId={store.id} className="mb-3" />
              </div>
              
              <div className="flex flex-col gap-2 sm:items-end">
                <Button variant="outline" size="sm" className="w-full sm:w-auto">
                  Claim Business
                </Button>
                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive w-full sm:w-auto">
                  Report Issue
                </Button>
              </div>
            </div>

            {/* Store Badges */}
            <div className="flex flex-wrap gap-2">
              {store.store_type && (
                <Badge variant="secondary" className={`${getStoreTypeColor(store.store_type)} border`}>
                  <StoreTypeIcon className="h-3 w-3 mr-1" />
                  {store.store_type}
                </Badge>
              )}
              
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <Tag className="h-3 w-3 mr-1" />
                EBT Accepted
              </Badge>
              
              {store.incentive_program && (
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                  <Star className="h-3 w-3 mr-1" />
                  {store.incentive_program}
                </Badge>
              )}
              
              {isRmpEnrolled && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  <Utensils className="h-3 w-3 mr-1" />
                  Hot Foods Eligible
                </Badge>
              )}
            </div>
          </div>

          {/* Quick Info Grid with Better Contrast */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4 border-t border-border bg-muted/30 rounded-lg p-4">
            <div className="flex items-start gap-3 text-sm">
              <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-foreground">Address</p>
                <button
                  onClick={openInMaps}
                  className="text-primary underline hover:text-primary/80 transition-colors text-left"
                >
                  {formatAddress() || 'Address not available'}
                </button>
              </div>
            </div>
            
            <div className="flex items-start gap-3 text-sm">
              <Phone className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-semibold text-foreground mb-2">Phone</p>
                <AddPhoneModal store={store} />
              </div>
            </div>
            
            <div className="flex items-start gap-3 text-sm">
              <Clock className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-semibold text-foreground mb-2">Hours</p>
                <AddHoursModal store={store} />
              </div>
            </div>
          </div>

          {/* EBT Information */}
          {store.incentive_program && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                <Star className="h-4 w-4" />
                Incentive Program Available
              </h3>
              <p className="text-green-800 text-sm">{store.incentive_program}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
