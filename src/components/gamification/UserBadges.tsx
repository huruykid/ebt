
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BadgeDisplay } from './BadgeDisplay';
import { Award, Lock } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type Badge = Tables<'badges'>;
type UserBadge = Tables<'user_badges'> & {
  badges: Badge;
};

interface UserBadgesProps {
  userBadges: UserBadge[] | undefined;
  allBadges: Badge[] | undefined;
  userStats: any;
  compact?: boolean;
}

export const UserBadges: React.FC<UserBadgesProps> = ({
  userBadges = [],
  allBadges = [],
  userStats,
  compact = false
}) => {
  const earnedBadgeIds = new Set(userBadges.map(ub => ub.badge_id));
  const totalContributions = userStats?.total_contributions || 0;

  if (compact) {
    const earnedBadges = userBadges.slice(0, 3);
    return (
      <div className="flex items-center gap-2">
        {earnedBadges.map((userBadge) => (
          <BadgeDisplay
            key={userBadge.id}
            badge={userBadge.badges}
            earned={true}
            size="sm"
          />
        ))}
        {userBadges.length > 3 && (
          <div className="text-xs text-muted-foreground">
            +{userBadges.length - 3} more
          </div>
        )}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5" />
          Badges ({userBadges.length}/{allBadges.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {allBadges.map((badge) => {
          const userBadge = userBadges.find(ub => ub.badge_id === badge.id);
          const isEarned = earnedBadgeIds.has(badge.id);
          const isClose = !isEarned && 
            badge.contributions_required && 
            totalContributions >= (badge.contributions_required * 0.8);

          return (
            <div key={badge.id} className="relative">
              <BadgeDisplay
                badge={badge}
                earned={isEarned}
                earnedAt={userBadge?.earned_at}
                showDescription={true}
              />
              {!isEarned && (
                <div className="absolute top-2 right-2">
                  {isClose ? (
                    <div className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-medium">
                      Almost there!
                    </div>
                  ) : (
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              )}
              {!isEarned && badge.contributions_required && (
                <div className="mt-2 text-xs text-muted-foreground">
                  Progress: {totalContributions}/{badge.contributions_required} contributions
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
