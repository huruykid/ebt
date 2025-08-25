
import React from 'react';
import { useLocation } from 'react-router-dom';
import { Home, Search, Heart, User, Target } from 'lucide-react';

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
    if (path === '/mission') return 'mission';
    if (path === '/favorites') return 'favorites';
    if (path === '/profile') return 'profile';
    return 'home'; // default fallback
  };

  const activeItem = getActiveItem();

  const navItems: NavItem[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'mission', label: 'Mission', icon: Target },
    { id: 'favorites', label: 'Favorites', icon: Heart },
    { id: 'profile', label: 'Profile', icon: User }
  ];

  const handleNavClick = (itemId: string) => {
    if (onNavigate) {
      onNavigate(itemId);
    }
  };

  return (
    <footer 
      className={`fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border ${className}`}
      style={{
        paddingBottom: 'max(constant(safe-area-inset-bottom), env(safe-area-inset-bottom), 0px)'
      }}
    >
      <nav 
        className="flex items-center justify-center h-[49px] px-2" 
        role="navigation" 
        aria-label="Main navigation"
      >
        <div className="flex items-center justify-between w-full max-w-md">
          {navItems.map((item) => {
            const isActive = activeItem === item.id;
            const IconComponent = item.icon;
            
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`flex flex-col items-center justify-center min-w-[44px] min-h-[44px] px-1 transition-all duration-200 hover:opacity-80 ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}
                aria-label={`Navigate to ${item.label}`}
                aria-current={isActive ? 'page' : undefined}
              >
                <IconComponent 
                  size={20} 
                  strokeWidth={isActive ? 2.5 : 2}
                  className={`mb-0.5 transition-all duration-200`}
                />
                <span className={`text-[10px] font-medium transition-colors duration-200 leading-tight`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </footer>
  );
};
