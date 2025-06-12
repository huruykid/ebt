
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Users } from 'lucide-react';
import { SearchBar } from '@/components/SearchBar';
import { SyncStoresButton } from '@/components/SyncStoresButton';
import { useAuth } from '@/contexts/AuthContext';

interface SearchHeaderProps {
  searchQuery: string;
  onSearch: (query: string) => void;
  onLocationSearch: (latitude: number, longitude: number) => void;
}

export const SearchHeader: React.FC<SearchHeaderProps> = ({
  searchQuery,
  onSearch,
  onLocationSearch,
}) => {
  const { isGuest } = useAuth();
  const navigate = useNavigate();

  const handleFindStoresClick = () => {
    navigate('/');
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={handleFindStoresClick}
          className="heading-lg gradient-text hover:scale-105 transition-transform duration-300 cursor-pointer flex items-center gap-2"
        >
          <Search className="h-8 w-8 text-primary animate-bounce-gentle" />
          Find SNAP Stores
        </button>
        <div className="flex items-center gap-3">
          {isGuest && (
            <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm">
              <Users className="h-4 w-4" />
              Guest Mode
            </div>
          )}
          <SyncStoresButton />
        </div>
      </div>
      
      {/* Enhanced Search Bar Container */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-info/20 rounded-spotify-xl blur-lg"></div>
        <div className="relative card-gradient border-2 border-primary/20 rounded-spotify-xl p-1">
          <SearchBar 
            onSearch={onSearch}
            onLocationSearch={onLocationSearch}
            placeholder="🔍 Search by store name, city, or zip code..."
            className="border-0 bg-transparent"
            initialValue={searchQuery}
          />
        </div>
      </div>
    </div>
  );
};
