import React from 'react';
import { useLocation } from 'react-router-dom';
import { Home, Search, BookOpen, User, FileText } from 'lucide-react';

interface BottomNavigationProps {
  onNavigate?: (itemId: string) => void;
  className?: string;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  onNavigate,
  className = ""
}) => {
  const location = useLocation();

  const getActiveItem = () => {
    const path = location.pathname;
    if (path === '/') return 'home';
    if (path === '/search' || path.startsWith('/search')) return 'search';
    if (path === '/blog') return 'blog';
    if (path === '/snap-tips') return 'snap-tips';
    if (path === '/profile') return 'profile';
    return 'home';
  };

  const activeItem = getActiveItem();

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'blog', label: 'Blog', icon: FileText },
    { id: 'snap-tips', label: 'SNAP Tips', icon: BookOpen },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <footer
      className={`fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-t border-border/50 ${className}`}
      style={{
        paddingBottom: 'max(constant(safe-area-inset-bottom), env(safe-area-inset-bottom), 0px)'
      }}
    >
      <nav className="flex items-center justify-center h-14 px-4" role="navigation" aria-label="Main navigation">
        <div className="flex items-center justify-between w-full max-w-sm">
          {navItems.map((item) => {
            const isActive = activeItem === item.id;
            const IconComponent = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate?.(item.id)}
                className={`flex flex-col items-center justify-center min-w-[44px] min-h-[44px] rounded-xl transition-colors duration-150 ${
                  isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
                aria-label={`Navigate to ${item.label}`}
                aria-current={isActive ? 'page' : undefined}
              >
                <IconComponent size={20} strokeWidth={isActive ? 2.5 : 1.5} />
                <span className={`text-[10px] mt-0.5 ${isActive ? 'font-semibold' : 'font-medium'}`}>
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
