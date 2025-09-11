import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const BudgetWarningBanner: React.FC = () => {
  return (
    <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950 dark:border-amber-800 mb-4">
      <AlertTriangle className="h-4 w-4 text-amber-600" />
      <AlertDescription className="text-amber-800 dark:text-amber-200">
        <strong>Limited Data Available:</strong> Enhanced store details (phone numbers, hours, ratings) are temporarily limited due to API usage. 
        Basic store information and locations are still fully available.
      </AlertDescription>
    </Alert>
  );
};