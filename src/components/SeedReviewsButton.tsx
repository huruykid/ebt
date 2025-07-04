import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Star } from 'lucide-react';

export const SeedReviewsButton: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSeedReviews = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('seed-reviews');
      
      if (error) {
        console.error('Error seeding reviews:', error);
        toast({
          title: "Error",
          description: "Failed to seed reviews. Check console for details.",
          variant: "destructive"
        });
      } else {
        console.log('Seeding result:', data);
        toast({
          title: "Success!",
          description: `Successfully created ${data.inserted || 0} EBT-focused 5-star reviews! ${data.skipped > 0 ? `(${data.skipped} already existed)` : ''}`,
        });
      }
    } catch (err) {
      console.error('Error calling seed function:', err);
      toast({
        title: "Error",
        description: "Failed to call review seeding function.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleSeedReviews} 
      disabled={isLoading}
      className="mb-4"
      variant="default"
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      <Star className="mr-2 h-4 w-4" />
      {isLoading ? 'Creating Reviews...' : 'Create 5-Star EBT Reviews'}
    </Button>
  );
};