
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

declare global {
  interface Window {
    gtag: (command: string, targetId: string | Date, config?: any) => void;
  }
}

interface GoogleAnalyticsProps {
  measurementId: string;
}

export const GoogleAnalytics: React.FC<GoogleAnalyticsProps> = ({ measurementId }) => {
  const location = useLocation();

  useEffect(() => {
    // Defer GA loading until after page is interactive
    const loadGA = () => {
      // Validate and sanitize measurementId to prevent XSS
      const sanitizedId = measurementId.replace(/[^A-Z0-9-]/gi, '');
      if (!sanitizedId || !sanitizedId.match(/^G-[A-Z0-9]+$/)) {
        console.error('Invalid Google Analytics measurement ID:', measurementId);
        return;
      }

      // Load Google Analytics script safely
      const script1 = document.createElement('script');
      script1.async = true;
      script1.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(sanitizedId)}`;
      document.head.appendChild(script1);

      // Initialize gtag safely using DOM manipulation instead of innerHTML
      const script2 = document.createElement('script');
      script2.textContent = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${sanitizedId}');
      `;
      document.head.appendChild(script2);
    };

    // Use requestIdleCallback to defer GA loading
    if ('requestIdleCallback' in window) {
      requestIdleCallback(loadGA, { timeout: 2000 });
    } else {
      setTimeout(loadGA, 2000);
    }
  }, [measurementId]);

  // Track page views when route changes
  useEffect(() => {
    if (typeof window.gtag !== 'undefined') {
      const sanitizedId = measurementId.replace(/[^A-Z0-9-]/gi, '');
      if (sanitizedId && sanitizedId.match(/^G-[A-Z0-9]+$/)) {
        window.gtag('config', sanitizedId, {
          page_path: location.pathname + location.search,
        });
      }
    }
  }, [location, measurementId]);

  return null;
};
