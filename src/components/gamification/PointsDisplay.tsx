import React from 'react';
import { Flame, Star, Trophy, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useUserPoints } from '@/hooks/useUserPoints';
import { useAuth } from '@/contexts/AuthContext';

interface PointsDisplayProps {
  compact?: boolean;
  className?: string;
}

export const PointsDisplay: React.FC<PointsDisplayProps> = ({ 
  compact = false,
  className = '' 
}) => {
  const { user } = useAuth();
  const { points, isLoading, allBadges } = useUserPoints();

  if (!user) return null;

  if (isLoading) {
    return (
      <Card className={`border-0 shadow-sm ${className}`}>
        <CardContent className="p-4">
          <Skeleton className="h-6 w-32 mb-2" />
          <Skeleton className="h-4 w-24" />
        </CardContent>
      </Card>
    );
  }

  const currentPoints = points?.total_points || 0;
  const streak = points?.current_streak || 0;

  // Find next badge level
  const pointBadges = allBadges?.filter(b => b.points_required > 0) || [];
  const nextBadge = pointBadges.find(b => b.points_required > currentPoints);
  const progressToNext = nextBadge 
    ? Math.min(100, (currentPoints / nextBadge.points_required) * 100)
    : 100;

  if (compact) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <Badge variant="secondary" className="flex items-center gap-1.5 px-2.5 py-1">
          <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
          <span className="font-semibold">{currentPoints}</span>
        </Badge>
        {streak > 0 && (
          <Badge variant="outline" className="flex items-center gap-1.5 px-2.5 py-1">
            <Flame className="h-3.5 w-3.5 text-orange-500" />
            <span>{streak}</span>
          </Badge>
        )}
      </div>
    );
  }

  return (
    <Card className={`border-0 shadow-sm bg-gradient-to-br from-primary/5 to-primary/10 ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
              <span className="text-2xl font-bold text-foreground">{currentPoints}</span>
              <span className="text-sm text-muted-foreground">points</span>
            </div>
            {nextBadge && (
              <p className="text-xs text-muted-foreground">
                {nextBadge.points_required - currentPoints} pts to {nextBadge.name}
              </p>
            )}
          </div>
          
          {streak > 0 && (
            <div className="flex items-center gap-1.5 bg-orange-100 dark:bg-orange-950 px-2.5 py-1.5 rounded-full">
              <Flame className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                {streak} day{streak > 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>

        {nextBadge && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Progress to {nextBadge.icon} {nextBadge.name}</span>
              <span className="font-medium">{Math.round(progressToNext)}%</span>
            </div>
            <Progress value={progressToNext} className="h-2" />
          </div>
        )}

        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border/50">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Zap className="h-3.5 w-3.5" />
            <span>+15 for reviews</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Trophy className="h-3.5 w-3.5" />
            <span>+25 weekly streak</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PointsDisplay;
