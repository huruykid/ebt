
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Phone, Globe, Clock, MapPin, Building, Star } from 'lucide-react';
import { useOverpassData } from '@/hooks/useOverpassData';
import type { Tables } from '@/integrations/supabase/types';

type Store = Tables<'snap_stores'>;

interface OverpassDataCardProps {
  store: Store;
}

export const OverpassDataCard: React.FC<OverpassDataCardProps> = ({ store }) => {
  const { data: overpassData, isLoading, error } = useOverpassData({
    storeName: store.Store_Name || '',
    latitude: store.Latitude || 0,
    longitude: store.Longitude || 0,
    enabled: !!(store.Store_Name && store.Latitude && store.Longitude)
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            OpenStreetMap Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !overpassData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            OpenStreetMap Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            No additional data found in OpenStreetMap database.
          </p>
        </CardContent>
      </Card>
    );
  }

  const formatOpeningHours = (hours: string) => {
    // Basic formatting for common OSM opening hours format
    return hours.replace(/;/g, ' • ').replace(/:/g, ': ');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          OpenStreetMap Data
          <Badge variant="outline" className="ml-auto">
            {Math.round(overpassData.confidence_score * 100)}% match
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Phone Number */}
        {overpassData.phone && (
          <div className="flex items-center gap-3">
            <Phone className="h-4 w-4 text-primary flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Phone</p>
              <a 
                href={`tel:${overpassData.phone}`}
                className="text-foreground hover:text-primary transition-colors"
              >
                {overpassData.phone}
              </a>
            </div>
          </div>
        )}

        {/* Website */}
        {overpassData.website && (
          <div className="flex items-center gap-3">
            <Globe className="h-4 w-4 text-primary flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Website</p>
              <a 
                href={overpassData.website.startsWith('http') ? overpassData.website : `https://${overpassData.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground hover:text-primary transition-colors break-all"
              >
                {overpassData.website}
              </a>
            </div>
          </div>
        )}

        {/* Opening Hours */}
        {overpassData.opening_hours && (
          <div className="flex items-start gap-3">
            <Clock className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Opening Hours</p>
              <p className="text-foreground text-sm">
                {formatOpeningHours(overpassData.opening_hours)}
              </p>
            </div>
          </div>
        )}

        {/* Shop Type */}
        {overpassData.shop_type && (
          <div className="flex items-center gap-3">
            <Building className="h-4 w-4 text-primary flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Category</p>
              <Badge variant="secondary" className="capitalize">
                {overpassData.shop_type.replace(/_/g, ' ')}
              </Badge>
            </div>
          </div>
        )}

        {/* Brand/Operator */}
        {(overpassData.brand || overpassData.operator) && (
          <div className="flex items-center gap-3">
            <Star className="h-4 w-4 text-primary flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {overpassData.brand ? 'Brand' : 'Operator'}
              </p>
              <p className="text-foreground">
                {overpassData.brand || overpassData.operator}
              </p>
            </div>
          </div>
        )}

        {/* Full Address */}
        {overpassData.full_address && (
          <div className="flex items-start gap-3">
            <MapPin className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">OSM Address</p>
              <p className="text-foreground text-sm">
                {overpassData.full_address}
              </p>
            </div>
          </div>
        )}

        {/* Source Attribution */}
        <div className="pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Data from OpenStreetMap contributors • OSM ID: {overpassData.osm_id}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
