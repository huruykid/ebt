import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface BudgetWarningBannerProps {
  show: boolean;
  message?: string;
}

export const BudgetWarningBanner: React.FC<BudgetWarningBannerProps> = ({ 
  show, 
  message = "Using cached results due to monthly API budget limit. Data may be slightly outdated." 
}) => {
  if (!show) return null;

  return (
    <Alert className="mb-4 border-amber-200 bg-amber-50 text-amber-800">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription className="text-sm">
        {message}
      </AlertDescription>
    </Alert>
  );
};