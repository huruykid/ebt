
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { generateCommentsForStore, type GeneratedComment } from '@/utils/commentGenerator';
import { toast } from 'sonner';

export const CommentGenerator: React.FC = () => {
  const [targetState, setTargetState] = useState('California');
  const [targetStoreType, setTargetStoreType] = useState('Sprouts');
  const [commentsPerStore, setCommentsPerStore] = useState(2);
  const [previewComments, setPreviewComments] = useState<GeneratedComment[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const queryClient = useQueryClient();

  // Fetch Sprouts stores in California
  const { data: sproutsStores, isLoading } = useQuery({
    queryKey: ['sprouts-stores', targetState],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('snap_stores')
        .select('id, Store_Name, City, State, Store_Street_Address')
        .ilike('Store_Name', `%${targetStoreType}%`)
        .eq('State', targetState)
        .not('Store_Name', 'is', null)
        .limit(50);

      if (error) throw error;
      return data || [];
    }
  });

  // Mutation to insert comments
  const insertCommentsMutation = useMutation({
    mutationFn: async (comments: Array<{ store_id: string; user_name: string; comment_text: string; created_at: string }>) => {
      const { error } = await supabase
        .from('store_comments')
        .insert(comments);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Comments generated successfully!');
      queryClient.invalidateQueries({ queryKey: ['store-comments'] });
    },
    onError: (error) => {
      console.error('Error inserting comments:', error);
      toast.error('Failed to generate comments');
    }
  });

  const generatePreview = () => {
    const preview = generateCommentsForStore('preview', 3);
    setPreviewComments(preview);
  };

  const generateCommentsForAllStores = async () => {
    if (!sproutsStores || sproutsStores.length === 0) {
      toast.error('No stores found to generate comments for');
      return;
    }

    setIsGenerating(true);
    
    try {
      const allComments: Array<{ store_id: string; user_name: string; comment_text: string; created_at: string }> = [];

      for (const store of sproutsStores) {
        const storeComments = generateCommentsForStore(store.id, commentsPerStore);
        
        for (const comment of storeComments) {
          allComments.push({
            store_id: store.id,
            user_name: comment.userName,
            comment_text: comment.text,
            created_at: comment.createdAt.toISOString()
          });
        }
      }

      await insertCommentsMutation.mutateAsync(allComments);
      
      toast.success(`Generated ${allComments.length} comments for ${sproutsStores.length} stores!`);
      
    } catch (error) {
      console.error('Error generating comments:', error);
      toast.error('Failed to generate comments');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>EBT Store Comment Generator</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <Label htmlFor="store-type">Store Type</Label>
              <Input
                id="store-type"
                value={targetStoreType}
                onChange={(e) => setTargetStoreType(e.target.value)}
                placeholder="Sprouts"
              />
            </div>
            
            <div>
              <Label htmlFor="comments-per-store">Comments per Store</Label>
              <Input
                id="comments-per-store"
                type="number"
                min="1"
                max="5"
                value={commentsPerStore}
                onChange={(e) => setCommentsPerStore(parseInt(e.target.value) || 2)}
              />
            </div>
          </div>

          <div className="flex gap-4">
            <Button onClick={generatePreview} variant="outline">
              Preview Comments
            </Button>
            
            <Button 
              onClick={generateCommentsForAllStores}
              disabled={isGenerating || !sproutsStores || sproutsStores.length === 0}
            >
              {isGenerating ? 'Generating...' : `Generate for ${sproutsStores?.length || 0} Stores`}
            </Button>
          </div>

          {isLoading && (
            <p className="text-muted-foreground">Loading stores...</p>
          )}

          {sproutsStores && (
            <p className="text-sm text-muted-foreground">
              Found {sproutsStores.length} {targetStoreType} stores in {targetState}
            </p>
          )}
        </CardContent>
      </Card>

      {previewComments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Preview Comments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {previewComments.map((comment, index) => (
                <div key={index} className="border-l-4 border-primary pl-4">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium text-sm">{comment.userName}</span>
                    <span className="text-xs text-muted-foreground">
                      {comment.createdAt.toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm">{comment.text}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {sproutsStores && sproutsStores.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Target Stores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-64 overflow-y-auto">
              <div className="space-y-2">
                {sproutsStores.slice(0, 10).map((store) => (
                  <div key={store.id} className="text-sm">
                    <span className="font-medium">{store.Store_Name}</span>
                    <span className="text-muted-foreground ml-2">
                      {store.City}, {store.State}
                    </span>
                  </div>
                ))}
                {sproutsStores.length > 10 && (
                  <p className="text-xs text-muted-foreground">
                    ...and {sproutsStores.length - 10} more stores
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
