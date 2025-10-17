import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Database, Download, RefreshCw, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export const GoogleDataPreservation = () => {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const { toast } = useToast();

  const analyzeData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('preserve-google-data', {
        body: { action: 'analyze' }
      });

      if (error) throw error;

      setAnalysis(data.analysis);
      toast({
        title: "Analysis Complete",
        description: "Google Places data has been analyzed"
      });
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const syncCacheToStores = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('preserve-google-data', {
        body: { action: 'sync_cache_to_stores' }
      });

      if (error) throw error;

      toast({
        title: "Cache Synced",
        description: `Synced ${data.synced} entries to stores (${data.errors} errors)`
      });
      
      // Refresh analysis
      await analyzeData();
    } catch (error) {
      console.error('Sync error:', error);
      toast({
        title: "Sync Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const exportAllData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('preserve-google-data', {
        body: { action: 'export_all_data' }
      });

      if (error) throw error;

      // Download as JSON
      const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `google-places-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Export Complete",
        description: `Exported ${data.exportedStores} stores with Google data`
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Google Places Data Preservation</CardTitle>
        <CardDescription>
          Ensure all Google Places data is saved before cancelling the API
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Before Cancelling Google Places API</AlertTitle>
          <AlertDescription>
            Make sure to run these actions to preserve all fetched data:
            <ol className="list-decimal list-inside mt-2 space-y-1">
              <li>Analyze current data coverage</li>
              <li>Sync cached data to stores</li>
              <li>Export backup copy</li>
            </ol>
          </AlertDescription>
        </Alert>

        {analysis && (
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Data Coverage</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Stores with Google Place ID:</span>
                  <span className="font-bold">{analysis.storeStats?.[0]?.stores_with_place_id || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>With Ratings:</span>
                  <span className="font-bold">{analysis.storeStats?.[0]?.with_rating || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>With Photos:</span>
                  <span className="font-bold">{analysis.storeStats?.[0]?.with_photos || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>With Hours:</span>
                  <span className="font-bold">{analysis.storeStats?.[0]?.with_hours || 0}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Cache Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Cached Entries:</span>
                  <span className="font-bold">{analysis.cacheEntries || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Never Updated:</span>
                  <span className="font-bold">{analysis.storeStats?.[0]?.never_updated || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Stale Data (30+ days):</span>
                  <span className="font-bold">{analysis.storeStats?.[0]?.stale_data || 0}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <Button
            onClick={analyzeData}
            disabled={loading}
            variant="outline"
            className="w-full"
          >
            <Database className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Analyzing...' : 'Analyze Data Coverage'}
          </Button>

          <Button
            onClick={syncCacheToStores}
            disabled={loading || !analysis}
            className="w-full"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Syncing...' : 'Sync Cache to Stores'}
          </Button>

          <Button
            onClick={exportAllData}
            disabled={loading}
            variant="secondary"
            className="w-full"
          >
            <Download className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Exporting...' : 'Export Backup (JSON)'}
          </Button>
        </div>

        <Alert>
          <AlertDescription className="text-xs">
            <strong>Current Status:</strong> You have Google Places data for ~60,000 stores saved in your database.
            This data will remain available even after cancelling the API.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};
