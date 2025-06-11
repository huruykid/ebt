
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Share2 } from 'lucide-react';
import { StoreHeader } from '@/components/store-detail/StoreHeader';
import { ReviewSection } from '@/components/store-detail/ReviewSection';
import { StorePhotos } from '@/components/store-detail/StorePhotos';
import { EnhancedStoreInfo } from '@/components/store-detail/EnhancedStoreInfo';
import { ShareStore } from '@/components/ShareStore';
import { FavoriteButton } from '@/components/FavoriteButton';
import type { Tables } from '@/integrations/supabase/types';

type Store = Tables<'snap_stores'>;

export default function StoreDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: store, isLoading, error } = useQuery({
    queryKey: ['store', id],
    queryFn: async () => {
      if (!id) throw new Error('Store ID is required');
      
      const storeId = parseInt(id, 10);
      if (isNaN(storeId)) throw new Error('Invalid store ID');
      
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
        {/* Hero Section with Photos */}
        <StorePhotos 
          storeName={store.store_name} 
          store={store}
        />
        
        <div className="relative -mt-8 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Navigation Bar - Only Share and Favorite buttons now */}
            <div className="flex items-center justify-end mb-6 bg-background/80 backdrop-blur-sm rounded-lg p-4 shadow-sm border">
              <div className="flex items-center gap-2">
                <FavoriteButton storeId={store.id} variant="icon" />
                <ShareStore store={store} />
              </div>
            </div>

            {/* Main Content */}
            <div className="space-y-6">
              {/* Store Header */}
              <StoreHeader store={store} />

              {/* Content Grid - Mobile-first responsive layout */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Reviews Section - First on mobile, second column on desktop */}
                <div className="xl:col-span-2 order-1">
                  <ReviewSection store={store} />
                </div>

                {/* Store Info - Second on mobile, third column on desktop */}
                <div className="xl:col-span-1 order-2">
                  <div className="xl:sticky xl:top-4">
                    <EnhancedStoreInfo store={store} />
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
