
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { StoreHeader } from '@/components/store-detail/StoreHeader';
import { ReviewSection } from '@/components/store-detail/ReviewSection';
import { StorePhotos } from '@/components/store-detail/StorePhotos';
import { EnhancedStoreInfo } from '@/components/store-detail/EnhancedStoreInfo';
import { StoreHoursCard } from '@/components/store-detail/cards/StoreHoursCard';
import { StoreComments } from '@/components/StoreComments';
import type { Tables } from '@/integrations/supabase/types';

type Store = Tables<'snap_stores'>;

export default function StoreDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [storeHours, setStoreHours] = useState<Record<string, { open: string; close: string; closed: boolean }> | null>(null);

  const { data: store, isLoading, error } = useQuery({
    queryKey: ['store', id],
    queryFn: async () => {
      if (!id) throw new Error('Store ID is required');
      
      const storeId = id; // Keep as string since database id is string
      
      const { data, error } = await supabase
        .from('snap_stores')
        .select('*')
        .eq('id', storeId)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching store:', error);
        throw error;
      }
      
      console.log('📦 Store data loaded:', data);
      return data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !store) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background p-4">
          <div className="max-w-4xl mx-auto">
            <Button 
              onClick={() => navigate('/search')} 
              variant="outline" 
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Search
            </Button>
            <Card>
              <CardContent className="p-8 text-center">
                <h2 className="text-xl font-semibold text-foreground mb-2">Store Not Found</h2>
                <p className="text-muted-foreground">The store you're looking for doesn't exist or may have been removed.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        {/* Back Button */}
        <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <Button 
              onClick={() => navigate(-1)} 
              variant="ghost" 
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Search
            </Button>
          </div>
        </div>

        {/* Hero Section with Photos */}
        <StorePhotos 
          storeName={store.Store_Name} 
          store={store}
          onHoursAdded={setStoreHours}
        />
        
        <div className="relative -mt-8 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Main Content */}
            <div className="space-y-6">
              {/* Store Header */}
              <StoreHeader store={store} />

              {/* Content Grid - Mobile-first responsive layout */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Reviews Section - First on mobile, second column on desktop */}
                <div className="xl:col-span-2 order-1 space-y-6">
                  <ReviewSection store={store} />
                  <StoreComments storeId={store.id} storeName={store.Store_Name} />
                </div>

                {/* Store Info and Hours - Second on mobile, third column on desktop */}
                <div className="xl:col-span-1 order-2 space-y-6">
                  <div className="xl:sticky xl:top-4 space-y-6">
                    <EnhancedStoreInfo store={store} />
                    {storeHours && <StoreHoursCard hours={storeHours} />}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
