
import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, X, Home, Search, Heart, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

interface DesktopNavigationProps {
  onNavigate?: (itemId: string) => void;
}

export const DesktopNavigation: React.FC<DesktopNavigationProps> = ({
  onNavigate
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  
  // Determine active item based on current route
  const getActiveItem = () => {
    const path = location.pathname;
    if (path === '/') return 'home';
    if (path === '/search' || path.startsWith('/search')) return 'search';
    if (path === '/wishlist') return 'wishlist';
    if (path === '/profile') return 'profile';
    return 'home'; // default fallback
  };

  const activeItem = getActiveItem();

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'wishlist', label: 'Wishlist', icon: Heart },
    { id: 'profile', label: 'Profile', icon: User }
  ];

  const handleNavClick = (itemId: string) => {
    if (onNavigate) {
      onNavigate(itemId);
    }
    setIsOpen(false); // Close menu after navigation
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="bg-white shadow-md hover:shadow-lg transition-shadow"
        >
          <Menu className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64">
        <SheetHeader>
          <SheetTitle>Navigation</SheetTitle>
        </SheetHeader>
        <nav className="mt-6">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const isActive = activeItem === item.id;
              const IconComponent = item.icon;
              
              return (
                <li key={item.id}>
                  <button
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <IconComponent className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </SheetContent>
    </Sheet>
  );
};
