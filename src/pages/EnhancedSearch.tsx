import React from 'react';
import { SEOHead } from '@/components/SEOHead';
import { BreadcrumbNavigation } from '@/components/BreadcrumbNavigation';
import { EnhancedSearchBar } from '@/components/EnhancedSearchBar';
import { EnhancedSearchResults } from '@/components/EnhancedSearchResults';
import { MobileSearchInterface } from '@/components/MobileSearchInterface';
import { useIsMobile } from '@/hooks/use-mobile';
import { useEnhancedSearch } from '@/hooks/useEnhancedSearch';

export const EnhancedSearch: React.FC = () => {
  const isMobile = useIsMobile();
  const {
    searchResults,
    isLoading,
    error
  } = useEnhancedSearch();

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Search Stores', href: '/search' }
  ];

  if (isMobile) {
    return (
      <>
        <SEOHead
          title="Find EBT/SNAP Stores Near You"
          description="Search for stores that accept EBT/SNAP benefits. Find grocery stores, restaurants, and retailers near you that accept food stamps."
          keywords="EBT stores, SNAP benefits, food stamps, grocery stores, find EBT retailers"
        />
        
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
          <div className="container mx-auto px-4 py-6">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold mb-2">Find EBT/SNAP Stores</h1>
              <p className="text-muted-foreground text-sm">
                Search for stores that accept EBT/SNAP benefits
              </p>
            </div>
            
            <MobileSearchInterface />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEOHead
        title="Find EBT/SNAP Stores Near You"
        description="Search for stores that accept EBT/SNAP benefits. Find grocery stores, restaurants, and retailers near you that accept food stamps."
        keywords="EBT stores, SNAP benefits, food stamps, grocery stores, find EBT retailers"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <div className="container mx-auto px-4 py-8">
          <BreadcrumbNavigation items={breadcrumbs} />
          
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">Find EBT/SNAP Stores</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Search for stores that accept EBT/SNAP benefits. Find grocery stores, 
              restaurants, and retailers near you that accept food stamps.
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-8">
            <EnhancedSearchBar />
            
            <EnhancedSearchResults
              stores={searchResults}
              isLoading={isLoading}
              error={error}
            />
          </div>
        </div>
      </div>
    </>
  );
};