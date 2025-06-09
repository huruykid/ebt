
import React, { useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';
import { useGeolocation } from '@/hooks/useGeolocation';

interface SearchBarProps {
  onSearch?: (query: string) => void;
  onLocationSearch?: (latitude: number, longitude: number) => void;
  placeholder?: string;
  className?: string;
  initialValue?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({ 
  onSearch, 
  onLocationSearch,
  placeholder = "Ex. Veggie Burger",
  className = "",
  initialValue = ""
}) => {
  const [searchQuery, setSearchQuery] = useState(initialValue);
  const { latitude, longitude, loading: locationLoading } = useGeolocation();

  // Update internal state when initialValue changes
  useEffect(() => {
    setSearchQuery(initialValue);
  }, [initialValue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleLocationSearch = () => {
    if (latitude && longitude && onLocationSearch) {
      onLocationSearch(latitude, longitude);
    }
  };

  return (
    <div className="space-y-2">
      <form onSubmit={handleSubmit} className={`flex w-full items-stretch gap-[5px] ${className}`}>
        <div className="bg-white flex items-stretch gap-2.5 grow shrink basis-auto pl-3 pr-[63px] py-2.5 rounded-[10px]">
          <div className="flex gap-2.5">
            <img
              src="https://cdn.builder.io/api/v1/image/assets/107acf227ed0407ab298bbec90bffe3b/dfcdb2ff55e023290e52ce46595241d8daec4458?placeholderIfAbsent=true"
              alt="Search icon"
              className="aspect-[1] object-contain w-5"
            />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={handleInputChange}
            placeholder={placeholder}
            className="gap-2.5 text-sm text-[rgba(196,196,196,1)] font-normal bg-transparent border-none outline-none flex-1"
            aria-label="Search for food"
          />
        </div>
        <button
          type="submit"
          className="bg-[rgba(2,77,54,1)] flex min-h-[41px] items-center gap-2.5 w-[41px] justify-center h-[41px] px-[17px] rounded-[10px] hover:bg-[rgba(2,77,54,0.9)] transition-colors"
          aria-label="Search"
        >
          <div className="self-stretch flex w-[7px] items-center gap-2.5 justify-center my-auto">
            <img
              src="https://cdn.builder.io/api/v1/image/assets/107acf227ed0407ab298bbec90bffe3b/7f3ba8ffdfa1c176fee82ccd55841146e33e4993?placeholderIfAbsent=true"
              alt="Go arrow"
              className="aspect-[0.5] object-contain w-[7px] self-stretch my-auto"
            />
          </div>
        </button>
      </form>
      
      {onLocationSearch && (
        <button
          onClick={handleLocationSearch}
          disabled={!latitude || !longitude || locationLoading}
          className="flex items-center justify-center gap-2 w-full px-4 py-2 text-sm text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <MapPin className="h-4 w-4" />
          <span>
            {locationLoading ? 'Getting location...' : 
             latitude && longitude ? 'Search near current location' : 
             'Enable location to search nearby'}
          </span>
        </button>
      )}
    </div>
  );
};
