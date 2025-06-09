
import React from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useFavorites } from '@/hooks/useFavorites';
import { StoreCard } from '@/components/StoreCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Heart } from 'lucide-react';

export default function Favorites() {
  const { favorites, isLoading } = useFavorites();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-neutral-100">
        <div className="max-w-4xl mx-auto p-4">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <Heart className="h-6 w-6 text-red-500" />
              <h1 className="text-2xl font-bold text-gray-900">My Favorites</h1>
            </div>
            <p className="text-gray-600">
              Your favorite stores that accept EBT/SNAP benefits
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : favorites.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No favorites yet
              </h3>
              <p className="text-gray-600 mb-6">
                Start exploring stores and add them to your favorites!
              </p>
              <a
                href="/search"
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Browse Stores
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map((favorite) => (
                <StoreCard 
                  key={favorite.id} 
                  store={favorite.snap_stores} 
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
