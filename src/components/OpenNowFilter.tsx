import React from 'react';
import { Clock } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface OpenNowFilterProps {
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
  className?: string;
}

export const OpenNowFilter: React.FC<OpenNowFilterProps> = ({
  isEnabled,
  onToggle,
  className = ''
}) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Switch
        id="open-now-filter"
        checked={isEnabled}
        onCheckedChange={onToggle}
        className="data-[state=checked]:bg-success"
      />
      <Label 
        htmlFor="open-now-filter" 
        className="flex items-center gap-1.5 text-sm font-medium cursor-pointer"
      >
        <Clock className="h-3.5 w-3.5" />
        <span>Open Now</span>
      </Label>
    </div>
  );
};
