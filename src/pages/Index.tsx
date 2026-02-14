
import ExploreTrending from "@/components/ExploreTrending";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { SEOHead } from "@/components/SEOHead";
import { FAQSchema } from "@/components/FAQSchema";
import { BreadcrumbSchema } from "@/components/BreadcrumbSchema";

export default function Index() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "EBT Finder",
    "url": "https://ebtfinder.org",
    "description": "Find 300,000+ stores, restaurants, and markets that accept EBT and SNAP benefits near you",
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "potentialAction": [
      {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": "https://ebtfinder.org/search?q={search_term_string}"
        },
        "query-input": "required name=search_term_string"
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

  const breadcrumbItems = [
    { name: "Home", url: "/" }
  ];

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
    },
    {
      question: "Can I use EBT at restaurants?",
      answer: "Yes, some restaurants accept EBT through the Restaurant Meals Program (RMP). This program is available for elderly, disabled, or homeless SNAP recipients in participating states. Use EBT Finder to find RMP-eligible restaurants near you."
    },
    {
      question: "Does EBT Finder work in all states?",
      answer: "Yes, EBT Finder covers all 50 US states plus Washington D.C. Our database includes over 300,000 SNAP-authorized retailers from the official USDA data."
    }
  ];

  return (
    <ProtectedRoute requireAuth={false}>
      <SEOHead
        title="Find EBT & SNAP Stores Near You — 300,000+ Locations | EBT Finder"
        description="Find 300,000+ grocery stores, restaurants, and farmers markets that accept EBT and SNAP benefits near you. Search by ZIP code, filter by store type, read community reviews. Free and updated daily."
        keywords="EBT stores near me, SNAP benefits, food stamps, EBT accepted here, grocery stores EBT, RMP restaurants, farmers markets EBT, food assistance, SNAP store locator, EBT balance"
        canonicalUrl="https://ebtfinder.org"
        ogImage="https://ebtfinder.org/og-image.png"
        structuredData={structuredData}
      />
      <FAQSchema faqs={faqs} />
      <BreadcrumbSchema items={breadcrumbItems} />
      <ExploreTrending />
    </ProtectedRoute>
  );
}
