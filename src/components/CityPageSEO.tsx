import { useEffect } from 'react';
import { SEOHead } from './SEOHead';
import { LocalBusinessSchema } from './LocalBusinessSchema';
import { BreadcrumbSchema } from './BreadcrumbSchema';

interface CityPageSEOProps {
  cityName: string;
  stateAbbr?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  storeCount?: number;
}

export const CityPageSEO: React.FC<CityPageSEOProps> = ({ 
  cityName, 
  stateAbbr, 
  coordinates,
  storeCount 
}) => {
  const formattedCityName = cityName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  const locationString = stateAbbr ? `${formattedCityName}, ${stateAbbr.toUpperCase()}` : formattedCityName;
  
  const title = `EBT Stores in ${locationString} | Find SNAP-Approved Locations`;
  const description = `Find ${storeCount || 'hundreds of'} EBT and SNAP-approved stores in ${locationString}. Search grocery stores, restaurants, farmers markets, and more accepting food stamps.`;
  const canonicalUrl = `https://ebtfinder.org/city/${cityName}`;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": `EBT Stores in ${locationString}`,
    "description": description,
    "url": canonicalUrl,
    "numberOfItems": storeCount || 0,
    "itemListElement": {
      "@type": "LocalBusiness",
      "name": `EBT Stores in ${locationString}`,
      "address": {
        "@type": "PostalAddress",
        "addressLocality": formattedCityName,
        "addressRegion": stateAbbr || "US"
      }
    }
  };

  const breadcrumbItems = [
    { name: 'Home', url: '/' },
    { name: 'Cities', url: '/cities' },
    { name: formattedCityName, url: `/city/${cityName}` }
  ];

  useEffect(() => {
    // Add city-specific schema
    const citySchema = {
      "@context": "https://schema.org",
      "@type": "Place",
      "name": locationString,
      "description": `Directory of EBT and SNAP-approved stores in ${locationString}`,
      ...(coordinates && {
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": coordinates.lat,
          "longitude": coordinates.lng
        }
      }),
      "containedInPlace": {
        "@type": "AdministrativeArea",
        "name": stateAbbr || "United States"
      }
    };

    const existingSchema = document.querySelector('#city-schema');
    if (existingSchema) {
      existingSchema.remove();
    }

    const script = document.createElement('script');
    script.id = 'city-schema';
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(citySchema);
    document.head.appendChild(script);

    return () => {
      const schemaElement = document.querySelector('#city-schema');
      if (schemaElement) {
        schemaElement.remove();
      }
    };
  }, [cityName, stateAbbr, coordinates]);

  return (
    <>
      <SEOHead
        title={title}
        description={description}
        keywords={`EBT stores ${formattedCityName}, SNAP benefits ${formattedCityName}, food stamps ${formattedCityName}, grocery stores EBT, restaurants accept EBT, ${formattedCityName} food assistance`}
        canonicalUrl={canonicalUrl}
        structuredData={structuredData}
      />
      <BreadcrumbSchema items={breadcrumbItems} />
    </>
  );
};