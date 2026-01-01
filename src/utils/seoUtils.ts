// SEO utility functions for better search rankings

export interface SEOMetrics {
  coreWebVitals: {
    lcp: number | null;
    fid: number | null;
    cls: number | null;
  };
  pageSpeed: {
    domContentLoaded: number | null;
    firstPaint: number | null;
    firstContentfulPaint: number | null;
  };
}

export const measureSEOMetrics = (): Promise<SEOMetrics> => {
  return new Promise((resolve) => {
    const metrics: SEOMetrics = {
      coreWebVitals: {
        lcp: null,
        fid: null,
        cls: null
      },
      pageSpeed: {
        domContentLoaded: null,
        firstPaint: null,
        firstContentfulPaint: null
      }
    };

    // Measure Core Web Vitals
    if ('PerformanceObserver' in window) {
      // Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lcpEntry = entries[entries.length - 1];
        metrics.coreWebVitals.lcp = lcpEntry.startTime;
      });
      
      // First Input Delay
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        if (entries.length > 0) {
          const fidEntry = entries[0] as PerformanceEventTiming;
          metrics.coreWebVitals.fid = fidEntry.processingStart - fidEntry.startTime;
        }
      });

      // Cumulative Layout Shift
      const clsObserver = new PerformanceObserver((list) => {
        let clsScore = 0;
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsScore += (entry as any).value;
          }
        }
        metrics.coreWebVitals.cls = clsScore;
      });

      try {
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        fidObserver.observe({ entryTypes: ['first-input'] });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (e) {
        console.warn('Performance Observer not supported for some metrics');
      }
    }

    // Measure page speed metrics
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      metrics.pageSpeed.domContentLoaded = navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart;
      
      const paintEntries = performance.getEntriesByType('paint');
      paintEntries.forEach((entry) => {
        if (entry.name === 'first-paint') {
          metrics.pageSpeed.firstPaint = entry.startTime;
        } else if (entry.name === 'first-contentful-paint') {
          metrics.pageSpeed.firstContentfulPaint = entry.startTime;
        }
      });
    }

    // Return metrics after a short delay to allow for measurement
    setTimeout(() => resolve(metrics), 2000);
  });
};

// Generate city-specific keywords
export const generateCityKeywords = (cityName: string, stateAbbr?: string): string[] => {
  const formattedCity = cityName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  const locationString = stateAbbr ? `${formattedCity}, ${stateAbbr.toUpperCase()}` : formattedCity;
  
  const baseKeywords = [
    'EBT stores',
    'SNAP benefits',
    'food stamps',
    'grocery stores',
    'restaurants accept EBT',
    'farmers market EBT',
    'hot food program',
    'Restaurant Meals Program',
    'RMP locations'
  ];

  return baseKeywords.map(keyword => `${keyword} ${locationString}`);
};

// Generate meta description for different page types
export const generateMetaDescription = (pageType: string, data: any): string => {
  switch (pageType) {
    case 'city':
      return `Find ${data.storeCount || 'hundreds of'} EBT and SNAP-approved stores in ${data.cityName}. Search grocery stores, restaurants, farmers markets, and more accepting food stamps.`;
    
    case 'store':
      return `${data.storeName} accepts EBT and SNAP benefits. Get store details, hours, phone number, and directions. Check if they participate in hot food programs.`;
    
    case 'search':
      return `Search results for EBT and SNAP-approved stores${data.location ? ` near ${data.location}` : ''}. Find grocery stores, restaurants, and markets accepting food stamps.`;
    
    case 'snap-tips':
      return 'Complete 2026 SNAP tips and tricks guide. Learn how to maximize your benefits, eligible items, Double Up programs, and money-saving strategies.';
    
    default:
      return 'Find stores, restaurants, and markets that accept EBT and SNAP benefits near you. Search by location, store type, or ZIP code. Free and mobile-friendly.';
  }
};

// Optimize images for SEO
export const optimizeImageSEO = (element: HTMLImageElement, alt: string, title?: string) => {
  element.alt = alt;
  if (title) element.title = title;
  
  // Add loading optimization
  element.loading = 'lazy';
  element.decoding = 'async';
  
  // Add structured data for images
  const schema = {
    "@context": "https://schema.org",
    "@type": "ImageObject",
    "url": element.src,
    "description": alt,
    "contentUrl": element.src
  };
  
  element.setAttribute('data-schema', JSON.stringify(schema));
};

// Generate canonical URLs
export const generateCanonicalUrl = (path: string): string => {
  const baseUrl = 'https://ebtfinder.org';
  return `${baseUrl}${path}`;
};

// Social media meta tags
export const generateSocialMetaTags = (title: string, description: string, image?: string) => {
  const defaultImage = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&h=630&fit=crop&auto=format';
  
  return {
    'og:title': title,
    'og:description': description,
    'og:image': image || defaultImage,
    'og:type': 'website',
    'twitter:card': 'summary_large_image',
    'twitter:title': title,
    'twitter:description': description,
    'twitter:image': image || defaultImage,
    'twitter:site': '@ebtfinder'
  };
};

// Track SEO performance
export const trackSEOPerformance = async () => {
  try {
    const metrics = await measureSEOMetrics();
    
    // Log to console in development
    if (import.meta.env.DEV) {
      console.log('SEO Performance Metrics:', metrics);
    }
    
    // You could send this to analytics service
    // analytics.track('seo_metrics', metrics);
    
    return metrics;
  } catch (error) {
    console.error('Error tracking SEO performance:', error);
    return null;
  }
};