import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * LCPOptimizer - Optimizes Largest Contentful Paint by:
 * 1. Preloading critical resources
 * 2. Adding resource hints for external domains
 * 3. Optimizing font loading
 * 4. Deferring non-critical scripts
 */
export const LCPOptimizer = () => {
  const location = useLocation();

  useEffect(() => {
    // Only run optimizations once on mount
    if (document.getElementById('lcp-optimizations')) return;

    const container = document.createElement('div');
    container.id = 'lcp-optimizations';
    container.style.display = 'none';

    // 1. Preconnect to critical external domains
    const criticalDomains = [
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com',
    ];

    criticalDomains.forEach(domain => {
      if (!document.querySelector(`link[rel="preconnect"][href="${domain}"]`)) {
        const link = document.createElement('link');
        link.rel = 'preconnect';
        link.href = domain;
        link.crossOrigin = 'anonymous';
        document.head.appendChild(link);
      }
    });

    // 2. Preload critical CSS (inline to avoid render-blocking)
    const criticalCSS = document.createElement('style');
    criticalCSS.id = 'critical-lcp-css';
    criticalCSS.textContent = `
      /* Critical above-the-fold styles */
      .hero-section, [class*="hero"] {
        content-visibility: auto;
        contain-intrinsic-size: auto 500px;
      }
      
      /* Optimize font loading */
      @font-face {
        font-family: 'Inter';
        font-style: normal;
        font-weight: 400 700;
        font-display: swap;
        src: local('Inter'), local('Inter-Regular');
      }
      
      /* Prevent layout shift for images */
      img[loading="lazy"] {
        min-height: 1px;
      }
      
      /* Optimize initial render */
      body {
        text-rendering: optimizeSpeed;
      }
    `;
    
    if (!document.getElementById('critical-lcp-css')) {
      document.head.appendChild(criticalCSS);
    }

    // 3. Optimize images with fetchpriority for LCP
    requestIdleCallback(() => {
      const images = document.querySelectorAll('img');
      const viewportHeight = window.innerHeight;
      
      images.forEach(img => {
        const rect = img.getBoundingClientRect();
        const isAboveFold = rect.top < viewportHeight;
        
        if (isAboveFold && !img.getAttribute('fetchpriority')) {
          img.setAttribute('fetchpriority', 'high');
          img.removeAttribute('loading'); // Remove lazy loading from above-fold images
        } else if (!isAboveFold && !img.getAttribute('loading')) {
          img.setAttribute('loading', 'lazy');
        }
      });
    }, { timeout: 1000 });

    // 4. Defer non-critical third-party scripts
    const deferScripts = () => {
      requestIdleCallback(() => {
        // Google Analytics - defer until idle
        const scripts = document.querySelectorAll('script[src*="googletagmanager"], script[src*="google-analytics"]');
        scripts.forEach(script => {
          if (!script.hasAttribute('defer') && !script.hasAttribute('async')) {
            script.setAttribute('defer', 'true');
          }
        });
      }, { timeout: 3000 });
    };

    // Run after initial render
    if (document.readyState === 'complete') {
      deferScripts();
    } else {
      window.addEventListener('load', deferScripts, { once: true });
    }

    // 5. Add preload hint for potential LCP images on homepage
    if (location.pathname === '/') {
      const preloadHint = document.createElement('link');
      preloadHint.rel = 'preload';
      preloadHint.as = 'image';
      preloadHint.href = '/lovable-uploads/e67ca403-7d95-4937-99e0-b6a0c646f9cb.png';
      preloadHint.setAttribute('fetchpriority', 'high');
      
      if (!document.querySelector(`link[href="${preloadHint.href}"]`)) {
        document.head.appendChild(preloadHint);
      }
    }

    return () => {
      // Cleanup is minimal since these are head elements
      document.getElementById('critical-lcp-css')?.remove();
    };
  }, [location.pathname]);

  return null;
};
