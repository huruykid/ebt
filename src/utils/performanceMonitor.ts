// Advanced performance monitoring utilities

interface PerformanceMetrics {
  fcp?: number;
  lcp?: number;
  fid?: number;
  cls?: number;
  ttfb?: number;
}

export const reportWebVitals = (onReport: (metrics: PerformanceMetrics) => void) => {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
    return;
  }

  const metrics: PerformanceMetrics = {};

  // First Contentful Paint
  try {
    const fcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const fcpEntry = entries[entries.length - 1];
      metrics.fcp = fcpEntry.startTime;
      onReport(metrics);
      fcpObserver.disconnect();
    });
    fcpObserver.observe({ entryTypes: ['paint'] });
  } catch (e) {
    // Silently fail
  }

  // Largest Contentful Paint
  try {
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lcpEntry = entries[entries.length - 1];
      metrics.lcp = lcpEntry.startTime;
      onReport(metrics);
    });
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
  } catch (e) {
    // Silently fail
  }

  // Cumulative Layout Shift
  try {
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
          metrics.cls = clsValue;
          onReport(metrics);
        }
      }
    });
    clsObserver.observe({ entryTypes: ['layout-shift'] });
  } catch (e) {
    // Silently fail
  }

  // Time to First Byte
  try {
    const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigationEntry) {
      metrics.ttfb = navigationEntry.responseStart - navigationEntry.requestStart;
      onReport(metrics);
    }
  } catch (e) {
    // Silently fail
  }
};

// Optimize resource loading
export const optimizeResourceLoading = () => {
  // Prefetch next likely navigations
  const prefetchLinks = ['/search', '/mission', '/snap-tips'];
  
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      prefetchLinks.forEach(href => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = href;
        document.head.appendChild(link);
      });
    });
  }
};

// Reduce layout shifts
export const preventLayoutShifts = () => {
  // Add aspect ratio to images without dimensions
  document.querySelectorAll('img:not([width]):not([height])').forEach((img) => {
    const element = img as HTMLImageElement;
    if (element.naturalWidth && element.naturalHeight) {
      const aspectRatio = element.naturalWidth / element.naturalHeight;
      element.style.aspectRatio = aspectRatio.toString();
    }
  });
};
