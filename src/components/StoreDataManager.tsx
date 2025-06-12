
import React from 'react';
import { SyncStoresButton } from './SyncStoresButton';

export const StoreDataManager: React.FC = () => {
  return (
    <div className="bg-card p-6 rounded-lg border space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Store Data Management</h3>
        <p className="text-sm text-muted-foreground">
          Import SNAP store data from the USDA API
        </p>
      </div>
      
      <div className="space-y-2">
        <h4 className="font-medium text-sm">API Sync</h4>
        <SyncStoresButton />
      </div>
      
      <div className="text-xs text-muted-foreground">
        <p><strong>API Sync:</strong> Fetches data directly from USDA API, may require multiple sessions for the full dataset (~264k records)</p>
      </div>
    </div>
  );
};
