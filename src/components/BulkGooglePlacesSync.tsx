import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { PlayCircle, StopCircle, RefreshCw } from 'lucide-react';

export const BulkGooglePlacesSync: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [stats, setStats] = useState({ processed: 0, failed: 0, remaining: 204083 });
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const runBulkSync = async () => {
    if (isRunning) return;
    
    setIsRunning(true);
    let totalProcessed = 0;
    let totalFailed = 0;

    try {
      while (stats.remaining > 0 && isRunning) {
        const { data, error } = await supabase.functions.invoke('bulk-google-places-sync', {
          body: { batch_size: 25 }
        });

        if (error) throw error;

        if (data.processed === 0) break; // No more to process

        totalProcessed += data.processed;
        totalFailed += data.failed;
        
        const newStats = {
          processed: totalProcessed,
          failed: totalFailed,
          remaining: data.remaining
        };
        
        setStats(newStats);
        setProgress(((204083 - data.remaining) / 204083) * 100);

        // Small break between batches
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      toast({
        title: "Bulk Sync Complete!",
        description: `Processed ${totalProcessed} stores, ${totalFailed} failed`,
      });

    } catch (error) {
      console.error('Bulk sync error:', error);
      toast({
        title: "Sync Error",
        description: error.message || 'Failed to run bulk sync',
        variant: "destructive"
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          Bulk Google Places Sync
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-green-600">{stats.processed}</p>
            <p className="text-sm text-muted-foreground">Processed</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
            <p className="text-sm text-muted-foreground">Failed</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-600">{stats.remaining}</p>
            <p className="text-sm text-muted-foreground">Remaining</p>
          </div>
        </div>

        <Progress value={progress} className="w-full" />
        <p className="text-sm text-center text-muted-foreground">
          {progress.toFixed(1)}% Complete
        </p>

        <div className="flex gap-2 justify-center">
          <Button 
            onClick={runBulkSync} 
            disabled={isRunning}
            className="flex items-center gap-2"
          >
            <PlayCircle className="h-4 w-4" />
            {isRunning ? 'Syncing...' : 'Start Bulk Sync'}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => setIsRunning(false)}
            disabled={!isRunning}
            className="flex items-center gap-2"
          >
            <StopCircle className="h-4 w-4" />
            Stop
          </Button>
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Processes 25 stores per batch with 2-second intervals</p>
          <p>• Prioritizes major cities and populated areas first</p>
          <p>• Automatically handles rate limiting and retries</p>
          <p>• Updates store hours, photos, ratings, and contact info</p>
        </div>
      </CardContent>
    </Card>
  );
};