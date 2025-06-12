
import React from 'react';
import { StoreSearch } from '@/components/StoreSearch';
import { CSVUploadManager } from '@/components/CSVUploadManager';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function StoreSearchPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6 space-y-6">
          <CSVUploadManager />
          <StoreSearch />
        </div>
      </div>
    </ProtectedRoute>
  );
}
