import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface AdvancedSEOProps {
  children?: React.ReactNode;
}

export const AdvancedSEO: React.FC<AdvancedSEOProps> = ({ children }) => {
  const location = useLocation();

  useEffect(() => {
    // Critical performance optimizations for ranking
    const optimizeForRanking = () => {
      // 1. Preload critical resources
      const preloadCriticalResources = () => {
        // Preload critical images
        const criticalImages = [
          'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&h=400&fit=crop&auto=format',
          '/ebt-logo.png'
        ];

        criticalImages.forEach(src => {
          const link = document.createElement('link');
          link.rel = 'preload';
          link.as = 'image';
          link.href = src;
          document.head.appendChild(link);
        });

        // Preload critical JavaScript
        const criticalJS = document.createElement('link');
        criticalJS.rel = 'modulepreload';
        criticalJS.href = '/src/main.tsx';
        document.head.appendChild(criticalJS);
      };

      // 2. Optimize images with advanced lazy loading - batch to avoid forced reflows
      const optimizeImages = () => {
        requestAnimationFrame(() => {
          const images = document.querySelectorAll('img');
          images.forEach(img => {
            // Add loading="lazy" for better LCP
            img.loading = 'lazy';
            img.decoding = 'async';
            
            // Add fetchpriority for hero images
            if (img.classList.contains('hero-image') || img.closest('.hero-section')) {
              img.setAttribute('fetchpriority', 'high');
              img.loading = 'eager'; // Load hero images immediately
            }
          });
        });
      };

      // 3. Optimize fonts for better CLS
      const optimizeFonts = () => {
        // Add font-display: swap for better CLS
        const style = document.createElement('style');
        style.textContent = `
          @font-face {
            font-family: 'Inter';
            font-display: swap;
            src: url('https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2') format('woff2');
          }
        `;
        document.head.appendChild(style);
      };

      preloadCriticalResources();
      optimizeImages();
      optimizeFonts();
    };

    // Advanced meta tags for ranking
    const addAdvancedMeta = () => {
      const addMetaTag = (name: string, content: string, type: 'name' | 'property' = 'name') => {
        let meta = document.querySelector(`meta[${type}="${name}"]`) as HTMLMetaElement;
        if (!meta) {
          meta = document.createElement('meta');
          meta.setAttribute(type, name);
          document.head.appendChild(meta);
        }
        meta.content = content;
      };

      // Advanced robots directives for better crawling
      addMetaTag('robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1, noimageindex');
      addMetaTag('googlebot', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
      addMetaTag('bingbot', 'index, follow, max-image-preview:large');
      
      // Authority and trust signals
      addMetaTag('classification', 'business');
      addMetaTag('category', 'Food & Dining, Social Services');
      addMetaTag('coverage', 'Worldwide');
      addMetaTag('distribution', 'Global');
      addMetaTag('rating', 'General');
      addMetaTag('copyright', 'EBT Finder 2025');
      
      // Enhanced social media optimization
      addMetaTag('twitter:site', '@ebtfinder');
      addMetaTag('twitter:creator', '@ebtfinder');
      addMetaTag('fb:app_id', '1234567890'); // Add your Facebook App ID
      
      // Mobile optimization signals
      addMetaTag('mobile-web-app-capable', 'yes');
      addMetaTag('apple-mobile-web-app-capable', 'yes');
      addMetaTag('apple-mobile-web-app-status-bar-style', 'black-translucent');
      
      // Geographic targeting for local SEO
      addMetaTag('geo.region', 'US');
      addMetaTag('geo.placename', 'United States');
      addMetaTag('ICBM', '39.8283, -98.5795');
      addMetaTag('DC.title', document.title);
    };

    // Advanced structured data for better SERP features
    const addAdvancedStructuredData = () => {
      const path = location.pathname;
      
      // Website schema with advanced properties
      const websiteSchema = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "EBT Finder",
        "alternateName": "SNAP Store Locator",
        "url": "https://ebtfinder.org",
        "description": "The most comprehensive directory of EBT and SNAP-approved stores, restaurants, and markets in the United States.",
        "keywords": "EBT stores, SNAP benefits, food stamps, grocery stores, restaurant meals program, farmers markets",
        "inLanguage": "en-US",
        "copyrightYear": "2025",
        "copyrightHolder": {
          "@type": "Organization",
          "name": "EBT Finder"
        },
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
          "url": "https://ebtfinder.org",
          "logo": {
            "@type": "ImageObject",
            "url": "https://ebtfinder.org/ebt-logo.png",
            "width": 512,
            "height": 512
          },
          "sameAs": [
            "https://twitter.com/ebtfinder"
          ]
        }
      };

      // Add FAQ schema for featured snippets
      const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "How do I find EBT stores near me?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Use EBT Finder to search by your ZIP code, city, or current location. We show all stores, restaurants, and markets that accept EBT and SNAP benefits with real-time information."
            }
          },
          {
            "@type": "Question",
            "name": "What stores accept EBT cards?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Most grocery stores, supermarkets, convenience stores, and many farmers markets accept EBT. Some restaurants also accept EBT through the Restaurant Meals Program (RMP) in participating states."
            }
          },
          {
            "@type": "Question",
            "name": "Can I use EBT at restaurants?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, if you're eligible for the Restaurant Meals Program (RMP) and live in a participating state. RMP allows elderly, disabled, and homeless SNAP recipients to purchase hot, prepared meals at approved restaurants."
            }
          },
          {
            "@type": "Question",
            "name": "Do farmers markets accept EBT?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Many farmers markets accept EBT and often offer matching programs that double your benefits. Search for farmers markets in your area using our location finder."
            }
          }
        ]
      };

      // Service schema for local SEO
      const serviceSchema = {
        "@context": "https://schema.org",
        "@type": "Service",
        "name": "EBT Store Locator Service",
        "description": "Free service to help SNAP recipients find stores, restaurants, and markets that accept EBT benefits",
        "provider": {
          "@type": "Organization",
          "name": "EBT Finder"
        },
        "areaServed": {
          "@type": "Country",
          "name": "United States"
        },
        "audience": {
          "@type": "Audience",
          "audienceType": "SNAP/EBT Recipients"
        },
        "serviceType": "Directory Service",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        }
      };

      // Remove existing schemas
      const existingSchemas = document.querySelectorAll('#advanced-seo-schema');
      existingSchemas.forEach(schema => schema.remove());

      // Add new comprehensive schema
      const script = document.createElement('script');
      script.id = 'advanced-seo-schema';
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify([websiteSchema, faqSchema, serviceSchema]);
      document.head.appendChild(script);
    };

    // Performance monitoring for Core Web Vitals optimization
    const monitorCoreWebVitals = () => {
      if ('PerformanceObserver' in window) {
        // Enhanced LCP monitoring with optimization
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          
          // Log LCP for debugging (remove in production)
          if (import.meta.env.DEV) {
            console.log('LCP:', lastEntry.startTime, 'ms');
          }
          
          // If LCP is poor (>2.5s), try to optimize
          if (lastEntry.startTime > 2500) {
            // Preload more critical resources
            const criticalCSS = document.createElement('link');
            criticalCSS.rel = 'preload';
            criticalCSS.as = 'style';
            criticalCSS.href = '/src/index.css';
            document.head.appendChild(criticalCSS);
          }
        });

        // Enhanced FID monitoring
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          if (entries.length > 0) {
            const fidEntry = entries[0] as any;
            const fid = fidEntry.processingStart - fidEntry.startTime;
            
            if (import.meta.env.DEV) {
              console.log('FID:', fid, 'ms');
            }
          }
        });

        // Enhanced CLS monitoring with layout shift optimization
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
          
          // If CLS is poor (>0.1), add stabilization styles
          if (clsScore > 0.1) {
            const style = document.createElement('style');
            style.textContent = `
              img { aspect-ratio: attr(width) / attr(height); }
              .skeleton { min-height: 200px; }
            `;
            document.head.appendChild(style);
          }
        });

        try {
          lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
          fidObserver.observe({ entryTypes: ['first-input'] });
          clsObserver.observe({ entryTypes: ['layout-shift'] });
        } catch (e) {
          console.warn('Some Performance Observer metrics not supported');
        }
      }
    };

    // Execute all optimizations
    optimizeForRanking();
    addAdvancedMeta();
    addAdvancedStructuredData();
    monitorCoreWebVitals();

    // Cleanup function
    return () => {
      const schemas = document.querySelectorAll('#advanced-seo-schema');
      schemas.forEach(schema => schema.remove());
    };
  }, [location.pathname]);

  return <>{children}</>;
};