import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export const SeedCommentsButton: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSeedComments = async () => {
    setIsLoading(true);
    try {
      console.log('Starting comment seeding...');
      const { data, error } = await supabase.functions.invoke('seed-comments');
      
      if (error) {
        console.error('Error seeding comments:', error);
        toast({
          title: "Error",
          description: "Failed to seed comments. Check console for details.",
          variant: "destructive"
        });
      } else {
        console.log('Seeding result:', data);
        toast({
          title: "Success!",
          description: `Successfully seeded ${data.stats?.commentsInserted || 0} comments for ${data.stats?.storesProcessed || 0} stores using ${data.preset} preset.`,
        });
      }
    } catch (err) {
      console.error('Error calling seed function:', err);
      toast({
        title: "Error",
        description: "Failed to call seeding function.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleSeedComments} 
      disabled={isLoading}
      className="mb-4"
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {isLoading ? 'Seeding Comments...' : 'Seed EBT Community Tips'}
    </Button>
  );
};