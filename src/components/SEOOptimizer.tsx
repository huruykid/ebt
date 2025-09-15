import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOOptimizerProps {
  children?: React.ReactNode;
}

export const SEOOptimizer: React.FC<SEOOptimizerProps> = ({ children }) => {
  const location = useLocation();

  useEffect(() => {
    // Core Web Vitals optimization
    const optimizeForCWV = () => {
      // Preload critical resources
      const preloadCriticalCSS = () => {
        const criticalCSS = document.createElement('link');
        criticalCSS.rel = 'preload';
        criticalCSS.as = 'style';
        criticalCSS.href = '/src/index.css';
        criticalCSS.onload = () => {
          criticalCSS.rel = 'stylesheet';
        };
        document.head.appendChild(criticalCSS);
      };

      // Optimize images with intersection observer
      const optimizeImages = () => {
        const images = document.querySelectorAll('img[data-src]');
        if ('IntersectionObserver' in window) {
          const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
              if (entry.isIntersecting) {
                const img = entry.target as HTMLImageElement;
                img.src = img.dataset.src!;
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
              }
            });
          });

          images.forEach(img => imageObserver.observe(img));
        }
      };

      // Optimize font loading
      const optimizeFonts = () => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'font';
        link.type = 'font/woff2';
        link.crossOrigin = 'anonymous';
        link.href = 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2';
        document.head.appendChild(link);
      };

      preloadCriticalCSS();
      optimizeImages();
      optimizeFonts();
    };

    // Enhanced meta tags for better SEO
    const enhanceSEO = () => {
      // Add performance-related meta tags
      const addMetaTag = (name: string, content: string) => {
        let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
        if (!meta) {
          meta = document.createElement('meta');
          meta.name = name;
          document.head.appendChild(meta);
        }
        meta.content = content;
      };

      // Technical SEO enhancements
      addMetaTag('robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
      addMetaTag('googlebot', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
      addMetaTag('bingbot', 'index, follow');
      
      // Performance hints
      addMetaTag('resource-type', 'document');
      addMetaTag('distribution', 'global');
      addMetaTag('rating', 'general');
      addMetaTag('revisit-after', '1 days');
      
      // Social media optimization
      addMetaTag('twitter:site', '@ebtfinder');
      addMetaTag('twitter:creator', '@ebtfinder');
      
      // Geo-targeting for local SEO
      addMetaTag('geo.region', 'US');
      addMetaTag('geo.placename', 'United States');
      addMetaTag('ICBM', '39.8283, -98.5795'); // Geographic center of US
    };

    // Add JSON-LD schema for current page
    const addPageSchema = () => {
      const path = location.pathname;
      let schema = null;

      if (path === '/') {
        schema = {
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "EBT Finder",
          "url": "https://ebtfinder.org",
          "description": "Find stores, restaurants, and markets that accept EBT and SNAP benefits near you",
          "potentialAction": [
            {
              "@type": "SearchAction",
              "target": {
                "@type": "EntryPoint",
                "urlTemplate": "https://ebtfinder.org/search?q={search_term_string}"
              },
              "query-input": "required name=search_term_string"
            }
          ],
          "publisher": {
            "@type": "Organization",
            "name": "EBT Finder",
            "logo": {
              "@type": "ImageObject",
              "url": "https://ebtfinder.org/ebt-logo.png"
            }
          }
        };
      } else if (path.startsWith('/city/') || path.match(/^\/[a-z-]+$/)) {
        const cityName = path.replace(/^\/(?:city\/)?/, '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        if (cityName) {
          schema = {
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": `EBT Stores in ${cityName}`,
            "description": `Find EBT and SNAP-approved stores, restaurants, and markets in ${cityName}. Comprehensive directory with locations, hours, and acceptance information.`,
            "url": `https://ebtfinder.org${path}`,
            "mainEntity": {
              "@type": "ItemList",
              "name": `EBT Stores in ${cityName}`,
              "description": `Directory of stores accepting EBT/SNAP benefits in ${cityName}`
            }
          };
        }
      } else if (path === '/snap-tips') {
        schema = {
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": "Complete 2025 SNAP Tips & Tricks Guide",
          "description": "Comprehensive guide to maximizing your SNAP benefits in 2025. Learn about eligible items, programs, and money-saving strategies.",
          "author": {
            "@type": "Organization",
            "name": "EBT Finder"
          },
          "publisher": {
            "@type": "Organization",
            "name": "EBT Finder",
            "logo": {
              "@type": "ImageObject",
              "url": "https://ebtfinder.org/ebt-logo.png"
            }
          },
          "datePublished": "2025-01-01",
          "dateModified": new Date().toISOString(),
          "url": "https://ebtfinder.org/snap-tips"
        };
      }

      if (schema) {
        // Remove existing schema
        const existingSchema = document.querySelector('#page-schema');
        if (existingSchema) {
          existingSchema.remove();
        }

        // Add new schema
        const script = document.createElement('script');
        script.id = 'page-schema';
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(schema);
        document.head.appendChild(script);
      }
    };

    // Performance monitoring for Core Web Vitals
    const monitorPerformance = () => {
      if ('PerformanceObserver' in window) {
        try {
          // Monitor Largest Contentful Paint
          const lcpObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lcpEntry = entries[entries.length - 1];
            if (import.meta.env.DEV) {
              console.log('LCP:', lcpEntry.startTime);
            }
          });

          // Monitor First Input Delay
          const fidObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            if (entries.length > 0) {
              const fidEntry = entries[0] as any;
              if (import.meta.env.DEV) {
                console.log('FID:', fidEntry.processingStart - fidEntry.startTime);
              }
            }
          });

          // Monitor Cumulative Layout Shift
          const clsObserver = new PerformanceObserver((list) => {
            let clsScore = 0;
            for (const entry of list.getEntries()) {
              const layoutShiftEntry = entry as any;
              if (!layoutShiftEntry.hadRecentInput) {
                clsScore += layoutShiftEntry.value;
              }
            }
            if (import.meta.env.DEV) {
              console.log('CLS:', clsScore);
            }
          });

          lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
          fidObserver.observe({ entryTypes: ['first-input'] });
          clsObserver.observe({ entryTypes: ['layout-shift'] });
        } catch (e) {
          console.warn('Performance Observer not supported for some metrics');
        }
      }
    };

    // Execute optimizations
    optimizeForCWV();
    enhanceSEO();
    addPageSchema();
    monitorPerformance();

    // Cleanup on unmount
    return () => {
      const pageSchema = document.querySelector('#page-schema');
      if (pageSchema) {
        pageSchema.remove();
      }
    };
  }, [location.pathname]);

  return <>{children}</>;
};