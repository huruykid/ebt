
import ExploreTrending from "@/components/ExploreTrending";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { SEOHead } from "@/components/SEOHead";

export default function Index() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "EBT Finder",
    "url": "https://ebtfinder.org",
    "description": "Find stores, restaurants, and markets that accept EBT and SNAP benefits near you",
    "applicationCategory": "Utility",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "potentialAction": [
      {
        "@type": "SearchAction",
        "target": "https://ebtfinder.org/search?q={search_term_string}",
        "query-input": "required name=search_term_string"
      },
      {
        "@type": "FindAction",
        "target": "https://ebtfinder.org/search?location={location}",
        "query-input": "required name=location"
      }
    ],
    "audience": {
      "@type": "Audience",
      "audienceType": "SNAP/EBT Recipients"
    },
    "serviceArea": {
      "@type": "Country",
      "name": "United States"
    }
  };

  return (
    <ProtectedRoute requireAuth={false}>
      <SEOHead
        title="Find EBT & SNAP-Approved Stores Near You | EBT Finder"
        description="Easily find stores, restaurants, and markets that accept EBT and SNAP benefits. Filter by ZIP code, store type, or hot meal eligibility. Mobile-friendly and free."
        keywords="EBT stores, SNAP benefits, find EBT near me, ZIP code search, hot food program, RMP restaurants, grocery stores EBT"
        canonicalUrl="https://ebtfinder.org"
        structuredData={structuredData}
      />
      <ExploreTrending />
    </ProtectedRoute>
  );
}
