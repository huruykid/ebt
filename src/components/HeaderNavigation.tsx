import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Search, BookOpen, User, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
interface HeaderNavigationProps {
  onNavigate?: (itemId: string) => void;
}
export const HeaderNavigation: React.FC<HeaderNavigationProps> = ({
  onNavigate
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    user,
    isGuest
  } = useAuth();

  // Determine active item based on current route
  const getActiveItem = () => {
    const path = location.pathname;
    if (path === '/') return 'home';
    if (path === '/search' || path.startsWith('/search')) return 'search';
    if (path === '/mission') return 'mission';
    if (path === '/snap-tips') return 'snap-tips';
    if (path === '/profile') return 'profile';
    return 'home'; // default fallback
  };
  const activeItem = getActiveItem();
  const navItems = [{
    id: 'home',
    label: 'Home',
    icon: Home
  }, {
    id: 'search',
    label: 'Search',
    icon: Search
  }, {
    id: 'mission',
    label: 'Mission',
    icon: Target
  }, {
    id: 'snap-tips',
    label: 'SNAP Tips',
    icon: BookOpen
  }, {
    id: 'profile',
    label: 'Profile',
    icon: User,
    requiresAuth: true
  }];
  const handleNavClick = (itemId: string) => {
    if (onNavigate) {
      onNavigate(itemId);
    }
  };
  const handleAuthClick = () => {
    navigate('/auth');
  };
  return <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex space-x-8">
            {navItems.map(item => {
            const isActive = activeItem === item.id;
            const IconComponent = item.icon;

            // Hide profile for guests
            if (item.requiresAuth && !user && isGuest) {
              return null;
            }
            return <button key={item.id} onClick={() => handleNavClick(item.id)} className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? 'text-primary bg-primary/10' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}>
                  <IconComponent className="h-4 w-4" />
                  <span>{item.label}</span>
                </button>;
          })}
          </nav>

          {/* Auth Section */}
          <div className="flex items-center gap-4">
            {!user && !isGuest ? <Button onClick={handleAuthClick} variant="outline" size="sm" className="hidden md:flex">
                Sign In
              </Button> : user ? <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {user.email?.charAt(0).toUpperCase()}
                </div>
                <span className="hidden md:block text-sm text-gray-700">
                  {user.email}
                </span>
              </div> : <div className="hidden md:flex items-center gap-3">
                <span className="text-sm text-gray-600">Guest Mode</span>
                <Button onClick={handleAuthClick} variant="outline" size="sm">
                  Sign In
                </Button>
              </div>}
          </div>
        </div>
      </div>
    </header>;
};