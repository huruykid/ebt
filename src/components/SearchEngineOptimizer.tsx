import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Handles dynamic SEO optimizations:
 * - Prefetch hints for likely next navigations
 * - Lazy image optimization (alt text, loading attributes)
 * 
 * Static schemas and meta tags are in index.html.
 * E-A-T signals and sitelinks searchbox removed (duplicated index.html).
 */
export const SearchEngineOptimizer = () => {
  const location = useLocation();

  useEffect(() => {
    // Add prefetch hints for likely next navigations
    const addPrefetchHints = () => {
      document.querySelectorAll('link[data-prefetch]').forEach(el => el.remove());

      const routePrefetchMap: Record<string, string[]> = {
        '/': ['/search', '/blog', '/benefits-calculator'],
        '/search': ['/'],
      };

      const hints = [...(routePrefetchMap[location.pathname] || [])];
      if (location.pathname.startsWith('/city/') || location.pathname.startsWith('/state/')) {
        hints.push('/search');
      }

      hints.forEach(href => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = href;
        link.setAttribute('data-prefetch', 'true');
        document.head.appendChild(link);
      });
    };

    // Optimize images for SEO using IntersectionObserver to avoid forced reflow
    const optimizeImages = () => {
      const images = document.querySelectorAll('img:not([loading])');
      
      if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            const element = entry.target as HTMLImageElement;
            if (entry.isIntersecting) {
              element.fetchPriority = 'high';
            } else {
              element.loading = 'lazy';
            }
            observer.unobserve(element);
          });
        }, { rootMargin: '0px' });

        images.forEach((img) => {
          const element = img as HTMLImageElement;
          observer.observe(element);
          
          if (!element.alt) {
            const src = element.src;
            const filename = src.split('/').pop()?.split('.')[0] || '';
            element.alt = filename.replace(/[-_]/g, ' ');
          }
        });
      } else {
        images.forEach((img) => {
          const element = img as HTMLImageElement;
          element.loading = 'lazy';
          if (!element.alt) {
            const src = element.src;
            const filename = src.split('/').pop()?.split('.')[0] || '';
            element.alt = filename.replace(/[-_]/g, ' ');
          }
        });
      }
    };

    addPrefetchHints();
    setTimeout(optimizeImages, 100);

  }, [location.pathname]);

  return null;
};
