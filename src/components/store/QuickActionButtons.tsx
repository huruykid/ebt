import React from 'react';
import { Phone, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QuickActionButtonsProps {
  phone?: string | null;
  address: string;
  storeName: string;
  className?: string;
  variant?: 'compact' | 'full';
}

export const QuickActionButtons: React.FC<QuickActionButtonsProps> = ({
  phone,
  address,
  storeName,
  className = '',
  variant = 'compact',
}) => {
  const handleCall = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (phone) {
      window.location.href = `tel:${phone.replace(/\D/g, '')}`;
    }
  };

  const handleDirections = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const query = encodeURIComponent(`${storeName}, ${address}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  if (variant === 'full') {
    return (
      <div className={`flex gap-2 ${className}`}>
        {phone && (
          <Button 
            onClick={handleCall} 
            size="sm" 
            className="flex-1 gap-1.5"
          >
            <Phone className="h-4 w-4" />
            Call
          </Button>
        )}
        <Button 
          onClick={handleDirections} 
          variant={phone ? 'outline' : 'default'}
          size="sm" 
          className="flex-1 gap-1.5"
        >
          <Navigation className="h-4 w-4" />
          Directions
        </Button>
      </div>
    );
  }

  // Compact variant (icon buttons)
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {phone && (
        <Button
          onClick={handleCall}
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
          title="Call store"
        >
          <Phone className="h-4 w-4" />
        </Button>
      )}
      <Button
        onClick={handleDirections}
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
        title="Get directions"
      >
        <Navigation className="h-4 w-4" />
      </Button>
    </div>
  );
};
