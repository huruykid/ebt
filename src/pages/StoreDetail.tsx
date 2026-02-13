import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { StoreHeader } from '@/components/store-detail/StoreHeader';
import { ReviewSection } from '@/components/store-detail/ReviewSection';
import { StorePhotos } from '@/components/store-detail/StorePhotos';
import { StoreComments } from '@/components/StoreComments';
import { SEOHead } from '@/components/SEOHead';
import { LocalBusinessSchema } from '@/components/LocalBusinessSchema';
import { BreadcrumbSchema } from '@/components/BreadcrumbSchema';
import { GoogleReviewsSection } from '@/components/store-detail/GoogleReviewsSection';
import { EnhancedGooglePlacesInfo } from '@/components/store-detail/EnhancedGooglePlacesInfo';
import { useStoredGooglePlaces } from '@/hooks/useStoredGooglePlaces';
import { useRecentlyViewedStores } from '@/hooks/useRecentlyViewedStores';
import { StorePricesList } from '@/components/prices/StorePricesList';
import { useNavigationReferrer } from '@/hooks/useNavigationReferrer';
import type { Tables } from '@/integrations/supabase/types';

type Store = Tables<'snap_stores'>;

export default function StoreDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [storeHours, setStoreHours] = useState<Record<string, { open: string; close: string; closed: boolean }> | null>(null);
  const { trackView } = useRecentlyViewedStores();
  const { referrerPath, referrerLabel } = useNavigationReferrer();

  const { data: store, isLoading, error } = useQuery({
    queryKey: ['store', id],
    queryFn: async () => {
      if (!id) throw new Error('Store ID is required');
      const { data, error } = await supabase
        .from('snap_stores')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (store?.id) trackView(store.id);
  }, [store?.id, trackView]);

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
          <div className="max-w-2xl mx-auto pt-8 text-center">
            <Button onClick={() => navigate(referrerPath)} variant="ghost" className="mb-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {referrerLabel}
            </Button>
            <h2 className="text-lg font-semibold text-foreground mb-1">Store Not Found</h2>
            <p className="text-sm text-muted-foreground">This store doesn't exist or may have been removed.</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const displayName = store.Store_Name;
  const seoTitle = `${displayName} - EBT Store | EBT Finder`;
  const seoDescription = `${displayName} at ${googleData?.formatted_address || `${store.Store_Street_Address}, ${store.City}, ${store.State}`}. EBT/SNAP accepted.${googleData?.rating ? ` Rated ${googleData.rating} stars.` : ''}`;

  return (
    <ProtectedRoute>
      <SEOHead
        title={seoTitle}
        description={seoDescription}
        keywords={`${displayName}, EBT store, SNAP, ${store.City}, ${store.State}`}
        canonicalUrl={`https://ebtfinder.org/store/${id}`}
      />
      <LocalBusinessSchema
        storeName={displayName || ''}
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
      <BreadcrumbSchema items={[
        { name: 'Home', url: '/' },
        { name: 'Search', url: '/search' },
        { name: displayName || 'Store', url: `/store/${id}` },
      ]} />

      <div className="min-h-screen bg-background">
        {/* Back button */}
        <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-lg border-b border-border/50">
          <div className="max-w-2xl mx-auto px-4 py-2.5">
            <Button onClick={() => navigate(referrerPath)} variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground -ml-2">
              <ArrowLeft className="h-4 w-4 mr-1" />
              {referrerLabel}
            </Button>
          </div>
        </div>

        {/* Photos */}
        <StorePhotos storeName={displayName || ''} store={store} onHoursAdded={setStoreHours} />

        {/* Content */}
        <div className="max-w-2xl mx-auto px-4 py-5 space-y-5">
          <StoreHeader store={store} />

          {/* Hours */}
          <EnhancedGooglePlacesInfo
            googleData={googleData}
            storeName={store.Store_Name || ''}
            fallbackAddress={`${store.Store_Street_Address}, ${store.City}, ${store.State} ${store.Zip_Code}`}
          />

          {/* Prices */}
          <StorePricesList storeId={store.id} storeName={displayName || ''} />

          {/* Reviews */}
          <GoogleReviewsSection store={store} />
          <ReviewSection store={store} />

          {/* Comments */}
          <StoreComments storeId={store.id} storeName={store.Store_Name} />
        </div>
      </div>
    </ProtectedRoute>
  );
}
