import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { SearchBar } from './SearchBar';
import { StoreCard } from './StoreCard';
import { StoreFilters } from './StoreFilters';
import { LoadingSpinner } from './LoadingSpinner';
import { SyncStoresButton } from './SyncStoresButton';
import type { Tables } from '@/integrations/supabase/types';

type Store = Tables<'snap_stores'>;

interface SearchFilters {
  storeType: string;
  incentiveProgram: string;
  hasCoordinates: boolean;
}

export const StoreSearch: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({
    storeType: '',
    incentiveProgram: '',
    hasCoordinates: false
  });
  const navigate = useNavigate();

  const { data: stores, isLoading, error } = useQuery({
    queryKey: ['stores', searchQuery, filters],
    queryFn: async () => {
      let query = supabase
        .from('snap_stores')
        .select('*')
        .order('store_name');

      // Apply search query
      if (searchQuery.trim()) {
        query = query.or(`store_name.ilike.%${searchQuery}%,city.ilike.%${searchQuery}%,zip_code.ilike.%${searchQuery}%,state.ilike.%${searchQuery}%`);
      }

      // Apply filters
      if (filters.storeType) {
        query = query.eq('store_type', filters.storeType);
      }

      if (filters.incentiveProgram) {
        query = query.eq('incentive_program', filters.incentiveProgram);
      }

      if (filters.hasCoordinates) {
        query = query.not('latitude', 'is', null).not('longitude', 'is', null);
      }

      // Limit results for performance
      query = query.limit(100);

      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching stores:', error);
        throw error;
      }
      
      return data || [];
    },
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFiltersChange = (newFilters: SearchFilters) => {
    setFilters(newFilters);
  };

  const handleFindStoresClick = () => {
    navigate('/');
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <button 
            onClick={handleFindStoresClick}
            className="text-2xl font-bold text-gray-800 hover:text-blue-600 transition-colors cursor-pointer"
          >
            Find SNAP Stores
          </button>
          <SyncStoresButton />
        </div>
        <SearchBar 
          onSearch={handleSearch}
          placeholder="Search by store name, city, or zip code..."
          className="mb-4"
        />
        <StoreFilters 
          filters={filters}
          onFiltersChange={handleFiltersChange}
        />
      </div>

      {isLoading && <LoadingSpinner />}

      {error && (
        <div className="text-center py-8">
          <p className="text-red-600">Error loading stores. Please try again.</p>
        </div>
      )}

      {stores && stores.length === 0 && !isLoading && (
        <div className="text-center py-8">
          <p className="text-gray-600">No stores found. Try adjusting your search or filters.</p>
        </div>
      )}

      {stores && stores.length > 0 && (
        <div className="space-y-4">
          <p className="text-sm text-gray-600 mb-4">
            Found {stores.length} store{stores.length !== 1 ? 's' : ''}
          </p>
          {stores.map((store) => (
            <StoreCard 
              key={store.id}
              store={store}
            />
          ))}
        </div>
      )}
    </div>
  );
};
