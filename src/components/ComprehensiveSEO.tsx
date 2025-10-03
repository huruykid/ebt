import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface ComprehensiveSEOProps {
  children?: React.ReactNode;
}

export const ComprehensiveSEO: React.FC<ComprehensiveSEOProps> = ({ children }) => {
  const location = useLocation();

  useEffect(() => {
    // Add comprehensive semantic HTML and accessibility
    const addSemanticMarkup = () => {
      // Ensure proper document structure
      if (!document.querySelector('[role="main"]')) {
        const main = document.querySelector('main') || document.getElementById('root')?.querySelector('div');
        if (main) main.setAttribute('role', 'main');
      }

      // Add skip navigation for accessibility
      if (!document.querySelector('.skip-to-content')) {
        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.className = 'skip-to-content sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded';
        skipLink.textContent = 'Skip to main content';
        document.body.insertBefore(skipLink, document.body.firstChild);
      }
    };

    // Enhanced internal linking strategy
    const enhanceInternalLinking = () => {
      setTimeout(() => {
        const footer = document.querySelector('footer');
        if (!footer || footer.querySelector('.seo-enhanced-links')) return;

        const linkSection = document.createElement('nav');
        linkSection.className = 'seo-enhanced-links mt-8 border-t border-border pt-8';
        linkSection.setAttribute('aria-label', 'Additional site navigation');
        
        linkSection.innerHTML = `
          <div class="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
            <div>
              <h3 class="font-semibold text-foreground mb-3">Top Cities</h3>
              <ul class="space-y-2 text-muted-foreground">
                <li><a href="/los-angeles" class="hover:text-primary transition-colors">Los Angeles EBT Stores</a></li>
                <li><a href="/chicago-ebt" class="hover:text-primary transition-colors">Chicago SNAP Locations</a></li>
                <li><a href="/houston" class="hover:text-primary transition-colors">Houston Food Stamps</a></li>
                <li><a href="/phoenix" class="hover:text-primary transition-colors">Phoenix EBT Accepted</a></li>
              </ul>
            </div>
            <div>
              <h3 class="font-semibold text-foreground mb-3">Resources</h3>
              <ul class="space-y-2 text-muted-foreground">
                <li><a href="/snap-tips" class="hover:text-primary transition-colors">SNAP Tips & Tricks 2025</a></li>
                <li><a href="/mission" class="hover:text-primary transition-colors">About EBT Finder</a></li>
                <li><a href="/ebt-chip-card" class="hover:text-primary transition-colors">EBT Chip Card Stores</a></li>
                <li><a href="/support" class="hover:text-primary transition-colors">Help & Support</a></li>
              </ul>
            </div>
            <div>
              <h3 class="font-semibold text-foreground mb-3">Store Types</h3>
              <ul class="space-y-2 text-muted-foreground">
                <li><a href="/search?type=grocery" class="hover:text-primary transition-colors">Grocery Stores</a></li>
                <li><a href="/search?type=convenience" class="hover:text-primary transition-colors">Convenience Stores</a></li>
                <li><a href="/search?type=farmers-market" class="hover:text-primary transition-colors">Farmers Markets</a></li>
                <li><a href="/search?type=restaurant" class="hover:text-primary transition-colors">RMP Restaurants</a></li>
              </ul>
            </div>
            <div>
              <h3 class="font-semibold text-foreground mb-3">Legal</h3>
              <ul class="space-y-2 text-muted-foreground">
                <li><a href="/privacy-policy" class="hover:text-primary transition-colors">Privacy Policy</a></li>
                <li><a href="/support" class="hover:text-primary transition-colors">Terms of Service</a></li>
                <li><a href="/support" class="hover:text-primary transition-colors">Contact Us</a></li>
              </ul>
            </div>
          </div>
        `;
        
        footer.appendChild(linkSection);
      }, 1500);
    };

    // Add Organization schema for better E-A-T
    const addOrganizationSchema = () => {
      if (document.querySelector('#organization-schema')) return;

      const orgSchema = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "EBT Finder",
        "url": "https://ebtfinder.org",
        "logo": "https://ebtfinder.org/ebt-logo.png",
        "description": "Find stores, restaurants, and markets that accept EBT and SNAP benefits near you",
        "foundingDate": "2024",
        "founders": [{
          "@type": "Person",
          "name": "Huruy Kidanemariam",
          "jobTitle": "Founder & UX Designer"
        }],
        "sameAs": [
          "https://twitter.com/ebtfinder",
          "https://www.linkedin.com/in/huruydesigns/"
        ],
        "contactPoint": {
          "@type": "ContactPoint",
          "contactType": "Customer Service",
          "email": "support@ebtfinder.org",
          "url": "https://ebtfinder.org/support"
        },
        "areaServed": {
          "@type": "Country",
          "name": "United States"
        },
        "knowsAbout": [
          "SNAP Benefits",
          "EBT Cards",
          "Food Assistance Programs",
          "Restaurant Meals Program",
          "USDA SNAP Retailers"
        ]
      };

      const script = document.createElement('script');
      script.id = 'organization-schema';
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(orgSchema);
      document.head.appendChild(script);
    };

    // Add WebSite schema with sitelinks search box
    const addWebsiteSchema = () => {
      if (document.querySelector('#website-schema')) return;

      const websiteSchema = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "EBT Finder",
        "url": "https://ebtfinder.org",
        "potentialAction": [{
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": "https://ebtfinder.org/search?q={search_term_string}"
          },
          "query-input": "required name=search_term_string"
        }]
      };

      const script = document.createElement('script');
      script.id = 'website-schema';
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(websiteSchema);
      document.head.appendChild(script);
    };

    // Optimize Core Web Vitals
    const optimizeCoreWebVitals = () => {
      // Lazy load images below the fold
      const images = document.querySelectorAll('img:not([loading])');
      images.forEach((img, index) => {
        if (index > 2) { // First 3 images load eagerly
          img.setAttribute('loading', 'lazy');
        }
      });

      // Add fetchpriority to hero images
      const heroImages = document.querySelectorAll('.hero img, header img, [data-hero-image]');
      heroImages.forEach(img => {
        img.setAttribute('fetchpriority', 'high');
      });

      // Minimize layout shift by setting aspect ratios
      const unstyledImages = document.querySelectorAll('img:not([width]):not([height])');
      unstyledImages.forEach(img => {
        const htmlImg = img as HTMLImageElement;
        if (htmlImg.naturalWidth && htmlImg.naturalHeight) {
          const aspectRatio = htmlImg.naturalWidth / htmlImg.naturalHeight;
          htmlImg.style.aspectRatio = `${aspectRatio}`;
        }
      });
    };

    // Add hreflang for potential future international versions
    const addHreflang = () => {
      if (!document.querySelector('link[hreflang]')) {
        const hreflang = document.createElement('link');
        hreflang.rel = 'alternate';
        hreflang.hreflang = 'en-US';
        hreflang.href = `https://ebtfinder.org${location.pathname}`;
        document.head.appendChild(hreflang);
      }
    };

    // Execute all optimizations
    addSemanticMarkup();
    addOrganizationSchema();
    addWebsiteSchema();
    addHreflang();
    optimizeCoreWebVitals();
    enhanceInternalLinking();

    return () => {
      // Cleanup on unmount
      document.querySelector('#organization-schema')?.remove();
      document.querySelector('#website-schema')?.remove();
    };
  }, [location.pathname]);

  return <>{children}</>;
};
