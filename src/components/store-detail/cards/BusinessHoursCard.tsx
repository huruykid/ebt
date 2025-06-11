
import React from 'react';
import { Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useYelpBusiness } from '@/hooks/useYelp';
import type { Tables } from '@/integrations/supabase/types';

type Store = Tables<'snap_stores'>;

interface GooglePlacesDetails {
  opening_hours?: {
    open_now: boolean;
    weekday_text: string[];
  };
}

interface BusinessHoursCardProps {
  googlePlacesData?: GooglePlacesDetails | null;
  store?: Store;
}

// Helper function to format Yelp hours
const formatYelpHours = (hours: Array<{
  open: Array<{
    is_overnight: boolean;
    start: string;
    end: string;
    day: number;
  }>;
  hours_type: string;
  is_open_now: boolean;
}>) => {
  if (!hours || hours.length === 0) return null;
  
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const regularHours = hours.find(h => h.hours_type === 'REGULAR');
  
  if (!regularHours) return null;
  
  // Group hours by day
  const dayHours: { [key: number]: string } = {};
  
  regularHours.open.forEach(({ day, start, end, is_overnight }) => {
    const formatTime = (time: string) => {
      const hour = parseInt(time.substring(0, 2));
      const minute = time.substring(2, 4);
      const period = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      return `${displayHour}:${minute} ${period}`;
    };
    
    if (is_overnight) {
      dayHours[day] = '24 Hours';
    } else {
      dayHours[day] = `${formatTime(start)} - ${formatTime(end)}`;
    }
  });
  
  // Create formatted array
  const formattedHours: string[] = [];
  for (let i = 0; i < 7; i++) {
    const dayName = dayNames[i];
    const hours = dayHours[i] || 'Closed';
    formattedHours.push(`${dayName}: ${hours}`);
  }
  
  return formattedHours;
};

export const BusinessHoursCard: React.FC<BusinessHoursCardProps> = ({ 
  googlePlacesData, 
  store 
}) => {
  // Fetch Yelp data for this store
  const { data: yelpData } = useYelpBusiness(
    store?.store_name || '',
    store?.latitude || 0,
    store?.longitude || 0,
    !!(store?.latitude && store?.longitude),
    store?.store_street_address || undefined,
    store?.city || undefined
  );

  // Prefer Yelp hours over Google Places hours
  const yelpHours = yelpData?.hours ? formatYelpHours(yelpData.hours) : null;
  const googleHours = googlePlacesData?.opening_hours?.weekday_text;
  const isOpen = yelpData?.hours?.[0]?.is_open_now ?? googlePlacesData?.opening_hours?.open_now;
  
  const displayHours = yelpHours || googleHours;
  
  if (!displayHours) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Hours
          {isOpen !== undefined && (
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
              isOpen 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              <div className={`h-2 w-2 rounded-full ${
                isOpen ? 'bg-green-500' : 'bg-red-500'
              }`} />
              {isOpen ? 'Open Now' : 'Closed'}
            </span>
          )}
          {yelpHours && (
            <span className="text-xs text-primary font-medium">• Yelp</span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {displayHours.map((day, index) => (
            <p key={index} className="text-sm text-gray-600">
              {day}
            </p>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
