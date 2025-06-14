
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Phone, Globe, Clock, MapPin, Plus, Store } from 'lucide-react';
import { useEnhancedStoreData } from '@/hooks/useEnhancedStoreData';
import { AddPhoneModal } from '@/components/store-detail/modals/AddPhoneModal';
import { AddHoursModal } from '@/components/store-detail/modals/AddHoursModal';
import type { Tables } from '@/integrations/supabase/types';

type Store = Tables<'snap_stores'>;

interface UserStoreContributionsProps {
  stores: Store[];
}

interface StoreContributionCardProps {
  store: Store;
}

const StoreContributionCard: React.FC<StoreContributionCardProps> = ({ store }) => {
  const { data: enhancedData, isLoading } = useEnhancedStoreData(store);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-3 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasPhone = enhancedData?.phone;
  const hasWebsite = enhancedData?.website;
  const hasHours = enhancedData?.hours;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Store className="h-4 w-4" />
          {store.Store_Name}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {store.Store_Street_Address}, {store.City}, {store.State}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Information */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Available Information</h4>
          
          {hasPhone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-3 w-3 text-green-600" />
              <span>{enhancedData.phone}</span>
              <Badge variant="outline" className="text-xs">Available</Badge>
            </div>
          )}
          
          {hasWebsite && (
            <div className="flex items-center gap-2 text-sm">
              <Globe className="h-3 w-3 text-green-600" />
              <span className="truncate">{enhancedData.website}</span>
              <Badge variant="outline" className="text-xs">Available</Badge>
            </div>
          )}
          
          {hasHours && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-3 w-3 text-green-600" />
              <span>{enhancedData.hours}</span>
              <Badge variant="outline" className="text-xs">Available</Badge>
            </div>
          )}
        </div>

        {/* Missing Information - Contribution Opportunities */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Help Complete This Store</h4>
          <div className="flex flex-wrap gap-2">
            {!hasPhone && (
              <AddPhoneModal store={store}>
                <Button variant="outline" size="sm" className="text-xs">
                  <Plus className="h-3 w-3 mr-1" />
                  Add Phone
                </Button>
              </AddPhoneModal>
            )}
            
            {!hasHours && (
              <AddHoursModal store={store}>
                <Button variant="outline" size="sm" className="text-xs">
                  <Plus className="h-3 w-3 mr-1" />
                  Add Hours
                </Button>
              </AddHoursModal>
            )}
            
            {!hasWebsite && (
              <Button variant="outline" size="sm" className="text-xs" disabled>
                <Plus className="h-3 w-3 mr-1" />
                Add Website (Coming Soon)
              </Button>
            )}
          </div>
        </div>

        {/* Data Sources */}
        {enhancedData && (
          <div className="pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Data from: {enhancedData.data_sources.join(', ')} • 
              Confidence: {Math.round(enhancedData.confidence_score * 100)}%
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const UserStoreContributions: React.FC<UserStoreContributionsProps> = ({ stores }) => {
  if (!stores || stores.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            Your Store Contributions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            No store contributions yet. Visit store detail pages to start contributing!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            Your Store Contributions
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Help improve store information and earn points for your contributions
          </p>
        </CardHeader>
      </Card>
      
      <div className="grid gap-4">
        {stores.slice(0, 5).map((store) => (
          <StoreContributionCard key={store.id} store={store} />
        ))}
      </div>
      
      {stores.length > 5 && (
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground">
              And {stores.length - 5} more stores you can contribute to...
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
