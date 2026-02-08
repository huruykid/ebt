import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Phone, Clock, Star, Camera } from 'lucide-react';

interface SearchFilters {
  storeType: string;
  incentiveProgram: string;
  hasCoordinates: boolean;
  hasPhone: boolean;
  hasHours: boolean;
  hasRating: boolean;
  hasPhotos: boolean;
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
        .select('Store_Type')
        .not('Store_Type', 'is', null)
        .neq('Store_Type', '');
      
      if (error) throw error;
      
      // Get unique types, filter out empty strings, and sort alphabetically
      const uniqueTypes = [...new Set(data.map(item => item.Store_Type?.trim()))]
        .filter(type => type && type.length > 0)
        .sort((a, b) => a.localeCompare(b));
      
      console.log('Available store types:', uniqueTypes);
      return uniqueTypes;
    },
  });

  const { data: incentivePrograms } = useQuery({
    queryKey: ['incentive-programs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('snap_stores')
        .select('Incentive_Program')
        .not('Incentive_Program', 'is', null)
        .neq('Incentive_Program', '');
      
      if (error) throw error;
      
      // Get unique programs, filter out empty strings, and sort alphabetically
      const uniquePrograms = [...new Set(data.map(item => item.Incentive_Program?.trim()))]
        .filter(program => program && program.length > 0)
        .sort((a, b) => a.localeCompare(b));
      
      console.log('Available incentive programs:', uniquePrograms);
      return uniquePrograms;
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
      hasCoordinates: false,
      hasPhone: false,
      hasHours: false,
      hasRating: false,
      hasPhotos: false,
    });
  };

  const hasActiveFilters = filters.storeType || filters.incentiveProgram || filters.hasCoordinates ||
    filters.hasPhone || filters.hasHours || filters.hasRating || filters.hasPhotos;

  // Toggle button component for data completeness filters
  const FilterToggle: React.FC<{
    checked: boolean;
    onChange: (checked: boolean) => void;
    icon: React.ReactNode;
    label: string;
  }> = ({ checked, onChange, icon, label }) => (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ${
        checked 
          ? 'bg-primary/10 border-primary/30 text-primary' 
          : 'bg-background border-border text-muted-foreground hover:bg-muted/50'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  return (
    <div className="border border-border rounded-lg p-4 bg-card shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-foreground">Filter Results</h3>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-primary hover:text-primary/80 font-medium"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Store Type and Incentive Program - Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Store Type
          </label>
          <select
            value={filters.storeType}
            onChange={(e) => handleFilterChange('storeType', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
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
          <label className="block text-sm font-medium text-foreground mb-2">
            Incentive Program
          </label>
          <select
            value={filters.incentiveProgram}
            onChange={(e) => handleFilterChange('incentiveProgram', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
          >
            <option value="">All programs</option>
            {incentivePrograms?.map((program) => (
              <option key={program} value={program}>
                {program}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Data Completeness Filters - Row 2 */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Show stores with complete info
        </label>
        <div className="flex flex-wrap gap-2">
          <FilterToggle
            checked={filters.hasPhone}
            onChange={(checked) => handleFilterChange('hasPhone', checked)}
            icon={<Phone className="h-4 w-4" />}
            label="Has Phone"
          />
          <FilterToggle
            checked={filters.hasHours}
            onChange={(checked) => handleFilterChange('hasHours', checked)}
            icon={<Clock className="h-4 w-4" />}
            label="Has Hours"
          />
          <FilterToggle
            checked={filters.hasRating}
            onChange={(checked) => handleFilterChange('hasRating', checked)}
            icon={<Star className="h-4 w-4" />}
            label="Has Rating"
          />
          <FilterToggle
            checked={filters.hasPhotos}
            onChange={(checked) => handleFilterChange('hasPhotos', checked)}
            icon={<Camera className="h-4 w-4" />}
            label="Has Photos"
          />
        </div>
      </div>

      {/* Map filter - kept for backward compatibility */}
      <div className="mt-4 pt-4 border-t border-border">
        <label className="flex items-center space-x-2 text-sm text-foreground">
          <input
            type="checkbox"
            checked={filters.hasCoordinates}
            onChange={(e) => handleFilterChange('hasCoordinates', e.target.checked)}
            className="rounded border-border text-primary focus:ring-primary"
          />
          <span>Show on map only</span>
        </label>
      </div>
    </div>
  );
};
