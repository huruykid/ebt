
import { useState, useEffect } from 'react';
import type { LocationSearch } from '@/types/storeSearchTypes';

export const useLocationSearch = () => {
  const [locationSearch, setLocationSearch] = useState<LocationSearch | null>(null);
  const [userZipCode, setUserZipCode] = useState<string | null>(null);

  useEffect(() => {
    if (locationSearch && !userZipCode) {
      const getZipCodeFromCoordinates = async (lat: number, lng: number) => {
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
          );
          const data = await response.json();
          const zipCode = data.address?.postcode;
          if (zipCode) {
            setUserZipCode(zipCode);
          }
        } catch (error) {
          console.error('Error getting zip code:', error);
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
