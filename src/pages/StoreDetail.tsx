import React, { useMemo } from 'react';
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
import { ShareStore } from '@/components/ShareStore';
import { useNominatimSearch, useNominatimReverse } from '@/hooks/useNominatimSearch';
import { convertNominatimToGooglePlaces } from '@/types/nominatimTypes';
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

  // Create search query for Nominatim
  const searchQuery = useMemo(() => {
    if (!store) return '';
    
    const parts = [
      store.store_name,
      store.store_street_address,
      store.city,
      store.state
    ].filter(Boolean);
    
    return parts.join(' ');
  }, [store]);

  // Search for the store on Nominatim
  const { data: searchResults } = useNominatimSearch(
    searchQuery,
    !!store && !!searchQuery
  );

  // Get detailed location information from Nominatim reverse geocoding
  const { data: nominatimData } = useNominatimReverse(
    store?.latitude || 0,
    store?.longitude || 0,
    !!(store?.latitude && store?.longitude)
  );

  // Convert Nominatim data to Google Places compatible format
  const compatibleData = useMemo(() => {
    return convertNominatimToGooglePlaces(nominatimData);
  }, [nominatimData]);

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
        {/* Store Photos at the top - full width with Yelp integration */}
        <StorePhotos 
          photos={[]} // No photos from OSM, keeping interface for future enhancement
          storeName={store.store_name} 
          store={store}
        />
        
        <div className="p-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <Button 
                onClick={() => navigate('/search')} 
                variant="outline"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Search
              </Button>
              <div className="flex gap-2">
                <ShareStore store={store} />
              </div>
            </div>

            <div className="space-y-6">
              {/* Store Header without cover photo */}
              <StoreHeader store={store} googlePlacesData={compatibleData} />

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content - Reviews Section taking full width */}
                <div className="lg:col-span-2">
                  <ReviewSection store={store} />
                </div>

                {/* Enhanced Sidebar */}
                <div className="lg:col-span-1">
                  <EnhancedStoreInfo 
                    store={store} 
                    googlePlacesData={compatibleData} 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
