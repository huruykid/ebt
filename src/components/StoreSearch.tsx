import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { SearchContainer } from './store-search/SearchContainer';

export const StoreSearch: React.FC = () => {
  const [searchParams] = useSearchParams();
  
  // Parse location from URL params (passed from homepage "Search near your current location")
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');
  const initialLocation = lat && lng ? { lat: parseFloat(lat), lng: parseFloat(lng) } : undefined;

  return (
    <div className="min-h-screen">
      <SearchContainer initialLocation={initialLocation} />
    </div>
  );
};
