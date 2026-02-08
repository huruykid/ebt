
import React, { useState, useEffect } from 'react';
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
import { SEOHead } from '@/components/SEOHead';
import { LocalBusinessSchema } from '@/components/LocalBusinessSchema';
import { BreadcrumbSchema } from '@/components/BreadcrumbSchema';
import { GoogleReviewsSection } from '@/components/store-detail/GoogleReviewsSection';
import { EnhancedGooglePlacesInfo } from '@/components/store-detail/EnhancedGooglePlacesInfo';
import { useStoredGooglePlaces } from '@/hooks/useStoredGooglePlaces';
import { useRecentlyViewedStores } from '@/hooks/useRecentlyViewedStores';
import { StorePricesList } from '@/components/prices/StorePricesList';
import { AddToListButton } from '@/components/lists/AddToListButton';
import type { Tables } from '@/integrations/supabase/types';

type Store = Tables<'snap_stores'>;

export default function StoreDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [storeHours, setStoreHours] = useState<Record<string, { open: string; close: string; closed: boolean }> | null>(null);
  const { trackView } = useRecentlyViewedStores();

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

  // Track store view when store is loaded
  useEffect(() => {
    if (store?.id) {
      trackView(store.id);
    }
  }, [store?.id, trackView]);

  // Get stored Google Places data from the database (no API calls)
  const googleData = useStoredGooglePlaces(store);

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

  // Generate SEO data for the store - always use Store_Name as authoritative source
  const displayName = store?.Store_Name;
  const seoTitle = store ? `${displayName} - EBT Store Details | EBT Finder` : "Store Details | EBT Finder";
  const seoDescription = store ? 
    `Find details for ${displayName} at ${googleData?.formatted_address || `${store.Store_Street_Address}, ${store.City}, ${store.State} ${store.Zip_Code}`}. EBT/SNAP accepted. ${googleData?.rating ? `Rated ${googleData.rating} stars.` : ''} View hours, reviews, and directions.` :
    "View detailed information about EBT and SNAP accepting stores including hours, reviews, and directions.";
  
  // Breadcrumb data for SEO
  const breadcrumbItems = [
    { name: 'Home', url: '/' },
    { name: 'Store Search', url: '/search' },
    { name: displayName || 'Store', url: `/store/${id}` }
  ];

  return (
    <ProtectedRoute>
      <SEOHead
        title={seoTitle}
        description={seoDescription}
        keywords={`${displayName}, EBT store, SNAP accepted, ${store?.City}, ${store?.State}, grocery store, food benefits`}
        canonicalUrl={`https://ebtfinder.org/store/${id}`}
      />
      
      {/* Enhanced SEO Schema Components */}
      <LocalBusinessSchema
        storeName={displayName || store.Store_Name}
        address={store.Store_Street_Address || ''}
        city={store.City || ''}
        state={store.State || ''}
        zipCode={store.Zip_Code || ''}
        latitude={store.Latitude || undefined}
        longitude={store.Longitude || undefined}
        phoneNumber={googleData?.formatted_phone_number}
        website={googleData?.website}
        rating={googleData?.rating}
        ratingCount={googleData?.user_ratings_total}
        storeType={store.Store_Type || 'store'}
        openingHours={googleData?.opening_hours}
      />
      
      <BreadcrumbSchema items={breadcrumbItems} />
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
          storeName={displayName || store.Store_Name} 
          store={store}
          onHoursAdded={setStoreHours}
        />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6">
          {/* Main Content */}
          <div className="space-y-4 md:space-y-6">
            {/* Store Header - Full width on mobile */}
            <StoreHeader store={store} />
            
            {/* Add to List - Separate row on mobile for cleaner layout */}
            <div className="flex justify-end md:hidden">
              <AddToListButton 
                storeId={store.id} 
                storeName={displayName || store.Store_Name || 'Store'} 
                variant="button"
              />
            </div>

            {/* Content Grid - Mobile-first responsive layout */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6">
              {/* Reviews Section - First on mobile, second column on desktop */}
              <div className="xl:col-span-2 order-1 space-y-4 md:space-y-6">
                <StorePricesList storeId={store.id} storeName={displayName || store.Store_Name || 'Store'} />
                <GoogleReviewsSection store={store} />
                <ReviewSection store={store} />
                <StoreComments storeId={store.id} storeName={store.Store_Name} />
              </div>

              {/* Store Info and Hours - Second on mobile, third column on desktop */}
              <div className="xl:col-span-1 order-2 space-y-4 md:space-y-6">
                {/* Desktop: Add to List button */}
                <div className="hidden md:block">
                  <AddToListButton 
                    storeId={store.id} 
                    storeName={displayName || store.Store_Name || 'Store'} 
                    variant="button"
                  />
                </div>
                <div className="xl:sticky xl:top-4 space-y-4 md:space-y-6">
                  <EnhancedGooglePlacesInfo 
                    googleData={googleData}
                    storeName={store.Store_Name}
                    fallbackAddress={`${store.Store_Street_Address}, ${store.City}, ${store.State} ${store.Zip_Code}`}
                  />
                  <EnhancedStoreInfo store={store} />
                  {storeHours && <StoreHoursCard hours={storeHours} />}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
