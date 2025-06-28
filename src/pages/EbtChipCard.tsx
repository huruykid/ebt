
import { EbtChipCardPage } from "@/components/EbtChipCardPage";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { BreadcrumbNavigation } from "@/components/BreadcrumbNavigation";
import { SEOHead } from "@/components/SEOHead";

export default function EbtChipCardPageRoute() {
  const seoTitle = "Which Stores Accept EBT Chip Cards? | EBTfinder";
  const seoDescription = "Search stores by zip code to see which locations near you accept the new EBT chip cards. Updated daily.";
  const seoKeywords = "EBT chip card, where to use EBT chip card, EBT chip card stores near me, new EBT card 2025, EBT chip card stores, EBT chip card acceptance";

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "EBT Chip Card Store Locator",
    "description": seoDescription,
    "url": "https://ebtfinder.org/ebt-chip-card",
    "mainEntity": {
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What is an EBT chip card?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "An EBT chip card is the new, more secure version of your SNAP benefits card. Instead of a magnetic stripe, it has a small computer chip that provides better protection against fraud and unauthorized use."
          }
        },
        {
          "@type": "Question",
          "name": "Why did EBT switch to chip cards?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "EBT programs switched to chip cards to improve security and reduce fraud. Chip cards are much harder to counterfeit than magnetic stripe cards."
          }
        },
        {
          "@type": "Question",
          "name": "Do all stores accept EBT chip cards yet?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Most major retailers and grocery stores now accept EBT chip cards, but some older card readers may only work with magnetic stripe cards."
          }
        }
      ]
    }
  };

  return (
    <ProtectedRoute requireAuth={false}>
      <SEOHead
        title={seoTitle}
        description={seoDescription}
        keywords={seoKeywords}
        canonicalUrl="https://ebtfinder.org/ebt-chip-card"
        structuredData={structuredData}
      />
      <BreadcrumbNavigation />
      <EbtChipCardPage />
    </ProtectedRoute>
  );
}
