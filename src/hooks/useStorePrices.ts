import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

// Public price interface (excludes user_id for privacy)
export interface StorePrice {
  id: string;
  store_id: string;
  product_name: string;
  price: number;
  unit: string;
  is_sale: boolean;
  verified_count: number;
  reported_at: string;
  expires_at: string;
}

export const useStorePrices = (storeId: string | null) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch prices for a store using public view (excludes user_id for privacy)
  const { data: prices = [], isLoading } = useQuery({
    queryKey: ['store-prices', storeId],
    queryFn: async () => {
      if (!storeId) return [];

      const { data, error } = await supabase
        .from('public_store_prices' as any)
        .select('*')
        .eq('store_id', storeId)
        .gte('expires_at', new Date().toISOString())
        .order('reported_at', { ascending: false });

      if (error) throw error;
      return (data as unknown as StorePrice[]) || [];
    },
    enabled: !!storeId,
  });

  // Report a new price
  const reportPrice = useMutation({
    mutationFn: async ({
      storeId,
      productName,
      price,
      unit,
      isSale,
    }: {
      storeId: string;
      productName: string;
      price: number;
      unit?: string;
      isSale?: boolean;
    }) => {
      if (!user) throw new Error('Must be logged in');

      const { data, error } = await supabase
        .from('store_prices')
        .insert({
          store_id: storeId,
          user_id: user.id,
          product_name: productName,
          price,
          unit: unit || 'each',
          is_sale: isSale || false,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-prices'] });
      queryClient.invalidateQueries({ queryKey: ['store-updates'] });
      toast({ title: 'Price reported!', description: 'Thanks for helping the community.' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Could not report price.', variant: 'destructive' });
    },
  });

  // Verify a price (confirm it's accurate)
  const verifyPrice = useMutation({
    mutationFn: async ({ priceId, isAccurate }: { priceId: string; isAccurate: boolean }) => {
      if (!user) throw new Error('Must be logged in');

      const { error } = await supabase
        .from('price_verifications')
        .insert({
          price_id: priceId,
          user_id: user.id,
          is_accurate: isAccurate,
        });

      if (error) {
        if (error.code === '23505') {
          throw new Error('You already verified this price');
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-prices'] });
      toast({ title: 'Thanks for verifying!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  return {
    prices,
    isLoading,
    reportPrice,
    verifyPrice,
    isAuthenticated: !!user,
  };
};

// Hook for trending prices across all stores (uses public view for privacy)
export const useTrendingPrices = (limit = 10) => {
  return useQuery({
    queryKey: ['trending-prices', limit],
    queryFn: async () => {
      // Use public view to exclude user_id, then join with stores
      const { data, error } = await supabase
        .from('public_store_prices' as any)
        .select('*')
        .gte('expires_at', new Date().toISOString())
        .order('verified_count', { ascending: false })
        .order('reported_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    },
  });
};
