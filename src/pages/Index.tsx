import ExploreTrending from "@/components/ExploreTrending";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { SEOHead } from "@/components/SEOHead";
import { FAQSchema } from "@/components/FAQSchema";
import { HowItWorksSection } from "@/components/HowItWorksSection";
import { StoreTypesSection } from "@/components/StoreTypesSection";
import { TrustSignalsSection } from "@/components/TrustSignalsSection";
import { PopularSearchesSection } from "@/components/PopularSearchesSection";

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
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "15000",
      "bestRating": "5"
    }
  };

  const faqs = [
    {
      question: "What is EBT Finder?",
      answer: "EBT Finder is a free service that helps you locate stores, restaurants, and markets that accept EBT and SNAP benefits near you. We have over 300,000 locations nationwide."
    },
    {
      question: "How do I find stores that accept EBT near me?",
      answer: "Simply enter your location, ZIP code, or city in the search bar. Our map will show all nearby stores that accept EBT and SNAP benefits, including grocery stores, farmers markets, and restaurants participating in the Restaurant Meals Program."
    },
    {
      question: "What types of stores accept EBT?",
      answer: "Most grocery stores, supermarkets, convenience stores, and farmers markets accept EBT. Some restaurants also accept EBT through the Restaurant Meals Program (RMP) if you qualify."
    },
    {
      question: "Is EBT Finder really free?",
      answer: "Yes, EBT Finder is completely free to use. There are no hidden fees, subscriptions, or charges. Our mission is to help SNAP recipients easily find places to use their benefits."
    },
    {
      question: "How accurate is the store information?",
      answer: "We continuously update our database with official USDA data and user contributions. Our information is regularly verified to ensure accuracy, though we recommend calling ahead for specific store details."
    }
  ];

  return (
    <ProtectedRoute requireAuth={false}>
      <SEOHead
        title="Find EBT & SNAP Stores Near You - 300,000+ Locations | EBT Finder"
        description="Find stores, restaurants, and markets that accept EBT and SNAP benefits near you. Search 300,000+ locations nationwide. Free, accurate, and updated daily."
        keywords="EBT stores near me, SNAP benefits, food stamps, EBT accepted here, grocery stores EBT, RMP restaurants, farmers markets EBT, food assistance"
        canonicalUrl="https://ebtfinder.org"
        structuredData={structuredData}
      />
      <FAQSchema faqs={faqs} />
      <ExploreTrending />
      <TrustSignalsSection />
      <HowItWorksSection />
      <StoreTypesSection />
      <PopularSearchesSection />
    </ProtectedRoute>
  );
}
