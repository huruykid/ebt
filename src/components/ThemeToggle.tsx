
import React from 'react';
import { Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const ThemeToggle: React.FC = () => {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-9 w-9"
      disabled
    >
      <Sun className="h-4 w-4" />
    </Button>
  );
};
