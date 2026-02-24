
import React, { useEffect } from 'react';
import { useParams, useLocation, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { SearchContainer } from '@/components/store-search/SearchContainer';
import { SEOFooter } from '@/components/SEOFooter';
import { CityFAQSection } from '@/components/CityFAQSection';
import { SEOHead } from '@/components/SEOHead';
import { BreadcrumbSchema } from '@/components/BreadcrumbSchema';
import { BreadcrumbNavigation } from '@/components/BreadcrumbNavigation';
import { MapPin, Store } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cityData, getCityBySlug } from '@/constants/cityData';
import { stateData } from '@/constants/stateData';

const CityPage: React.FC = () => {
  const { citySlug } = useParams<{ citySlug: string }>();
  const location = useLocation();
  
  // Extract city slug - handle both /city/:citySlug and legacy /:citySlug routes
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const isLegacyRoute = pathSegments.length === 1 && pathSegments[0] !== 'city';
  const actualCitySlug = citySlug || (pathSegments[0] === 'city' ? pathSegments[1] : pathSegments[0]);
  const city = actualCitySlug && cityData[actualCitySlug] ? cityData[actualCitySlug] : null;

  // Redirect legacy routes to canonical /city/ URLs (fixes "Alternate page with proper canonical tag")
  if (isLegacyRoute && city) {
    return <Navigate to={`/city/${actualCitySlug}`} replace />;
  }

  // If city not found, redirect to 404 (fixes "Soft 404" issue)
  if (!city) {
    return <Navigate to="/not-found" replace />;
  }

  // Generate SEO data - use /city/ prefix for canonical URLs
  const seoTitle = `EBT Stores in ${city.name}, ${city.state} — Find Places That Accept EBT Near You`;
  const seoDescription = `Find all grocery stores, restaurants, and markets that accept EBT in ${city.name}, ${city.state}. Search by ZIP (${city.zipCodes.slice(0, 3).join(', ')}+), see hours, and get directions. Free and updated daily.`;
  const seoKeywords = `EBT stores ${city.name}, places that accept EBT ${city.name}, EBT near me ${city.name}, SNAP stores ${city.state}, ${city.name} grocery stores EBT, restaurants accept EBT ${city.name}, ${city.zipCodes.slice(0, 3).join(' ')}`;
  const canonicalUrl = `https://ebtfinder.org/city/${actualCitySlug}`;

  // Resolve state slug for internal linking
  const stateSlug = Object.keys(stateData).find(k => stateData[k].abbr === city.state);
  const stateName = stateSlug ? stateData[stateSlug].name : city.state;

  // Breadcrumb data for SEO: Home > State > City
  const breadcrumbItems = [
    { name: 'Home', url: '/' },
    ...(stateSlug ? [{ name: stateName, url: `/state/${stateSlug}` }] : []),
    { name: city.name, url: `/city/${actualCitySlug}` }
  ];

  // Enhanced structured data for city page
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": seoTitle,
    "description": seoDescription,
    "url": canonicalUrl,
    "isPartOf": {
      "@type": "WebSite",
      "name": "EBT Finder",
      "url": "https://ebtfinder.org"
    },
    "about": {
      "@type": "Place",
      "name": `${city.name}, ${city.state}`,
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": city.lat,
        "longitude": city.lng
      },
      "address": {
        "@type": "PostalAddress",
        "addressLocality": city.name,
        "addressRegion": city.state,
        "addressCountry": "US"
      }
    },
    "mainEntity": {
      "@type": "ItemList",
      "name": `EBT Stores in ${city.name}`,
      "description": `Directory of stores accepting EBT and SNAP benefits in ${city.name}, ${city.state}`,
      "numberOfItems": city.zipCodes.length
    }
  };

  return (
    <ProtectedRoute requireAuth={false}>
      <SEOHead
        title={seoTitle}
        description={seoDescription}
        keywords={seoKeywords}
        canonicalUrl={canonicalUrl}
        structuredData={structuredData}
      />
      
      {/* Enhanced SEO Schema Component */}
      <BreadcrumbSchema items={breadcrumbItems} />
      
      <div className="min-h-screen bg-background">
        {/* Breadcrumb Navigation */}
        <BreadcrumbNavigation items={[
          { label: 'Home', href: '/' },
          ...(stateSlug ? [{ label: stateName, href: `/state/${stateSlug}` }] : []),
          { label: city.name, href: `/city/${actualCitySlug}` }
        ]} />

        {/* City Hero Section */}
        <div className="bg-gradient-to-br from-primary/5 to-secondary/10 border-b">
          <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-4xl font-bold text-foreground mb-4">
                Find EBT-Accepting Stores in {city.name}
              </h1>
              
              {/* Location indicator */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full mb-6">
                <MapPin className="h-4 w-4" />
                <span className="font-medium">
                  {city.name},{' '}
                  {stateSlug ? (
                    <Link to={`/state/${stateSlug}`} className="hover:underline">{city.state}</Link>
                  ) : city.state}
                </span>
              </div>
              
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                {city.description}
              </p>
              
              {/* ZIP Codes Section */}
              <div className="bg-card rounded-lg p-6 shadow-sm border mb-8">
                <h2 className="text-xl font-semibold mb-4">Popular ZIP Codes in {city.name}, {city.state}</h2>
                <div className="flex flex-wrap gap-2 justify-center">
                  {city.zipCodes.slice(0, 15).map((zip) => (
                    <span key={zip} className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                      {zip}
                    </span>
                  ))}
                  {city.zipCodes.length > 15 && (
                    <span className="text-muted-foreground text-sm px-3 py-1">
                      +{city.zipCodes.length - 15} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stores Near You Banner */}
        <div className="bg-primary/5 border-b">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-center gap-3">
              <Store className="h-5 w-5 text-primary" />
              <span className="font-medium text-foreground">
                Showing EBT stores near {city.name}, {city.state}
              </span>
            </div>
          </div>
        </div>

        {/* Search Results - Pass coordinates for auto-search */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <SearchContainer 
            initialCity={city.name} 
            initialLocation={{ lat: city.lat, lng: city.lng }}
          />
        </div>

        {/* City-Specific FAQ Section with Schema */}
        <CityFAQSection cityName={city.name} stateName={city.state} />

        {/* SEO Footer */}
        <SEOFooter />
      </div>
    </ProtectedRoute>
  );
};

export default CityPage;
