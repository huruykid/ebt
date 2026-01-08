import { useState, useEffect } from 'react';
import { Globe, MapPin, Info } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export const GeoBlockingOverlay = () => {
  const [isBlocked, setIsBlocked] = useState(false);
  const [countryName, setCountryName] = useState('');
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkLocation = async () => {
      try {
        // Check if user already dismissed (session storage)
        const dismissed = sessionStorage.getItem('geo-block-dismissed');
        if (dismissed) {
          setIsChecking(false);
          return;
        }

        const { data, error } = await supabase.functions.invoke('ip-geolocation');
        
        if (error) {
          console.error('Geo check error:', error);
          setIsChecking(false);
          return;
        }

        // Check if country code is not US (and not empty/fallback)
        const countryCode = data?.countryCode || '';
        if (countryCode && countryCode !== 'US') {
          setIsBlocked(true);
          setCountryName(data?.country || 'your country');
        }
      } catch (err) {
        console.error('Geo blocking check failed:', err);
      } finally {
        setIsChecking(false);
      }
    };

    checkLocation();
  }, []);

  // Don't render anything while checking or if not blocked
  if (isChecking || !isBlocked) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-background/95 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-card rounded-2xl shadow-2xl border border-border p-8 text-center">
        {/* Icon */}
        <div className="w-20 h-20 mx-auto mb-6 bg-primary/10 rounded-full flex items-center justify-center">
          <Globe className="w-10 h-10 text-primary" />
        </div>

        {/* Heading */}
        <h1 className="text-2xl font-bold text-foreground mb-3">
          Service Not Available
        </h1>

        {/* Message */}
        <p className="text-muted-foreground mb-6 leading-relaxed">
          EBT Near Me helps people find stores that accept <strong>SNAP/EBT benefits</strong> — 
          a food assistance program available only in the <strong>United States</strong>.
        </p>

        {/* Location info */}
        <div className="bg-muted/50 rounded-lg p-4 mb-6 flex items-center gap-3">
          <MapPin className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          <p className="text-sm text-muted-foreground text-left">
            It looks like you're visiting from <strong className="text-foreground">{countryName}</strong>. 
            This service is only available to users in the United States.
          </p>
        </div>

        {/* Info box */}
        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-800 dark:text-blue-200 text-left">
              <strong>What is SNAP/EBT?</strong><br />
              The Supplemental Nutrition Assistance Program (SNAP) provides food benefits 
              to low-income families in the U.S. via Electronic Benefit Transfer (EBT) cards.
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-xs text-muted-foreground">
          If you believe you're seeing this message in error, please try using a VPN 
          with a U.S. server or contact support.
        </p>
      </div>
    </div>
  );
};
