import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { RefreshCw, CheckCircle, XCircle } from 'lucide-react';

export const TriggerBlogSchedulerButton: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<'success' | 'error' | null>(null);

  const handleTrigger = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session) {
        toast.error('You must be logged in to trigger the blog scheduler');
        setResult('error');
        return;
      }

      const response = await supabase.functions.invoke('snap-blog-scheduler', {
        body: {}
      });

      if (response.error) {
        console.error('Blog scheduler error:', response.error);
        toast.error(`Failed to trigger blog scheduler: ${response.error.message}`);
        setResult('error');
      } else {
        console.log('Blog scheduler result:', response.data);
        toast.success('Blog scheduler triggered successfully!');
        setResult('success');
      }
    } catch (error) {
      console.error('Error triggering blog scheduler:', error);
      toast.error('Failed to trigger blog scheduler');
      setResult('error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleTrigger}
      disabled={isLoading}
      variant={result === 'success' ? 'default' : result === 'error' ? 'destructive' : 'outline'}
      className="flex items-center gap-2"
    >
      {isLoading ? (
        <RefreshCw className="h-4 w-4 animate-spin" />
      ) : result === 'success' ? (
        <CheckCircle className="h-4 w-4" />
      ) : result === 'error' ? (
        <XCircle className="h-4 w-4" />
      ) : (
        <RefreshCw className="h-4 w-4" />
      )}
      {isLoading ? 'Triggering...' : 'Trigger Blog Scheduler'}
    </Button>
  );
};

export default TriggerBlogSchedulerButton;
