import { Suspense, lazy } from 'react';
import { LoadingSpinner } from './LoadingSpinner';

// Lazy load heavy components for better FCP
const ExploreTrending = lazy(() => import('./ExploreTrending'));

export const CriticalContent = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    }>
      <ExploreTrending />
    </Suspense>
  );
};
