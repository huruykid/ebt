import { useEffect, memo } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOProps {
  children?: React.ReactNode;
}

/**
 * Consolidated SEO component that handles:
 * - Schema markup (Organization, Website, FAQ, Service)
 * - Meta tags (robots, social, geo-targeting)
 * - Resource hints (preconnect, dns-prefetch)
 * - Accessibility (skip links)
 * - Core Web Vitals optimization
 */
export const SEO = memo<SEOProps>(({ children }) => {
  const location = useLocation();

  useEffect(() => {
    // Batch all DOM operations
    const fragment = document.createDocumentFragment();
    const elementsToAdd: HTMLElement[] = [];
    
    // === META TAGS ===
    const setMeta = (name: string, content: string, type: 'name' | 'property' = 'name') => {
      let meta = document.querySelector(`meta[${type}="${name}"]`) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(type, name);
        elementsToAdd.push(meta);
      }
      meta.content = content;
    };

    // Robots and crawling
    setMeta('robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    setMeta('googlebot', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    
    // Authority signals
    setMeta('author', 'EBT Finder Team');
    setMeta('publisher', 'EBT Finder');
    setMeta('copyright', 'EBT Finder 2026');
    setMeta('application-name', 'EBT Finder');
    setMeta('theme-color', '#8b5cf6');
    
    // Social media
    setMeta('twitter:site', '@ebtfinder');
    setMeta('twitter:creator', '@ebtfinder');
    
    // Mobile optimization
    setMeta('mobile-web-app-capable', 'yes');
    setMeta('apple-mobile-web-app-capable', 'yes');
    setMeta('apple-mobile-web-app-status-bar-style', 'black-translucent');
    setMeta('apple-mobile-web-app-title', 'EBT Finder');
    
    // Geo-targeting
    setMeta('geo.region', 'US');
    setMeta('geo.placename', 'United States');

    // === RESOURCE HINTS ===
    const addResourceHint = (rel: string, href: string, options?: { as?: string; crossorigin?: string }) => {
      if (document.querySelector(`link[rel="${rel}"][href="${href}"]`)) return;
      const link = document.createElement('link');
      link.rel = rel;
      link.href = href;
      if (options?.as) link.setAttribute('as', options.as);
      if (options?.crossorigin) link.crossOrigin = options.crossorigin;
      elementsToAdd.push(link);
    };

    // Preconnect to critical origins
    addResourceHint('preconnect', 'https://fonts.googleapis.com');
    addResourceHint('preconnect', 'https://fonts.gstatic.com', { crossorigin: 'anonymous' });
    addResourceHint('dns-prefetch', 'https://www.google-analytics.com');

    // === SKIP LINK FOR ACCESSIBILITY ===
    if (!document.querySelector('.skip-to-content')) {
      const skipLink = document.createElement('a');
      skipLink.href = '#main-content';
      skipLink.className = 'skip-to-content sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded';
      skipLink.textContent = 'Skip to main content';
      document.body.insertBefore(skipLink, document.body.firstChild);
    }

    // Add all elements to head
    elementsToAdd.forEach(el => document.head.appendChild(el));

    // === SCHEMA MARKUP ===
    const addSchema = (id: string, schema: object | object[]) => {
      document.querySelector(`#${id}`)?.remove();
      const script = document.createElement('script');
      script.id = id;
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(schema);
      document.head.appendChild(script);
    };

    // Organization schema
    addSchema('org-schema', {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "EBT Finder",
      "url": "https://ebtfinder.org",
      "logo": "https://ebtfinder.org/ebt-logo.png",
      "description": "Find stores, restaurants, and markets that accept EBT and SNAP benefits near you",
      "sameAs": ["https://twitter.com/ebtfinder"],
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "Customer Service",
        "email": "support@ebtfinder.org"
      }
    });

    // Website schema with search action
    addSchema('website-schema', {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "EBT Finder",
      "url": "https://ebtfinder.org",
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": "https://ebtfinder.org/search?q={search_term_string}"
        },
        "query-input": "required name=search_term_string"
      }
    });

    // FAQ schema for featured snippets (only on home page)
    if (location.pathname === '/') {
      addSchema('faq-schema', {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "How do I find EBT stores near me?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Use EBT Finder to search by your ZIP code, city, or current location. We show all stores that accept EBT and SNAP benefits."
            }
          },
          {
            "@type": "Question",
            "name": "What stores accept EBT cards?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Most grocery stores, supermarkets, convenience stores, and many farmers markets accept EBT. Some restaurants also accept EBT through the Restaurant Meals Program."
            }
          },
          {
            "@type": "Question",
            "name": "Can I use EBT at restaurants?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, if you're eligible for the Restaurant Meals Program (RMP) and live in a participating state."
            }
          }
        ]
      });
    }

    // === HREFLANG ===
    if (!document.querySelector('link[hreflang]')) {
      const hreflang = document.createElement('link');
      hreflang.rel = 'alternate';
      hreflang.hreflang = 'en-US';
      hreflang.href = `https://ebtfinder.org${location.pathname}`;
      document.head.appendChild(hreflang);
    }

    // Cleanup
    return () => {
      ['org-schema', 'website-schema', 'faq-schema'].forEach(id => {
        document.querySelector(`#${id}`)?.remove();
      });
    };
  }, [location.pathname]);

  return <>{children}</>;
});

SEO.displayName = 'SEO';
