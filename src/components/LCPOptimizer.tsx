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
    // Preconnect to critical third-party domains
    const preconnectDomains = [
      'https://ohkzqrqzmtzfzklbmadk.supabase.co',
      'https://www.googletagmanager.com',
      'https://www.google-analytics.com',
      'https://pagead2.googlesyndication.com',
    ];

    preconnectDomains.forEach(domain => {
      if (!document.querySelector(`link[rel="preconnect"][href="${domain}"]`)) {
        const link = document.createElement('link');
        link.rel = 'preconnect';
        link.href = domain;
        link.crossOrigin = 'anonymous';
        document.head.appendChild(link);
      }
    });

    // 2. Inline critical CSS and defer main stylesheet
    const criticalCSS = document.createElement('style');
    criticalCSS.id = 'critical-lcp-css';
    criticalCSS.textContent = `
      /* Critical above-the-fold styles */
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.5; text-rendering: optimizeSpeed; }
      .hero-section, [class*="hero"] { content-visibility: auto; contain-intrinsic-size: auto 500px; }
      img { max-width: 100%; height: auto; display: block; }
      img[loading="lazy"] { min-height: 1px; }
      @font-face { font-family: 'Inter'; font-style: normal; font-weight: 400 700; font-display: swap; src: local('Inter'), local('Inter-Regular'); }
    `;
    
    if (!document.getElementById('critical-lcp-css')) {
      document.head.appendChild(criticalCSS);
    }

    // Defer main stylesheet loading to prevent render blocking
    const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
    stylesheets.forEach(link => {
      const linkElement = link as HTMLLinkElement;
      if (!linkElement.hasAttribute('data-optimized')) {
        // Mark as processed
        linkElement.setAttribute('data-optimized', 'true');
        
        // Create preload link
        const preloadLink = document.createElement('link');
        preloadLink.rel = 'preload';
        preloadLink.as = 'style';
        preloadLink.href = linkElement.href;
        
        // Insert preload before the stylesheet
        linkElement.parentNode?.insertBefore(preloadLink, linkElement);
        
        // Load stylesheet asynchronously
        linkElement.media = 'print';
        linkElement.onload = () => {
          linkElement.media = 'all';
        };
      }
    });

    // 3. Prioritize hero image loading for faster FCP
    const optimizeHeroImage = () => {
      const heroImage = document.querySelector('img[src*="lovable-uploads"]') as HTMLImageElement;
      if (heroImage) {
        heroImage.setAttribute('fetchpriority', 'high');
        heroImage.removeAttribute('loading');
        
        // Add responsive image sizes
        if (!heroImage.hasAttribute('sizes')) {
          heroImage.setAttribute('sizes', '(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 50vw');
        }
      }
    };
    
    // Run immediately for faster FCP
    if (document.readyState === 'complete') {
      optimizeHeroImage();
    } else {
      window.addEventListener('DOMContentLoaded', optimizeHeroImage, { once: true });
    }

    // 4. Optimize other images with fetchpriority for LCP
    requestIdleCallback(() => {
      const images = document.querySelectorAll('img');
      const viewportHeight = window.innerHeight;
      
      images.forEach(img => {
        const rect = img.getBoundingClientRect();
        const isAboveFold = rect.top < viewportHeight;
        
        if (isAboveFold && !img.getAttribute('fetchpriority')) {
          img.setAttribute('fetchpriority', 'high');
          img.removeAttribute('loading');
        } else if (!isAboveFold && !img.getAttribute('loading')) {
          img.setAttribute('loading', 'lazy');
        }
      });
    }, { timeout: 1000 });

    // 5. Defer non-critical third-party scripts
    const deferScripts = () => {
      requestIdleCallback(() => {
        // Google Analytics - defer until idle
        const scripts = document.querySelectorAll('script[src*="googletagmanager"], script[src*="google-analytics"], script[src*="googlesyndication"]');
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
