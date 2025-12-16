import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const SearchEngineOptimizer = () => {
  const location = useLocation();

  useEffect(() => {
    // Add last modified meta tag
    const addLastModified = () => {
      let meta = document.querySelector('meta[name="last-modified"]') as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = 'last-modified';
        document.head.appendChild(meta);
      }
      meta.content = new Date().toISOString();
    };

    // Add author and publisher for E-A-T
    const addEATSignals = () => {
      const signals = [
        { name: 'author', content: 'EBT Finder Team' },
        { name: 'publisher', content: 'EBT Finder' },
        { name: 'copyright', content: `${new Date().getFullYear()} EBT Finder` },
        { name: 'content-language', content: 'en-US' },
        { property: 'article:publisher', content: 'https://ebtfinder.org' }
      ];

      signals.forEach(({ name, property, content }) => {
        const selector = property ? `meta[property="${property}"]` : `meta[name="${name}"]`;
        let meta = document.querySelector(selector) as HTMLMetaElement;
        if (!meta) {
          meta = document.createElement('meta');
          if (property) {
            meta.setAttribute('property', property);
          } else {
            meta.name = name!;
          }
          document.head.appendChild(meta);
        }
        meta.content = content;
      });
    };

    // Optimize for Core Web Vitals
    const optimizeCoreWebVitals = () => {
      // Preload critical fonts
      const fontPreload = document.createElement('link');
      fontPreload.rel = 'preload';
      fontPreload.as = 'font';
      fontPreload.type = 'font/woff2';
      fontPreload.crossOrigin = 'anonymous';
      fontPreload.href = '/fonts/inter-var.woff2';
      
      if (!document.querySelector(`link[href="${fontPreload.href}"]`)) {
        document.head.appendChild(fontPreload);
      }

      // Add resource hints for critical domains
      const domains = [
        'https://fonts.googleapis.com',
        'https://fonts.gstatic.com',
        'https://www.googletagmanager.com'
      ];

      domains.forEach(domain => {
        const preconnect = document.createElement('link');
        preconnect.rel = 'preconnect';
        preconnect.href = domain;
        preconnect.crossOrigin = 'anonymous';
        
        if (!document.querySelector(`link[rel="preconnect"][href="${domain}"]`)) {
          document.head.appendChild(preconnect);
        }
      });
    };

    // Add structured data for sitelinks search box
    const addSitelinksSearchBox = () => {
      const existingScript = document.querySelector('#sitelinks-searchbox');
      if (!existingScript) {
        const schema = {
          "@context": "https://schema.org",
          "@type": "WebSite",
          "url": "https://ebtfinder.org",
          "potentialAction": {
            "@type": "SearchAction",
            "target": {
              "@type": "EntryPoint",
              "urlTemplate": "https://ebtfinder.org/search?q={search_term_string}"
            },
            "query-input": "required name=search_term_string"
          }
        };

        const script = document.createElement('script');
        script.id = 'sitelinks-searchbox';
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(schema);
        document.head.appendChild(script);
      }
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
          
          // Ensure all images have alt text
          if (!element.alt) {
            const src = element.src;
            const filename = src.split('/').pop()?.split('.')[0] || '';
            element.alt = filename.replace(/[-_]/g, ' ');
          }
        });
      } else {
        // Fallback for older browsers - set lazy loading for all
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

    addLastModified();
    addEATSignals();
    optimizeCoreWebVitals();
    addSitelinksSearchBox();
    
    // Delay image optimization to not block initial render
    setTimeout(optimizeImages, 100);

  }, [location.pathname]);

  return null;
};
