import React, { Suspense } from 'react';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface LazyLoadProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const LazyLoad: React.FC<LazyLoadProps> = ({ 
  children, 
  fallback = <LoadingSpinner /> 
}) => {
  return (
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  );
};

// Higher-order component for lazy loading pages
export const withLazyLoad = <P extends Record<string, any>>(
  Component: React.ComponentType<P>,
  fallback?: React.ReactNode
) => {
  const LazyComponent = React.lazy(() => Promise.resolve({ default: Component }));
  
  return React.forwardRef<any, P>((props, ref) => (
    <LazyLoad fallback={fallback}>
      <LazyComponent {...props} ref={ref} />
    </LazyLoad>
  ));
};