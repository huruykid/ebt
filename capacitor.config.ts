import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.ea3d25cbbd9c4c289d877cb37296c68e',
  appName: 'EBT Finder',
  webDir: 'dist',
  server: {
    // Live reload from Lovable sandbox while developing on device/emulator
    url: 'https://ea3d25cb-bd9c-4c28-9d87-7cb37296c68e.lovableproject.com?forceHideBadge=true',
    cleartext: true,
  },
  plugins: {
    Geolocation: {
      requestPermissions: true,
    }
  },
  ios: {
    contentInset: 'automatic',
  }
};

export default config;
