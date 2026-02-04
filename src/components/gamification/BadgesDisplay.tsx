import React from 'react';
import { Award, Lock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useUserPoints } from '@/hooks/useUserPoints';
import { useAuth } from '@/contexts/AuthContext';

interface BadgesDisplayProps {
  showLocked?: boolean;
  limit?: number;
  className?: string;
}

export const BadgesDisplay: React.FC<BadgesDisplayProps> = ({
  showLocked = true,
  limit,
  className = '',
}) => {
  const { user } = useAuth();
  const { userBadges, allBadges, isLoading } = useUserPoints();

  if (!user) return null;

  if (isLoading) {
    return (
      <Card className={`border-0 shadow-sm ${className}`}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Award className="h-4 w-4 text-primary" />
            Badges
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-10 w-10 rounded-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const earnedBadgeIds = new Set(userBadges?.map(ub => ub.badge_id) || []);
  const earnedBadges = userBadges?.map(ub => ({
    ...ub.badges,
    earned_at: ub.earned_at,
  })) || [];
  
  const lockedBadges = allBadges?.filter(b => !earnedBadgeIds.has(b.id)) || [];

  const displayBadges = limit
    ? earnedBadges.slice(0, limit)
    : earnedBadges;

  const displayLockedBadges = showLocked && !limit
    ? lockedBadges
    : [];

  return (
    <Card className={`border-0 shadow-sm ${className}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Award className="h-4 w-4 text-primary" />
            Badges
          </CardTitle>
          {earnedBadges.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {earnedBadges.length} earned
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {earnedBadges.length === 0 && lockedBadges.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Start contributing to earn badges!
          </p>
        ) : (
          <TooltipProvider>
            <div className="flex gap-2 flex-wrap">
              {/* Earned badges */}
              {displayBadges.map(badge => (
                <Tooltip key={badge.id}>
                  <TooltipTrigger asChild>
                    <button className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-xl hover:scale-110 transition-transform animate-fade-in">
                      {badge.icon}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[200px]">
                    <p className="font-semibold">{badge.name}</p>
                    <p className="text-xs text-muted-foreground">{badge.description}</p>
                  </TooltipContent>
                </Tooltip>
              ))}

              {/* Locked badges */}
              {displayLockedBadges.map(badge => (
                <Tooltip key={badge.id}>
                  <TooltipTrigger asChild>
                    <button className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-xl opacity-40 grayscale">
                      <div className="relative">
                        <span className="blur-[2px]">{badge.icon}</span>
                        <Lock className="h-3 w-3 absolute -bottom-1 -right-1 text-muted-foreground" />
                      </div>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[200px]">
                    <p className="font-semibold">🔒 {badge.name}</p>
                    <p className="text-xs text-muted-foreground">{badge.description}</p>
                    {badge.points_required > 0 && (
                      <p className="text-xs text-primary mt-1">
                        Requires {badge.points_required} points
                      </p>
                    )}
                    {badge.contribution_count > 0 && (
                      <p className="text-xs text-primary mt-1">
                        Requires {badge.contribution_count} {badge.contribution_type?.replace('_', ' ')}s
                      </p>
                    )}
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </TooltipProvider>
        )}
      </CardContent>
    </Card>
  );
};

export default BadgesDisplay;
