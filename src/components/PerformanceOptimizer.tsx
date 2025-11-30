import { useEffect } from 'react';
import { optimizeResourceLoading, preventLayoutShifts } from '@/utils/performanceMonitor';

export const PerformanceOptimizer = () => {
  useEffect(() => {
    // Optimize resource loading after initial render
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        optimizeResourceLoading();
        preventLayoutShifts();
      }, { timeout: 3000 });
    } else {
      setTimeout(() => {
        optimizeResourceLoading();
        preventLayoutShifts();
      }, 3000);
    }
  }, []);

  return null;
};
