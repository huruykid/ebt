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
import { StoreMap } from '@/components/store-detail/StoreMap';
import { StorePhotos } from '@/components/store-detail/StorePhotos';
import { EnhancedStoreInfo } from '@/components/store-detail/EnhancedStoreInfo';
import { useGooglePlacesSearch, useGooglePlacesDetails } from '@/hooks/useGooglePlaces';
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
      
      return data;
    },
    enabled: !!id,
  });

  // Create search query for Google Places
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

  // Search for the store on Google Places
  const { data: searchResults } = useGooglePlacesSearch(
    searchQuery,
    !!store && !!searchQuery
  );

  // Get the most likely match (first result for now)
  const googlePlaceId = searchResults?.[0]?.place_id;

  // Get detailed information from Google Places
  const { data: googlePlacesData } = useGooglePlacesDetails(
    googlePlaceId || '',
    !!googlePlaceId
  );

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-neutral-100 flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !store) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-neutral-100 p-4">
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
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Store Not Found</h2>
                <p className="text-gray-600">The store you're looking for doesn't exist or may have been removed.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-neutral-100">
        {/* Store Photos at the top - full width */}
        <StorePhotos 
          photos={googlePlacesData?.photos} 
          storeName={store.store_name} 
        />
        
        <div className="p-4">
          <div className="max-w-6xl mx-auto">
            <Button 
              onClick={() => navigate('/search')} 
              variant="outline" 
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Search
            </Button>

            <div className="space-y-6">
              {/* Store Header without cover photo */}
              <StoreHeader store={store} googlePlacesData={googlePlacesData} />

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Reviews Section */}
                  <ReviewSection />

                  {/* Map Section */}
                  <StoreMap store={store} />
                </div>

                {/* Enhanced Sidebar */}
                <div className="lg:col-span-1">
                  <EnhancedStoreInfo 
                    store={store} 
                    googlePlacesData={googlePlacesData} 
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
