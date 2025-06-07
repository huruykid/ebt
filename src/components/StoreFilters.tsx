
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface SearchFilters {
  storeType: string;
  incentiveProgram: string;
  hasCoordinates: boolean;
}

interface StoreFiltersProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
}

export const StoreFilters: React.FC<StoreFiltersProps> = ({ filters, onFiltersChange }) => {
  const { data: storeTypes } = useQuery({
    queryKey: ['store-types'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('snap_stores')
        .select('store_type')
        .not('store_type', 'is', null);
      
      if (error) throw error;
      
      const uniqueTypes = [...new Set(data.map(item => item.store_type))].filter(Boolean);
      return uniqueTypes.sort();
    },
  });

  const { data: incentivePrograms } = useQuery({
    queryKey: ['incentive-programs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('snap_stores')
        .select('incentive_program')
        .not('incentive_program', 'is', null);
      
      if (error) throw error;
      
      const uniquePrograms = [...new Set(data.map(item => item.incentive_program))].filter(Boolean);
      return uniquePrograms.sort();
    },
  });

  const handleFilterChange = (key: keyof SearchFilters, value: string | boolean) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      storeType: '',
      incentiveProgram: '',
      hasCoordinates: false
    });
  };

  const hasActiveFilters = filters.storeType || filters.incentiveProgram || filters.hasCoordinates;

  return (
    <div className="bg-gray-50 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Store Type
          </label>
          <select
            value={filters.storeType}
            onChange={(e) => handleFilterChange('storeType', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">All types</option>
            {storeTypes?.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Incentive Program
          </label>
          <select
            value={filters.incentiveProgram}
            onChange={(e) => handleFilterChange('incentiveProgram', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">All programs</option>
            {incentivePrograms?.map((program) => (
              <option key={program} value={program}>
                {program}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          <label className="flex items-center space-x-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={filters.hasCoordinates}
              onChange={(e) => handleFilterChange('hasCoordinates', e.target.checked)}
              className="rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
            <span>Show on map only</span>
          </label>
        </div>
      </div>
    </div>
  );
};
