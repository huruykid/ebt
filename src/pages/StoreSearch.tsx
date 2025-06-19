
import React from 'react';
import { SearchContainer } from '@/components/store-search/SearchContainer';
import { MobileHeader } from '@/components/MobileHeader';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useZipCodeSearch } from '@/hooks/useZipCodeSearch';
import { useNavigate } from 'react-router-dom';

const StoreSearch = () => {
  const navigate = useNavigate();
  const {
    latitude,
    longitude,
    error,
    loading
  } = useGeolocation();

  const {
    activeZipCode,
    zipStores,
    isLoading: zipLoading,
    errorMessage,
    noResultsMessage,
    handleZipSearch,
    handleClearSearch,
    isSearchActive
  } = useZipCodeSearch();

  const handleCurrentLocationSearch = () => {
    if (latitude && longitude) {
      navigate(`/search?lat=${latitude}&lng=${longitude}`);
    }
  };

  const handleRequestLocation = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header with ZIP search - only on mobile */}
      <div className="md:hidden">
        <MobileHeader
          onZipSearch={handleZipSearch}
          onClearSearch={handleClearSearch}
          isSearchActive={isSearchActive}
          activeZip={activeZipCode || undefined}
          errorMessage={errorMessage}
          noResultsMessage={noResultsMessage}
          latitude={latitude}
          longitude={longitude}
          loading={loading}
          onCurrentLocationSearch={handleCurrentLocationSearch}
          onRequestLocation={handleRequestLocation}
        />
      </div>

      {/* Main search container */}
      <SearchContainer />
    </div>
  );
};

export default StoreSearch;
