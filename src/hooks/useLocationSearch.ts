
import { useState, useEffect } from 'react';
import type { LocationSearch } from '@/types/storeSearchTypes';

export const useLocationSearch = () => {
  const [locationSearch, setLocationSearch] = useState<LocationSearch | null>(null);
  const [userZipCode, setUserZipCode] = useState<string | null>(null);

  // Get user's zip code from their location
  useEffect(() => {
    if (locationSearch && !userZipCode) {
      const getZipCodeFromCoordinates = async (lat: number, lng: number) => {
        try {
          console.log('🔍 Getting zip code for coordinates:', { lat, lng });
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
          );
          const data = await response.json();
          const zipCode = data.address?.postcode;
          if (zipCode) {
            console.log('📮 Found user zip code:', zipCode);
            setUserZipCode(zipCode);
          } else {
            console.log('⚠️ No zip code found in geocoding response');
          }
        } catch (error) {
          console.error('❌ Error getting zip code:', error);
        }
      };

      getZipCodeFromCoordinates(locationSearch.lat, locationSearch.lng);
    }
  }, [locationSearch, userZipCode]);

  return {
    locationSearch,
    setLocationSearch,
    userZipCode
  };
};
