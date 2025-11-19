// Performance monitoring utilities

export const measurePerformance = (name: string, fn: () => void | Promise<void>) => {
  if (typeof performance !== 'undefined' && performance.mark) {
    // Use requestIdleCallback to avoid blocking main thread
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        performance.mark(`${name}-start`);
      });
    } else {
      performance.mark(`${name}-start`);
    }
    
    const result = fn();
    
    if (result instanceof Promise) {
      return result.finally(() => {
        if ('requestIdleCallback' in window) {
          requestIdleCallback(() => {
            performance.mark(`${name}-end`);
            performance.measure(name, `${name}-start`, `${name}-end`);
          });
        } else {
          performance.mark(`${name}-end`);
          performance.measure(name, `${name}-start`, `${name}-end`);
        }
      });
    } else {
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
          performance.mark(`${name}-end`);
          performance.measure(name, `${name}-start`, `${name}-end`);
        });
      } else {
        performance.mark(`${name}-end`);
        performance.measure(name, `${name}-start`, `${name}-end`);
      }
      return result;
    }
  }
  
  return fn();
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Preload critical resources
export const preloadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

export const preloadImages = (sources: string[]): Promise<HTMLImageElement[]> => {
  return Promise.all(sources.map(preloadImage));
};

// Memory management
export const createIntersectionObserver = (
  callback: IntersectionObserverCallback,
  options?: IntersectionObserverInit
) => {
  if (typeof IntersectionObserver === 'undefined') {
    return null;
  }
  
  return new IntersectionObserver(callback, {
    threshold: 0.1,
    ...options
  });
};

// Bundle size monitoring (development only)
export const logBundleSize = () => {
  if (import.meta.env.DEV) {
    // Use requestIdleCallback to avoid blocking
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        const entries = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (entries) {
          console.log('Page Load Performance:', {
            domContentLoaded: entries.domContentLoadedEventEnd - entries.domContentLoadedEventStart,
            loadComplete: entries.loadEventEnd - entries.loadEventStart,
            totalTime: entries.loadEventEnd - entries.fetchStart
          });
        }
      });
    }
  }
};