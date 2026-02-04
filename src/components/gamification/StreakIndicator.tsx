import React from 'react';
import { Flame, Snowflake } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useUserPoints } from '@/hooks/useUserPoints';
import { useAuth } from '@/contexts/AuthContext';

interface StreakIndicatorProps {
  showTooltip?: boolean;
  className?: string;
}

export const StreakIndicator: React.FC<StreakIndicatorProps> = ({
  showTooltip = true,
  className = '',
}) => {
  const { user } = useAuth();
  const { points } = useUserPoints();

  if (!user) return null;

  const streak = points?.current_streak || 0;
  const longestStreak = points?.longest_streak || 0;
  const lastActivity = points?.last_activity_date;

  // Check if streak is at risk (last activity was yesterday)
  const today = new Date().toISOString().split('T')[0];
  const isActive = lastActivity === today;
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const atRisk = lastActivity === yesterday;

  if (streak === 0 && !atRisk) return null;

  const indicator = (
    <Badge 
      variant="outline" 
      className={`flex items-center gap-1.5 px-2.5 py-1 ${
        atRisk && !isActive
          ? 'border-orange-300 bg-orange-50 text-orange-700 dark:border-orange-700 dark:bg-orange-950 dark:text-orange-300'
          : streak >= 7
          ? 'border-red-300 bg-red-50 text-red-700 dark:border-red-700 dark:bg-red-950 dark:text-red-300'
          : 'border-orange-300 bg-orange-50 text-orange-600 dark:border-orange-700 dark:bg-orange-950 dark:text-orange-400'
      } ${className}`}
    >
      {atRisk && !isActive ? (
        <Snowflake className="h-3.5 w-3.5 animate-pulse" />
      ) : (
        <Flame className={`h-3.5 w-3.5 ${streak >= 7 ? 'animate-pulse' : ''}`} />
      )}
      <span className="font-semibold">
        {streak} day{streak !== 1 ? 's' : ''}
      </span>
    </Badge>
  );

  if (!showTooltip) return indicator;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {indicator}
        </TooltipTrigger>
        <TooltipContent side="bottom">
          {atRisk && !isActive ? (
            <p className="text-orange-600">⚠️ Visit today to keep your streak!</p>
          ) : (
            <>
              <p className="font-medium">
                🔥 {streak} day streak!
              </p>
              {longestStreak > streak && (
                <p className="text-xs text-muted-foreground">
                  Personal best: {longestStreak} days
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                +25 bonus points at 7 days!
              </p>
            </>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default StreakIndicator;
