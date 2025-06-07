
import React from 'react';
import { Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface GooglePlacesDetails {
  opening_hours?: {
    open_now: boolean;
    weekday_text: string[];
  };
}

interface BusinessHoursCardProps {
  googlePlacesData?: GooglePlacesDetails | null;
}

export const BusinessHoursCard: React.FC<BusinessHoursCardProps> = ({ googlePlacesData }) => {
  if (!googlePlacesData?.opening_hours) {
    return null;
  }

  const isBusinessOpen = googlePlacesData.opening_hours.open_now;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Hours
          {isBusinessOpen !== undefined && (
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
              isBusinessOpen 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              <div className={`h-2 w-2 rounded-full ${
                isBusinessOpen ? 'bg-green-500' : 'bg-red-500'
              }`} />
              {isBusinessOpen ? 'Open Now' : 'Closed'}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {googlePlacesData.opening_hours.weekday_text.map((day, index) => (
            <p key={index} className="text-sm text-gray-600">
              {day}
            </p>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
