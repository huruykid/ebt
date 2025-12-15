import React from 'react';
import { Star, Utensils, ExternalLink } from 'lucide-react';

interface IncentiveProgramBadgeProps {
  incentiveProgram: string | null | undefined;
}

export const IncentiveProgramBadge: React.FC<IncentiveProgramBadgeProps> = ({ incentiveProgram }) => {
  if (!incentiveProgram) return null;

  const isRmpEnrolled = incentiveProgram.toLowerCase().includes('rmp') || 
                        incentiveProgram.toLowerCase().includes('restaurant meals program');

  return (
    <div className="mb-3 p-3 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950 dark:to-yellow-950 rounded-lg border-2 border-amber-300 dark:border-amber-700">
      <div className="flex items-center gap-2">
        <Star className="h-4 w-4 text-amber-600 dark:text-amber-400 fill-amber-600 dark:fill-amber-400" />
        <span className="text-sm font-semibold text-amber-900 dark:text-amber-100">
          {incentiveProgram}
        </span>
      </div>
      {isRmpEnrolled && (
        <a 
          href="https://www.fns.usda.gov/snap/retailer/restaurant-meals-program"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 mt-2 text-xs text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100 font-medium"
        >
          <Utensils className="h-3 w-3" />
          Hot prepared meals available
          <ExternalLink className="h-3 w-3" />
        </a>
      )}
    </div>
  );
};
