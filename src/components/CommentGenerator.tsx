
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { seedCommentsAutonomously, runSeedingPreset, seedingPresets } from '@/utils/autonomousCommentSeeder';
import { getCommentsForStore } from '@/utils/storeSpecificComments';
import { toast } from 'sonner';

export const CommentGenerator: React.FC = () => {
  const [targetState, setTargetState] = useState('California');
  const [targetStoreType, setTargetStoreType] = useState('');
  const [commentsPerStore, setCommentsPerStore] = useState(3);
  const [batchSize, setBatchSize] = useState(100);
  const [skipExisting, setSkipExisting] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedingResults, setSeedingResults] = useState<any>(null);
  const [previewStore, setPreviewStore] = useState('Walmart');

  // Get store count for the current filters
  const { data: storeCount, isLoading: countLoading } = useQuery({
    queryKey: ['store-count', targetState, targetStoreType],
    queryFn: async () => {
      let query = supabase
        .from('snap_stores')
        .select('id', { count: 'exact' })
        .eq('State', targetState)
        .not('Store_Name', 'is', null)
        .not('Store_Name', 'eq', '');

      if (targetStoreType) {
        query = query.eq('Store_Type', targetStoreType);
      }

      const { count, error } = await query;
      if (error) throw error;
      return count || 0;
    }
  });

  // Run autonomous seeding
  const runAutonomousSeeding = async () => {
    setIsSeeding(true);
    setSeedingResults(null);
    
    try {
      const options = {
        state: targetState,
        storeTypes: targetStoreType ? [targetStoreType] : [],
        batchSize,
        commentsPerStore,
        skipExisting
      };

      const results = await seedCommentsAutonomously(options);
      setSeedingResults(results);
      
      if (results.success) {
        toast.success(`Successfully seeded ${results.stats.commentsInserted} comments for ${results.stats.storesProcessed} stores!`);
      } else {
        toast.error(results.message);
      }
    } catch (error) {
      console.error('Seeding error:', error);
      toast.error('Failed to seed comments');
      setSeedingResults({
        success: false,
        message: error.message || 'Unknown error occurred'
      });
    } finally {
      setIsSeeding(false);
    }
  };

  // Run preset seeding
  const runPreset = async (presetName: keyof typeof seedingPresets) => {
    setIsSeeding(true);
    setSeedingResults(null);
    
    try {
      const results = await runSeedingPreset(presetName);
      setSeedingResults(results);
      
      if (results.success) {
        toast.success(`Preset "${presetName}" completed: ${results.stats.commentsInserted} comments inserted!`);
      } else {
        toast.error(results.message);
      }
    } catch (error) {
      console.error('Preset error:', error);
      toast.error(`Failed to run preset: ${error.message}`);
    } finally {
      setIsSeeding(false);
    }
  };

  // Preview comments for selected store type
  const previewComments = getCommentsForStore(previewStore).slice(0, 3);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Autonomous EBT Comment Seeder</CardTitle>
          <p className="text-muted-foreground">
            Generate realistic, store-specific EBT tips and comments automatically across all major retailers.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Quick Preset Actions */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Presets</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                onClick={() => runPreset('testRun')}
                disabled={isSeeding}
                variant="outline"
              >
                Test Run (10 stores)
              </Button>
              <Button 
                onClick={() => runPreset('californiaMajorChains')}
                disabled={isSeeding}
              >
                CA Major Chains
              </Button>
              <Button 
                onClick={() => runPreset('californiaAll')}
                disabled={isSeeding}
                variant="secondary"
              >
                All CA Stores
              </Button>
            </div>
          </div>

          {/* Custom Configuration */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Custom Configuration</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={targetState}
                  onChange={(e) => setTargetState(e.target.value)}
                  placeholder="California"
                />
              </div>
              
              <div>
                <Label htmlFor="store-type">Store Type (Optional)</Label>
                <Input
                  id="store-type"
                  value={targetStoreType}
                  onChange={(e) => setTargetStoreType(e.target.value)}
                  placeholder="Supermarket, Supercenter, etc."
                />
              </div>
              
              <div>
                <Label htmlFor="comments-per-store">Comments per Store</Label>
                <Input
                  id="comments-per-store"
                  type="number"
                  min="1"
                  max="10"
                  value={commentsPerStore}
                  onChange={(e) => setCommentsPerStore(parseInt(e.target.value) || 3)}
                />
              </div>

              <div>
                <Label htmlFor="batch-size">Batch Size</Label>
                <Input
                  id="batch-size"
                  type="number"
                  min="10"
                  max="1000"
                  value={batchSize}
                  onChange={(e) => setBatchSize(parseInt(e.target.value) || 100)}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="skip-existing"
                checked={skipExisting}
                onChange={(e) => setSkipExisting(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="skip-existing">Skip stores that already have comments</Label>
            </div>

            <div className="flex gap-4">
              <Button 
                onClick={runAutonomousSeeding}
                disabled={isSeeding || countLoading}
                size="lg"
              >
                {isSeeding ? 'Seeding Comments...' : `Seed ${storeCount || '...'} Stores`}
              </Button>
            </div>
          </div>

          {/* Results Display */}
          {seedingResults && (
            <Card>
              <CardHeader>
                <CardTitle className={seedingResults.success ? 'text-green-600' : 'text-red-600'}>
                  Seeding Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">{seedingResults.message}</p>
                {seedingResults.stats && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="font-medium">Stores Processed</div>
                      <div className="text-2xl font-bold text-green-600">
                        {seedingResults.stats.storesProcessed}
                      </div>
                    </div>
                    <div>
                      <div className="font-medium">Comments Inserted</div>
                      <div className="text-2xl font-bold text-blue-600">
                        {seedingResults.stats.commentsInserted}
                      </div>
                    </div>
                    <div>
                      <div className="font-medium">Stores Skipped</div>
                      <div className="text-2xl font-bold text-yellow-600">
                        {seedingResults.stats.storesSkipped}
                      </div>
                    </div>
                    <div>
                      <div className="font-medium">Total Stores</div>
                      <div className="text-2xl font-bold text-gray-600">
                        {seedingResults.stats.totalStores}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Comment Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Comment Preview</CardTitle>
          <div className="flex gap-4 items-center">
            <Label htmlFor="preview-store">Preview comments for:</Label>
            <Select value={previewStore} onValueChange={setPreviewStore}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Walmart">Walmart</SelectItem>
                <SelectItem value="Target">Target</SelectItem>
                <SelectItem value="Kroger">Kroger</SelectItem>
                <SelectItem value="Safeway">Safeway</SelectItem>
                <SelectItem value="Costco">Costco</SelectItem>
                <SelectItem value="Aldi">Aldi</SelectItem>
                <SelectItem value="Sprouts">Sprouts</SelectItem>
                <SelectItem value="7-Eleven">7-Eleven</SelectItem>
                <SelectItem value="Dollar General">Dollar General</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {previewComments.map((comment, index) => (
              <div key={index} className="border-l-4 border-primary pl-4 py-2">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-medium text-sm text-primary">
                    {['EBTSaver', 'BudgetMom23', 'SnapDeals'][index]}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {Math.floor(Math.random() * 14 + 1)} days ago
                  </span>
                </div>
                <p className="text-sm leading-relaxed">{comment}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none">
          <ul className="space-y-2">
            <li><strong>Autonomous Operation:</strong> The system automatically matches store names to appropriate EBT tips and generates realistic user comments.</li>
            <li><strong>Store-Specific Content:</strong> Comments are tailored to each retailer (Walmart, Target, Kroger, etc.) based on their actual EBT policies and user hacks.</li>
            <li><strong>Smart Deduplication:</strong> Prevents duplicate comments and usernames within the same store location.</li>
            <li><strong>Realistic Timestamps:</strong> Comments are backdated between 1-21 days with realistic distribution.</li>
            <li><strong>Batch Processing:</strong> Handles large numbers of stores efficiently with progress tracking.</li>
            <li><strong>Preset Configurations:</strong> Quick-start options for common seeding scenarios.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};
