import { useEffect } from 'react';

interface LocalBusinessSchemaProps {
  storeName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  latitude?: number;
  longitude?: number;
  phoneNumber?: string;
  website?: string;
  rating?: number;
  ratingCount?: number;
  storeType?: string;
  openingHours?: any;
}

export const LocalBusinessSchema: React.FC<LocalBusinessSchemaProps> = ({
  storeName,
  address,
  city,
  state,
  zipCode,
  latitude,
  longitude,
  phoneNumber,
  website,
  rating,
  ratingCount,
  storeType,
  openingHours
}) => {
  useEffect(() => {
    const schemaData = {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "name": storeName,
      "address": {
        "@type": "PostalAddress",
        "streetAddress": address,
        "addressLocality": city,
        "addressRegion": state,
        "postalCode": zipCode,
        "addressCountry": "US"
      },
      "url": website || `https://ebtfinder.org/store/${storeName.toLowerCase().replace(/\s+/g, '-')}`,
      "description": `${storeName} accepts EBT and SNAP benefits. Find store hours, location, and more information about this ${storeType || 'store'} in ${city}, ${state}.`,
      "paymentAccepted": ["EBT", "SNAP", "Food Stamps"],
      "priceRange": "$",
      ...(latitude && longitude && {
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": latitude,
          "longitude": longitude
        }
      }),
      ...(phoneNumber && { "telephone": phoneNumber }),
      ...(rating && ratingCount && {
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": rating,
          "reviewCount": ratingCount,
          "bestRating": 5,
          "worstRating": 1
        }
      }),
      ...(openingHours && {
        "openingHours": Object.entries(openingHours).map(([day, hours]: [string, any]) => {
          if (hours.closed) return null;
          const dayMap: { [key: string]: string } = {
            'monday': 'Mo',
            'tuesday': 'Tu', 
            'wednesday': 'We',
            'thursday': 'Th',
            'friday': 'Fr',
            'saturday': 'Sa',
            'sunday': 'Su'
          };
          return `${dayMap[day.toLowerCase()]} ${hours.open}-${hours.close}`;
        }).filter(Boolean)
      })
    };

    // Remove existing schema
    const existingSchema = document.querySelector('#local-business-schema');
    if (existingSchema) {
      existingSchema.remove();
    }

    // Add new schema
    const script = document.createElement('script');
    script.id = 'local-business-schema';
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schemaData);
    document.head.appendChild(script);

    return () => {
      const schemaElement = document.querySelector('#local-business-schema');
      if (schemaElement) {
        schemaElement.remove();
      }
    };
  }, [storeName, address, city, state, zipCode, latitude, longitude, phoneNumber, website, rating, ratingCount, storeType, openingHours]);

  return null;
};