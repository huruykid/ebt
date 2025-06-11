
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import * as LucideIcons from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type BadgeData = Tables<'badges'>;

interface BadgeDisplayProps {
  badge: BadgeData;
  earned?: boolean;
  earnedAt?: string;
  size?: 'sm' | 'md' | 'lg';
  showDescription?: boolean;
}

export const BadgeDisplay: React.FC<BadgeDisplayProps> = ({
  badge,
  earned = false,
  earnedAt,
  size = 'md',
  showDescription = false,
}) => {
  // Get the icon component dynamically
  const IconComponent = badge.icon ? 
    (LucideIcons as any)[badge.icon.split('-').map((word: string) => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join('')] || LucideIcons.Award 
    : LucideIcons.Award;

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12', 
    lg: 'h-16 w-16'
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  if (showDescription) {
    return (
      <Card className={cn(
        "transition-all duration-200",
        earned ? "bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200" : "bg-muted/30"
      )}>
        <CardContent className="p-4 flex items-center gap-3">
          <div className={cn(
            "rounded-full flex items-center justify-center transition-all",
            sizeClasses[size],
            earned 
              ? "bg-gradient-to-br from-yellow-400 to-amber-500 text-white shadow-lg" 
              : "bg-muted text-muted-foreground"
          )}>
            <IconComponent className={iconSizes[size]} />
          </div>
          <div className="flex-1">
            <h4 className={cn(
              "font-semibold",
              earned ? "text-amber-700" : "text-muted-foreground"
            )}>
              {badge.name}
            </h4>
            <p className="text-sm text-muted-foreground">
              {badge.description}
            </p>
            {earnedAt && (
              <p className="text-xs text-amber-600 mt-1">
                Earned {new Date(earnedAt).toLocaleDateString()}
              </p>
            )}
          </div>
          {earned && (
            <Badge variant="secondary" className="bg-amber-100 text-amber-700">
              Earned
            </Badge>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={cn(
        "rounded-full flex items-center justify-center transition-all",
        sizeClasses[size],
        earned 
          ? "bg-gradient-to-br from-yellow-400 to-amber-500 text-white shadow-lg" 
          : "bg-muted text-muted-foreground"
      )}>
        <IconComponent className={iconSizes[size]} />
      </div>
      <span className={cn(
        "text-xs font-medium text-center",
        earned ? "text-amber-700" : "text-muted-foreground"
      )}>
        {badge.name}
      </span>
    </div>
  );
};
