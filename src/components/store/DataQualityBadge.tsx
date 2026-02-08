import React from 'react';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface DataQualityBadgeProps {
  hasRating?: boolean;
  hasPhone?: boolean;
  hasHours?: boolean;
  hasPhotos?: boolean;
  className?: string;
  showTooltip?: boolean;
}

export const DataQualityBadge: React.FC<DataQualityBadgeProps> = ({
  hasRating = false,
  hasPhone = false,
  hasHours = false,
  hasPhotos = false,
  className = '',
  showTooltip = true,
}) => {
  // Calculate completeness score (each field is 25%)
  const score = [hasRating, hasPhone, hasHours, hasPhotos].filter(Boolean).length;
  const percentage = score * 25;

  // Determine badge type based on completeness
  const getBadgeContent = () => {
    if (percentage >= 75) {
      return {
        icon: CheckCircle2,
        label: 'Verified',
        variant: 'default' as const,
        className: 'bg-success/10 text-success border-success/20 hover:bg-success/20',
        description: 'This store has complete information verified by Google.',
      };
    }
    if (percentage >= 50) {
      return {
        icon: Info,
        label: 'Basic Info',
        variant: 'secondary' as const,
        className: 'bg-warning/10 text-warning border-warning/20 hover:bg-warning/20',
        description: 'This store has partial information. Some details may be missing.',
      };
    }
    // For low completeness, return null (don't show badge)
    return null;
  };

  const badgeContent = getBadgeContent();

  // Don't render anything for stores with less than 50% completeness
  if (!badgeContent) {
    return null;
  }

  const { icon: Icon, label, className: badgeClassName, description } = badgeContent;

  const badge = (
    <Badge 
      variant="outline" 
      className={`text-xs gap-1 ${badgeClassName} ${className}`}
    >
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  );

  if (!showTooltip) {
    return badge;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {badge}
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[200px]">
          <p className="text-xs">{description}</p>
          <div className="mt-1 text-xs text-muted-foreground">
            {percentage}% complete
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// Helper function to calculate completeness from store data
export const calculateStoreCompleteness = (store: {
  google_rating?: number | null;
  google_formatted_phone_number?: string | null;
  google_opening_hours?: unknown;
  google_photos?: unknown;
}) => {
  return {
    hasRating: Boolean(store.google_rating),
    hasPhone: Boolean(store.google_formatted_phone_number),
    hasHours: Boolean(store.google_opening_hours),
    hasPhotos: Boolean(store.google_photos && Array.isArray(store.google_photos) && store.google_photos.length > 0),
  };
};
