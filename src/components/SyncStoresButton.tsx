
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const SyncStoresButton: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [syncProgress, setSyncProgress] = useState<string>('');
  const { toast } = useToast();

  const handleSync = async () => {
    setIsLoading(true);
    setSyncProgress('Starting sync...');
    
    try {
      let offset = 0;
      let totalSynced = 0;
      let hasMore = true;
      let clear = true;

      while (hasMore) {
        setSyncProgress(`Syncing from offset ${offset}... (${totalSynced} records so far)`);
        
        const { data, error } = await supabase.functions.invoke('sync-snap-stores', {
          body: {},
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (error) {
          throw error;
        }

        if (data?.success) {
          totalSynced = data.totalStores || totalSynced + (data.sessionStores || 0);
          
          if (data.needsContinuation && data.nextOffset) {
            offset = data.nextOffset;
            clear = false;
            setSyncProgress(`Continuing sync from offset ${offset}... (${totalSynced} records synced)`);
            
            // Small delay between continuations
            await new Promise(resolve => setTimeout(resolve, 1000));
          } else {
            hasMore = false;
            toast({
              title: "Sync Complete!",
              description: `Successfully synced ${totalSynced} SNAP stores (${data.coveragePercent || 0}% of expected 264k)`,
            });
          }
        } else {
          throw new Error(data?.error || 'Unknown error occurred');
        }
      }
    } catch (error) {
      console.error('Sync error:', error);
      toast({
        title: "Sync Failed",
        description: error.message || 'Failed to sync SNAP stores data',
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setSyncProgress('');
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleSync}
        disabled={isLoading}
        className="flex items-center gap-2 px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        {isLoading ? 'Syncing...' : 'Sync All Stores'}
      </button>
      {syncProgress && (
        <p className="text-xs text-gray-600">{syncProgress}</p>
      )}
    </div>
  );
};
