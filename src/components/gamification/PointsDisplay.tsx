
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Star, Target, TrendingUp } from 'lucide-react';

interface PointsDisplayProps {
  userStats: {
    total_points: number | null;
    total_contributions: number | null;
    stores_contributed_to: number | null;
    reviews_count: number | null;
    photos_count: number | null;
    hours_count: number | null;
    verified_contributions: number | null;
  } | null;
  compact?: boolean;
}

export const PointsDisplay: React.FC<PointsDisplayProps> = ({ 
  userStats, 
  compact = false 
}) => {
  if (!userStats) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="flex items-center justify-center mb-3">
            <Star className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">Start contributing to earn points!</p>
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="flex items-center gap-1">
          <Trophy className="h-3 w-3" />
          {userStats.total_points || 0} pts
        </Badge>
        <Badge variant="outline" className="flex items-center gap-1">
          <Target className="h-3 w-3" />
          {userStats.total_contributions || 0} contributions
        </Badge>
      </div>
    );
  }

  const stats = [
    {
      label: 'Total Points',
      value: userStats.total_points || 0,
      icon: Trophy,
      color: 'text-yellow-600'
    },
    {
      label: 'Contributions',
      value: userStats.total_contributions || 0,
      icon: Target,
      color: 'text-blue-600'
    },
    {
      label: 'Stores Helped',
      value: userStats.stores_contributed_to || 0,
      icon: TrendingUp,
      color: 'text-green-600'
    },
    {
      label: 'Verified Actions',
      value: userStats.verified_contributions || 0,
      icon: Star,
      color: 'text-purple-600'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-600" />
          Your Impact
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div className="text-2xl font-bold text-foreground">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
