
import React from 'react';
import { useLocation } from 'react-router-dom';
import { Home, Search, Heart, User } from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  isActive?: boolean;
}

interface BottomNavigationProps {
  onNavigate?: (itemId: string) => void;
  className?: string;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  onNavigate,
  className = ""
}) => {
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

  const navItems: NavItem[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'wishlist', label: 'Wishlist', icon: Heart },
    { id: 'profile', label: 'Profile', icon: User }
  ];

  const handleNavClick = (itemId: string) => {
    if (onNavigate) {
      onNavigate(itemId);
    }
  };

  return (
    <footer 
      className={`flex w-full flex-col items-stretch text-[15px] font-normal whitespace-nowrap justify-center py-px border-[#979797] border-t bg-white ${className}`}
    >
      <div className="bg-blend-normal bg-white flex w-full flex-col items-stretch justify-center px-[34px] py-[15px] border-[#979797] border-t">
        <nav className="flex items-center gap-10" role="navigation" aria-label="Main navigation">
          {navItems.map((item) => {
            const isActive = activeItem === item.id;
            const IconComponent = item.icon;
            
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`flex min-h-[54px] flex-col items-center justify-center transition-all duration-200 hover:opacity-80 ${
                  isActive ? 'text-green-600' : 'text-[#757575]'
                }`}
                aria-label={`Navigate to ${item.label}`}
                aria-current={isActive ? 'page' : undefined}
              >
                <IconComponent 
                  size={24} 
                  strokeWidth={isActive ? 2.5 : 2}
                  className={`mb-1 transition-all duration-200 ${
                    isActive ? 'stroke-green-600' : 'stroke-[#757575]'
                  }`}
                />
                <span className={`text-[10px] font-medium transition-colors duration-200 ${
                  isActive ? 'text-green-600' : 'text-[#757575]'
                }`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </footer>
  );
};
