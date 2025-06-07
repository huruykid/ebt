
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, ArrowLeft, Star, Phone, Clock } from 'lucide-react';
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

  const formatAddress = (store: Store) => {
    const parts = [
      store.store_street_address,
      store.additional_address,
      store.city,
      store.state,
      store.zip_code
    ].filter(Boolean);
    
    return parts.join(', ');
  };

  const openInMaps = () => {
    if (store?.latitude && store?.longitude) {
      const url = `https://www.google.com/maps/search/?api=1&query=${store.latitude},${store.longitude}`;
      window.open(url, '_blank');
    }
  };

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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Store Info */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-gray-900">
                    {store.store_name}
                  </CardTitle>
                  {store.store_type && (
                    <div className="flex items-center gap-2">
                      <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        {store.store_type}
                      </span>
                    </div>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  {formatAddress(store) && (
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-gray-900 font-medium">Address</p>
                        <p className="text-gray-600">{formatAddress(store)}</p>
                        {(!store.store_street_address || !store.city) && (
                          <p className="text-amber-600 text-sm mt-1">
                            ⚠️ Address information may be incomplete
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {store.incentive_program && (
                    <div className="flex items-start gap-3">
                      <Star className="h-5 w-5 text-yellow-500 mt-0.5" />
                      <div>
                        <p className="text-gray-900 font-medium">Incentive Program</p>
                        <p className="text-gray-600">{store.incentive_program}</p>
                      </div>
                    </div>
                  )}

                  {store.grantee_name && (
                    <div>
                      <p className="text-gray-900 font-medium">Operated by</p>
                      <p className="text-gray-600">{store.grantee_name}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Placeholder for future features */}
              <Card>
                <CardHeader>
                  <CardTitle>Store Images</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <p className="text-gray-500">Image upload and Google Places integration coming soon!</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {store.latitude && store.longitude && (
                <Card>
                  <CardHeader>
                    <CardTitle>Location</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button onClick={openInMaps} className="w-full" variant="outline">
                      <MapPin className="h-4 w-4 mr-2" />
                      View on Google Maps
                    </Button>
                    <div className="mt-4 text-sm text-gray-600">
                      <p>Coordinates:</p>
                      <p>{store.latitude}, {store.longitude}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Store Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {store.county && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">County</p>
                      <p className="text-gray-900">{store.county}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-500">Store ID</p>
                    <p className="text-gray-900">{store.id}</p>
                  </div>
                  {store.record_id && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Record ID</p>
                      <p className="text-gray-900">{store.record_id}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
