import React from 'react';
import { cn } from '@/lib/utils';

interface StoreTypeBadgeProps {
  storeType: string | null;
  className?: string;
}

const getStoreTypeColor = (type: string | null) => {
  switch (type?.toLowerCase()) {
    case 'supermarket':
      return 'bg-primary/10 text-primary border-primary/20';
    case 'convenience store':
      return 'bg-info/10 text-info border-info/20';
    case 'grocery store':
      return 'bg-success/10 text-success border-success/20';
    default:
      return 'bg-muted/50 text-muted-foreground border-muted/30';
  }
};

export const StoreTypeBadge: React.FC<StoreTypeBadgeProps> = ({ storeType, className }) => {
  if (!storeType) return null;
  
  return (
    <span className={cn(
      'inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border',
      getStoreTypeColor(storeType),
      className
    )}>
      {storeType}
    </span>
  );
};

export const EbtAcceptedBadge: React.FC<{ className?: string }> = ({ className }) => (
  <span className={cn(
    'inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-accent/20 text-accent-foreground border border-accent/20',
    className
  )}>
    EBT Accepted
  </span>
);
