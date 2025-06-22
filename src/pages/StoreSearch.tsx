
import { StoreSearch } from "@/components/StoreSearch";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { BreadcrumbNavigation } from "@/components/BreadcrumbNavigation";
import { SEOHead } from "@/components/SEOHead";

export default function StoreSearchPage() {
  const seoTitle = "Find EBT & SNAP Stores Near You | Store Search | EBT Finder";
  const seoDescription = "Search for EBT and SNAP-accepting stores by location, ZIP code, or store type. Find grocery stores, restaurants, and markets that accept food benefits near you.";
  const seoKeywords = "EBT store search, SNAP store locator, find EBT near me, food assistance stores, grocery stores EBT";

  return (
    <ProtectedRoute requireAuth={false}>
      <SEOHead
        title={seoTitle}
        description={seoDescription}
        keywords={seoKeywords}
        canonicalUrl="https://ebtfinder.org/search"
      />
      <BreadcrumbNavigation />
      <StoreSearch />
    </ProtectedRoute>
  );
}
