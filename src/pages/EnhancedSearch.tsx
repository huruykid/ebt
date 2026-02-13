import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { SEOHead } from '@/components/SEOHead';
import { SearchContainer } from '@/components/store-search/SearchContainer';

export const EnhancedSearch: React.FC = () => {
  const [searchParams] = useSearchParams();

  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');
  const initialLocation = lat && lng ? { lat: parseFloat(lat), lng: parseFloat(lng) } : undefined;

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Search Stores', href: '/search' }
  ];

  return (
    <>
      <SEOHead
        title="Find EBT/SNAP Stores Near You"
        description="Search for stores that accept EBT/SNAP benefits. Find grocery stores, restaurants, and retailers near you that accept food stamps."
        keywords="EBT stores, SNAP benefits, food stamps, grocery stores, find EBT retailers"
      />

      <div className="min-h-screen bg-background">
        <SearchContainer initialLocation={initialLocation} />
      </div>
    </>
  );
};
