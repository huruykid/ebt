
import React from 'react';
import type { Tables } from '@/integrations/supabase/types';
import { ContactInfoCard } from './cards/ContactInfoCard';
import { BusinessHoursCard } from './cards/BusinessHoursCard';
import { GoogleReviewsCard } from './cards/GoogleReviewsCard';

type Store = Tables<'snap_stores'>;

interface GooglePlacesDetails {
  formatted_phone_number?: string;
  international_phone_number?: string;
  opening_hours?: {
    open_now: boolean;
    weekday_text: string[];
  };
  rating?: number;
  user_ratings_total?: number;
  website?: string;
  business_status?: string;
}

interface EnhancedStoreInfoProps {
  store: Store;
  googlePlacesData?: GooglePlacesDetails | null;
}

export const EnhancedStoreInfo: React.FC<EnhancedStoreInfoProps> = ({ 
  store, 
  googlePlacesData 
}) => {
  return (
    <div className="space-y-6">
      <ContactInfoCard googlePlacesData={googlePlacesData} />
      <BusinessHoursCard googlePlacesData={googlePlacesData} />
      <GoogleReviewsCard googlePlacesData={googlePlacesData} />
    </div>
  );
};
