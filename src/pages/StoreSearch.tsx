
import React from 'react';
import { StoreSearch } from '@/components/StoreSearch';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function StoreSearchPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-neutral-100">
        <StoreSearch />
      </div>
    </ProtectedRoute>
  );
}
