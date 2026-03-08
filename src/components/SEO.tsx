import { useEffect, memo } from 'react';

interface SEOProps {
  children?: React.ReactNode;
}

/**
 * Consolidated SEO component that handles:
 * - Resource hints (dns-prefetch for deferred domains)
 * - Accessibility (skip links)
 * 
 * Static schemas (Organization, WebSite) and meta tags (robots, author, theme-color, etc.)
 * are defined in index.html to avoid duplicate DOM injection.
 * Page-specific schemas use SEOHead and FAQSchema components.
 */
export const SEO = memo<SEOProps>(({ children }) => {
  useEffect(() => {
    // === DNS PREFETCH (not in index.html) ===
    const href = 'https://www.google-analytics.com';
    if (!document.querySelector(`link[rel="dns-prefetch"][href="${href}"]`)) {
      const link = document.createElement('link');
      link.rel = 'dns-prefetch';
      link.href = href;
      document.head.appendChild(link);
    }

    // === SKIP LINK FOR ACCESSIBILITY ===
    if (!document.querySelector('.skip-to-content')) {
      const skipLink = document.createElement('a');
      skipLink.href = '#main-content';
      skipLink.className = 'skip-to-content sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded';
      skipLink.textContent = 'Skip to main content';
      document.body.insertBefore(skipLink, document.body.firstChild);
    }
  }, []);

  return <>{children}</>;
});

SEO.displayName = 'SEO';
