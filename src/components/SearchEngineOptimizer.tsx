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
      // Add resource hints for critical domains
      const domains = [
        'https://fonts.googleapis.com',
        'https://fonts.gstatic.com',
      ];

      domains.forEach(domain => {
        if (!document.querySelector(`link[rel="preconnect"][href="${domain}"]`)) {
          const preconnect = document.createElement('link');
          preconnect.rel = 'preconnect';
          preconnect.href = domain;
          preconnect.crossOrigin = 'anonymous';
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

    // Optimize images for SEO - Avoid forced reflows
    const optimizeImages = () => {
      // Use requestIdleCallback to avoid blocking main thread
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
          const images = document.querySelectorAll('img:not([loading])');
          const windowHeight = window.innerHeight; // Read once to avoid reflows
          
          images.forEach((img) => {
            const element = img as HTMLImageElement;
            
            // Set lazy loading for all images by default
            if (!element.loading) {
              element.loading = 'lazy';
            }

            // Ensure all images have alt text
            if (!element.alt) {
              const src = element.src;
              const filename = src.split('/').pop()?.split('.')[0] || '';
              element.alt = filename.replace(/[-_]/g, ' ');
            }
          });
        });
      }
    };

    addLastModified();
    addEATSignals();
    optimizeCoreWebVitals();
    addSitelinksSearchBox();
    
    // Delay image optimization to avoid forced reflows
    optimizeImages();

  }, [location.pathname]);

  return null;
};
