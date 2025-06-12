
import React from 'react';
import { StoreSearch } from '@/components/StoreSearch';
import { StoreDataManager } from '@/components/StoreDataManager';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function StoreSearchPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6 space-y-6">
          <StoreDataManager />
          <StoreSearch />
        </div>
      </div>
    </ProtectedRoute>
  );
}
