import React from 'react';
import { useLocation } from 'react-router-dom';

interface NavItem {
  id: string;
  label: string;
  icon: string;
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
    { id: 'home', label: 'Home', icon: 'https://cdn.builder.io/api/v1/image/assets/107acf227ed0407ab298bbec90bffe3b/8384f74b39a673512d1bed56c97820bd149f7d82?placeholderIfAbsent=true', isActive: true },
    { id: 'search', label: 'Search', icon: 'https://cdn.builder.io/api/v1/image/assets/107acf227ed0407ab298bbec90bffe3b/278ca3ba5cfa9d6a37320ed2b236d1446861f8a0?placeholderIfAbsent=true', isActive: false },
    { id: 'wishlist', label: 'Wishlist', icon: 'https://cdn.builder.io/api/v1/image/assets/107acf227ed0407ab298bbec90bffe3b/d1fc98c6cd5a7254efbd366e5e05bfffffb80684?placeholderIfAbsent=true', isActive: false },
    { id: 'profile', label: 'Profile', icon: 'https://cdn.builder.io/api/v1/image/assets/107acf227ed0407ab298bbec90bffe3b/117b5cb95e98220b98f90824e7ff36bada31dd9b?placeholderIfAbsent=true', isActive: false }
  ];

  const handleNavClick = (itemId: string) => {
    if (onNavigate) {
      onNavigate(itemId);
    }
  };

  return (
    <footer 
      className={`flex w-full flex-col items-stretch text-[15px] text-[rgba(2,77,54,1)] font-normal whitespace-nowrap justify-center py-px border-[rgba(151,151,151,1)] border-t bg-white ${className}`}
    >
      <div className="bg-blend-normal bg-white flex w-full flex-col items-stretch justify-center px-[34px] py-[15px] border-[rgba(151,151,151,1)] border-t">
        <nav className="flex items-center gap-10" role="navigation" aria-label="Main navigation">
          {navItems.map((item) => {
            const isActive = activeItem === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`${
                  isActive
                    ? 'self-stretch flex min-h-[54px] flex-col items-center text-[rgba(192,34,35,1)] w-[45px] my-auto'
                    : 'self-stretch flex min-h-[54px] flex-col items-center my-auto'
                } hover:opacity-80 transition-opacity`}
                aria-label={`Navigate to ${item.label}`}
                aria-current={isActive ? 'page' : undefined}
              >
                {item.id === 'home' ? (
                  <>
                    <img
                      src={item.icon}
                      alt={`${item.label} icon`}
                      className="aspect-[1] object-contain w-6"
                    />
                    <div className="w-[45px] mt-1.5">
                      {item.label}
                    </div>
                  </>
                ) : item.id === 'search' ? (
                  <div>
                    <div className="flex flex-col items-center">
                      <img
                        src={item.icon}
                        alt={`${item.label} icon`}
                        className="aspect-[1] object-contain w-6"
                      />
                      <div className="gap-2.5 mt-[7px]">
                        {item.label}
                      </div>
                    </div>
                  </div>
                ) : item.id === 'wishlist' ? (
                  <div className="min-h-[53px]">
                    <div className="flex h-[53px] flex-col items-center">
                      <img
                        src={item.icon}
                        alt={`${item.label} icon`}
                        className="aspect-[1] object-contain w-6"
                      />
                      <div className="min-h-[29px] gap-2.5 mt-[7px]">
                        {item.label}
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <img
                      src={item.icon}
                      alt={`${item.label} icon`}
                      className="aspect-[1] object-contain w-[30px]"
                    />
                    <div className="gap-2.5">
                      {item.label}
                    </div>
                  </>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </footer>
  );
};
