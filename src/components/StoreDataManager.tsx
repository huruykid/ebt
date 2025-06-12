
import React from 'react';
import { SyncStoresButton } from './SyncStoresButton';
import { CSVUploadButton } from './CSVUploadButton';

export const StoreDataManager: React.FC = () => {
  return (
    <div className="bg-card p-6 rounded-lg border space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Store Data Management</h3>
        <p className="text-sm text-muted-foreground">
          Import SNAP store data using CSV upload (recommended) or API sync
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <h4 className="font-medium text-sm">CSV Upload (Recommended)</h4>
          <CSVUploadButton />
        </div>
        
        <div className="space-y-2">
          <h4 className="font-medium text-sm">API Sync (Alternative)</h4>
          <SyncStoresButton />
        </div>
      </div>
      
      <div className="text-xs text-muted-foreground">
        <p><strong>CSV Upload:</strong> Faster, more reliable, processes all ~264k records at once</p>
        <p><strong>API Sync:</strong> Fetches data directly from USDA API, may require multiple sessions</p>
      </div>
    </div>
  );
};
