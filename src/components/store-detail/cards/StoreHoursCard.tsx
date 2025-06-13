
import React from 'react';
import { Clock, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StoreHoursCardProps {
  hours: Record<string, { open: string; close: string; closed: boolean }>;
}

const daysOfWeek = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
];

export const StoreHoursCard: React.FC<StoreHoursCardProps> = ({ hours }) => {
  const getCurrentDay = () => {
    return new Date().toLocaleDateString('en-US', { weekday: 'long' });
  };

  const currentDay = getCurrentDay();

  const formatTime = (time: string) => {
    // Convert 24-hour format to 12-hour format
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Store Hours
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {daysOfWeek.map((day) => {
            const dayHours = hours[day];
            const isToday = day === currentDay;
            
            return (
              <div 
                key={day} 
                className={`flex justify-between items-center py-2 px-3 rounded-lg ${
                  isToday ? 'bg-primary/10 border border-primary/20' : 'hover:bg-muted/50'
                }`}
              >
                <div className="flex items-center gap-2">
                  {isToday && <Calendar className="h-4 w-4 text-primary" />}
                  <span className={`font-medium ${isToday ? 'text-primary' : 'text-foreground'}`}>
                    {day}
                  </span>
                </div>
                <div className="text-right">
                  {dayHours?.closed ? (
                    <span className="text-muted-foreground">Closed</span>
                  ) : dayHours ? (
                    <span className={`text-sm ${isToday ? 'text-primary font-medium' : 'text-foreground'}`}>
                      {formatTime(dayHours.open)} - {formatTime(dayHours.close)}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">Hours not available</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Current status */}
        <div className="mt-4 p-3 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${
              hours[currentDay] && !hours[currentDay].closed ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            <span className="text-sm font-medium">
              {hours[currentDay] && !hours[currentDay].closed ? 'Open now' : 'Closed now'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
