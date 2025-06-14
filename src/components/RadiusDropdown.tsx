
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MapPin } from 'lucide-react';

interface RadiusDropdownProps {
  value: number;
  onChange: (radius: number) => void;
  className?: string;
}

const radiusOptions = [
  { value: 10, label: '10 miles' },
  { value: 20, label: '20 miles' },
  { value: 40, label: '40 miles' }
];

export const RadiusDropdown: React.FC<RadiusDropdownProps> = ({
  value,
  onChange,
  className
}) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <MapPin className="h-4 w-4 text-muted-foreground" />
      <Select value={value.toString()} onValueChange={(val) => onChange(parseInt(val))}>
        <SelectTrigger className="w-32">
          <SelectValue placeholder="Radius" />
        </SelectTrigger>
        <SelectContent>
          {radiusOptions.map((option) => (
            <SelectItem key={option.value} value={option.value.toString()}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
