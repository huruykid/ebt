import React, { useState } from 'react';
import { Clock, ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useIsMobile } from '@/hooks/use-mobile';
import type { StoredGooglePlacesData } from '@/hooks/useStoredGooglePlaces';

interface EnhancedGooglePlacesInfoProps {
  googleData: StoredGooglePlacesData | null;
  storeName: string;
  fallbackAddress?: string;
}

export const EnhancedGooglePlacesInfo: React.FC<EnhancedGooglePlacesInfoProps> = ({
  googleData,
  storeName,
  fallbackAddress,
}) => {
  const isMobile = useIsMobile();
  const [hoursOpen, setHoursOpen] = useState(!isMobile);

  if (!googleData) return null;

  const weekdayText = googleData.opening_hours?.weekday_text || [];
  const isOpen = googleData.opening_hours?.open_now;

  if (weekdayText.length === 0) return null;

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <Collapsible open={hoursOpen} onOpenChange={setHoursOpen}>
        <CollapsibleTrigger className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Clock className="h-4 w-4" />
            Hours
            {isOpen !== undefined && (
              <span className={`text-xs font-medium ${isOpen ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                · {isOpen ? 'Open' : 'Closed'}
              </span>
            )}
          </div>
          <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${hoursOpen ? 'rotate-180' : ''}`} />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-4 pb-3 space-y-0.5">
            {weekdayText.map((dayHours, index) => {
              const [day, hours] = dayHours.split(': ');
              const isToday = new Date().getDay() === (index === 6 ? 0 : index + 1);
              return (
                <div
                  key={index}
                  className={`flex justify-between py-1 text-sm ${
                    isToday ? 'font-medium text-primary' : 'text-muted-foreground'
                  }`}
                >
                  <span>{day}</span>
                  <span>{hours}</span>
                </div>
              );
            })}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};
