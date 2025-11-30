import { lazy, Suspense } from 'react';
import { LoadingSpinner } from './LoadingSpinner';

// Lazy load heavy, below-the-fold components
export const HowItWorksSection = lazy(() => import('./HowItWorksSection').then(m => ({ default: m.HowItWorksSection })));
export const StoreTypesSection = lazy(() => import('./StoreTypesSection').then(m => ({ default: m.StoreTypesSection })));
export const PopularSearchesSection = lazy(() => import('./PopularSearchesSection').then(m => ({ default: m.PopularSearchesSection })));
export const CitiesDirectory = lazy(() => import('./CitiesDirectory').then(m => ({ default: m.CitiesDirectory })));

// Wrapper component with optimized loading
export const LazySection = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<div className="loading-skeleton h-32 w-full rounded-lg" />}>
    {children}
  </Suspense>
);
