
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, MapPin, Star, Users } from 'lucide-react';

export type SortOption = 'distance' | 'popularity' | 'rating';

interface SortDropdownProps {
  currentSort: SortOption;
  onSortChange: (sort: SortOption) => void;
}

export const SortDropdown: React.FC<SortDropdownProps> = ({ 
  currentSort, 
  onSortChange 
}) => {
  const sortOptions = [
    {
      value: 'distance' as SortOption,
      label: 'Nearest First',
      icon: MapPin,
      description: 'Closest to you'
    },
    {
      value: 'popularity' as SortOption,
      label: 'Most Popular',
      icon: Users,
      description: 'Most reviews'
    },
    {
      value: 'rating' as SortOption,
      label: 'Best Rated',
      icon: Star,
      description: 'Highest rated'
    }
  ];

  const currentOption = sortOptions.find(option => option.value === currentSort);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8">
          {currentOption?.icon && <currentOption.icon className="h-3 w-3 mr-1" />}
          {currentOption?.label}
          <ChevronDown className="h-3 w-3 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {sortOptions.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => onSortChange(option.value)}
            className="flex items-start gap-2 py-2"
          >
            <option.icon className="h-4 w-4 mt-0.5 text-gray-500" />
            <div>
              <div className="font-medium">{option.label}</div>
              <div className="text-xs text-gray-500">{option.description}</div>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
