import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

interface HeaderNavigationProps {
  onNavigate?: (itemId: string) => void;
}

export const HeaderNavigation: React.FC<HeaderNavigationProps> = ({ onNavigate }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isGuest } = useAuth();

  const getActiveItem = () => {
    const path = location.pathname;
    if (path === '/') return 'home';
    if (path === '/search' || path.startsWith('/search')) return 'search';
    if (path === '/blog') return 'blog';
    if (path === '/mission') return 'mission';
    if (path === '/snap-tips') return 'snap-tips';
    if (path === '/profile') return 'profile';
    return 'home';
  };

  const activeItem = getActiveItem();

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'search', label: 'Search' },
    { id: 'blog', label: 'Blog' },
    { id: 'mission', label: 'Mission' },
    { id: 'snap-tips', label: 'SNAP Tips' },
    { id: 'profile', label: 'Profile', requiresAuth: true },
  ];

  const handleNavClick = (itemId: string) => onNavigate?.(itemId);
  const handleAuthClick = () => navigate('/auth');

  return (
    <header className="bg-background/80 backdrop-blur-lg border-b border-border/50">
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex justify-between items-center h-14">
          <button onClick={() => handleNavClick('home')} className="text-base font-semibold text-foreground tracking-tight">
            EBT Finder
          </button>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(item => {
              const isActive = activeItem === item.id;
              if (item.requiresAuth && !user && isGuest) return null;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors duration-150 ${
                    isActive ? 'text-primary font-medium bg-primary/5' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            {!user && !isGuest ? (
              <Button onClick={handleAuthClick} variant="ghost" size="sm">Sign In</Button>
            ) : user ? (
              <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xs font-medium">
                {user.email?.charAt(0).toUpperCase()}
              </div>
            ) : (
              <Button onClick={handleAuthClick} variant="ghost" size="sm">Sign In</Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
