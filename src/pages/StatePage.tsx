import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { SearchContainer } from '@/components/store-search/SearchContainer';
import { SEOFooter } from '@/components/SEOFooter';
import { FAQSection } from '@/components/FAQSection';
import { SEOHead } from '@/components/SEOHead';
import { BreadcrumbSchema } from '@/components/BreadcrumbSchema';
import { BreadcrumbNavigation } from '@/components/BreadcrumbNavigation';
import { MapPin, Store, ChevronRight } from 'lucide-react';
import { stateData, getCitiesForState } from '@/constants/stateData';

const StatePage: React.FC = () => {
  const { stateSlug } = useParams<{ stateSlug: string }>();
  const state = stateSlug && stateData[stateSlug] ? stateData[stateSlug] : null;

  if (!state) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">State Not Found</h1>
          <p className="text-muted-foreground">The state page you're looking for doesn't exist.</p>
          <Link to="/" className="text-primary hover:underline mt-4 inline-block">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  const cities = getCitiesForState(state.abbr);
  
  // Generate SEO data
  const seoTitle = `EBT Stores in ${state.name} | SNAP Retailers & Grocery Stores`;
  const seoDescription = `Find ${state.storeCount.toLocaleString()}+ EBT and SNAP-accepting stores in ${state.name}. ${state.rmpParticipating ? 'Restaurant Meals Program (RMP) available.' : ''} Search grocery stores, farmers markets, and retailers near you.`;
  const seoKeywords = `EBT stores ${state.name}, SNAP benefits ${state.abbr}, ${state.name} grocery stores EBT, food stamps ${state.name}, ${state.rmpParticipating ? 'RMP restaurants ' + state.name : ''}, EBT accepted ${state.abbr}`;
  const canonicalUrl = `https://ebtfinder.org/state/${stateSlug}`;

  // Breadcrumb data for SEO
  const breadcrumbItems = [
    { name: 'Home', url: '/' },
    { name: state.name, url: `/state/${stateSlug}` }
  ];

  // Enhanced structured data
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": seoTitle,
    "description": seoDescription,
    "url": canonicalUrl,
    "isPartOf": {
      "@type": "WebSite",
      "name": "EBT Finder",
      "url": "https://ebtfinder.org"
    },
    "about": {
      "@type": "State",
      "name": state.name,
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": state.lat,
        "longitude": state.lng
      }
    },
    "mainEntity": {
      "@type": "ItemList",
      "name": `EBT Stores in ${state.name}`,
      "description": `Directory of ${state.storeCount.toLocaleString()} stores accepting EBT and SNAP benefits in ${state.name}`,
      "numberOfItems": state.storeCount
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
      
      <BreadcrumbSchema items={breadcrumbItems} />
      
      <div className="min-h-screen bg-background">
        <BreadcrumbNavigation />

        {/* State Hero Section */}
        <div className="bg-gradient-to-br from-primary/5 to-secondary/10 border-b">
          <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-4xl font-bold text-foreground mb-4">
                EBT-Accepting Stores in {state.name}
              </h1>
              
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full mb-6">
                <MapPin className="h-4 w-4" />
                <span className="font-medium">{state.name} ({state.abbr})</span>
              </div>
              
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                {state.description}
              </p>

              {/* Stats */}
              <div className="flex flex-wrap justify-center gap-6 mb-8">
                <div className="bg-card rounded-lg px-6 py-4 shadow-sm border">
                  <div className="text-3xl font-bold text-primary">{state.storeCount.toLocaleString()}+</div>
                  <div className="text-sm text-muted-foreground">SNAP Retailers</div>
                </div>
                {state.rmpParticipating && (
                  <div className="bg-card rounded-lg px-6 py-4 shadow-sm border">
                    <div className="text-3xl font-bold text-green-600">✓</div>
                    <div className="text-sm text-muted-foreground">RMP Available</div>
                  </div>
                )}
                <div className="bg-card rounded-lg px-6 py-4 shadow-sm border">
                  <div className="text-3xl font-bold text-primary">{cities.length}</div>
                  <div className="text-sm text-muted-foreground">Major Cities</div>
                </div>
              </div>
              
              {/* RMP Info */}
              {state.rmpParticipating && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-8">
                  <p className="text-green-800 dark:text-green-200">
                    <strong>Restaurant Meals Program (RMP):</strong> {state.name} participates in RMP, 
                    allowing eligible seniors, disabled individuals, and homeless EBT users to purchase 
                    hot prepared meals at participating restaurants.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Popular Cities Section */}
        {cities.length > 0 && (
          <div className="bg-card border-b">
            <div className="max-w-7xl mx-auto px-6 py-8">
              <h2 className="text-2xl font-semibold mb-6">Popular Cities in {state.name}</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {cities.slice(0, 12).map((city) => (
                  <Link
                    key={city.slug}
                    to={`/city/${city.slug}`}
                    className="flex items-center justify-between p-3 bg-background rounded-lg border hover:border-primary transition-colors group"
                  >
                    <span className="font-medium text-foreground group-hover:text-primary">
                      {city.name}
                    </span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                  </Link>
                ))}
              </div>
              {cities.length > 12 && (
                <p className="text-muted-foreground text-sm mt-4 text-center">
                  +{cities.length - 12} more cities
                </p>
              )}
            </div>
          </div>
        )}

        {/* Stores Banner */}
        <div className="bg-primary/5 border-b">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-center gap-3">
              <Store className="h-5 w-5 text-primary" />
              <span className="font-medium text-foreground">
                Find EBT stores anywhere in {state.name}
              </span>
            </div>
          </div>
        </div>

        {/* Search Container */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <SearchContainer 
            initialLocation={{ lat: state.lat, lng: state.lng }}
          />
        </div>

        <FAQSection />
        <SEOFooter />
      </div>
    </ProtectedRoute>
  );
};

export default StatePage;
