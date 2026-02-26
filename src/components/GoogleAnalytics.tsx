
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useIPGeolocation } from '@/hooks/useIPGeolocation';

declare global {
  interface Window {
    gtag: (command: string, targetId: string | Date, config?: any) => void;
  }
}

interface GoogleAnalyticsProps {
  measurementId: string;
}

const ADSENSE_CLIENT_ID = 'ca-pub-2620004731463756';

/** Schedule a callback after the page is interactive */
const deferUntilIdle = (fn: () => void) => {
  if (typeof window === 'undefined') return;
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback!(() => fn(), { timeout: 4000 });
  } else {
    setTimeout(fn, 3000);
  }
};

export const GoogleAnalytics: React.FC<GoogleAnalyticsProps> = ({ measurementId }) => {
  const location = useLocation();
  const initialized = useRef(false);
  const { data: ipGeo, loading: ipLoading } = useIPGeolocation();

  useEffect(() => {
    if (initialized.current || ipLoading) return;

    // Block analytics for non-US visitors to filter bot traffic
    const countryCode = ipGeo?.countryCode || '';
    if (countryCode && countryCode !== 'US') {
      console.debug('[Analytics] Skipping GA/AdSense for non-US visitor:', countryCode);
      return;
    }

    initialized.current = true;

    // Validate measurementId
    const sanitizedId = measurementId.replace(/[^A-Z0-9-]/gi, '');
    if (!sanitizedId || !sanitizedId.match(/^G-[A-Z0-9]+$/)) {
      console.error('Invalid Google Analytics measurement ID:', measurementId);
      return;
    }

    // Defer all third-party script loading
    deferUntilIdle(() => {
      // --- Google Tag Manager / Analytics ---
      const script1 = document.createElement('script');
      script1.async = true;
      script1.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(sanitizedId)}`;
      document.head.appendChild(script1);

      const script2 = document.createElement('script');
      script2.textContent = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${sanitizedId}');
      `;
      document.head.appendChild(script2);

      // --- Google AdSense (deferred) ---
      const adsenseScript = document.createElement('script');
      adsenseScript.async = true;
      adsenseScript.crossOrigin = 'anonymous';
      adsenseScript.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`;
      document.head.appendChild(adsenseScript);
    });
  }, [measurementId, ipGeo, ipLoading]);

  // Track page views when route changes (only if GA was initialized)
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
