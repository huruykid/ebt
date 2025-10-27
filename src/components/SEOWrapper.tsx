import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ComprehensiveSEO } from './ComprehensiveSEO';

interface SEOWrapperProps {
  children: React.ReactNode;
}

export const SEOWrapper: React.FC<SEOWrapperProps> = ({ children }) => {
  const location = useLocation();

  useEffect(() => {
    // Update canonical URL on route change
    const updateCanonical = () => {
      let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.rel = 'canonical';
        document.head.appendChild(canonical);
      }
      canonical.href = `https://ebtfinder.org${location.pathname}`;
    };

    // Add BreadcrumbList schema
    const addBreadcrumbSchema = () => {
      const pathSegments = location.pathname.split('/').filter(Boolean);
      if (pathSegments.length === 0) return;

      const breadcrumbList = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://ebtfinder.org"
          },
          ...pathSegments.map((segment, index) => ({
            "@type": "ListItem",
            "position": index + 2,
            "name": segment.split('-').map(word => 
              word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' '),
            "item": `https://ebtfinder.org/${pathSegments.slice(0, index + 1).join('/')}`
          }))
        ]
      };

      const existingScript = document.querySelector('#breadcrumb-schema');
      if (existingScript) {
        existingScript.remove();
      }

      const script = document.createElement('script');
      script.id = 'breadcrumb-schema';
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(breadcrumbList);
      document.head.appendChild(script);
    };

    // Optimize images for better CLS scores
    const optimizeImages = () => {
      const images = document.querySelectorAll('img:not([width]):not([height])');
      images.forEach((img) => {
        const htmlImg = img as HTMLImageElement;
        // Add aspect-ratio to prevent layout shift
        if (!htmlImg.style.aspectRatio && htmlImg.naturalWidth && htmlImg.naturalHeight) {
          htmlImg.style.aspectRatio = `${htmlImg.naturalWidth}/${htmlImg.naturalHeight}`;
        }
        
        // Ensure all images have alt text
        if (!htmlImg.alt) {
          console.warn('Image missing alt text:', htmlImg.src);
        }
      });
    };

    // Add performance observer for LCP
    const observeLCP = () => {
      if ('PerformanceObserver' in window) {
        try {
          const po = new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            const lastEntry = entries[entries.length - 1] as any;
            
            // Mark LCP element with fetchpriority if it's an image
            if (lastEntry.element && lastEntry.element.tagName === 'IMG') {
              lastEntry.element.setAttribute('fetchpriority', 'high');
            }
          });
          po.observe({ type: 'largest-contentful-paint', buffered: true });
        } catch (e) {
          // PerformanceObserver not supported
        }
      }
    };

    updateCanonical();
    addBreadcrumbSchema();
    
    // Delay image optimization to not block initial render
    setTimeout(() => {
      optimizeImages();
      observeLCP();
    }, 100);

    return () => {
      document.querySelector('#breadcrumb-schema')?.remove();
    };
  }, [location.pathname]);

  return <ComprehensiveSEO>{children}</ComprehensiveSEO>;
};
