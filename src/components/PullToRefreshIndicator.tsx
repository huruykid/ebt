import React from 'react';
import { ArrowDown, Loader2 } from 'lucide-react';

interface PullToRefreshIndicatorProps {
  pullDistance: number;
  isRefreshing: boolean;
  threshold?: number;
}

export const PullToRefreshIndicator: React.FC<PullToRefreshIndicatorProps> = ({
  pullDistance,
  isRefreshing,
  threshold = 60,
}) => {
  if (pullDistance === 0 && !isRefreshing) return null;

  const progress = Math.min(pullDistance / threshold, 1);
  const rotation = progress * 180;

  return (
    <div
      className="flex items-center justify-center overflow-hidden transition-[height] duration-200 ease-out"
      style={{ height: `${pullDistance}px` }}
    >
      {isRefreshing ? (
        <Loader2 className="h-5 w-5 text-primary animate-spin" />
      ) : (
        <ArrowDown
          className="h-5 w-5 text-muted-foreground transition-transform duration-150"
          style={{ transform: `rotate(${rotation}deg)` }}
        />
      )}
      <span className="ml-2 text-xs text-muted-foreground">
        {isRefreshing ? 'Refreshing…' : progress >= 1 ? 'Release to refresh' : 'Pull to refresh'}
      </span>
    </div>
  );
};
