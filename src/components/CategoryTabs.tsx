
import React, { useState, useRef, useEffect } from 'react';
import { Info, ChevronLeft, ChevronRight } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  icon: string;
  activeIcon?: string; // For colorful active state
  storeTypes?: string[]; // Map to actual store types in database
  namePatterns?: string[]; // Additional name patterns to match
  excludePatterns?: string[]; // Patterns to exclude from matches
  showStateWarning?: boolean; // For RMP state-specific warning
}

interface CategoryTabsProps {
  onCategoryChange?: (categoryId: string, storeTypes?: string[], namePatterns?: string[]) => void;
  className?: string;
}

export const CategoryTabs: React.FC<CategoryTabsProps> = ({ 
  onCategoryChange,
  className = ""
}) => {
  const [activeCategory, setActiveCategory] = useState('trending');
  const [showRmpExplanation, setShowRmpExplanation] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const categories: Category[] = [
    { 
      id: 'trending', 
      name: 'Trending', 
      icon: '🔥',
      activeIcon: '🔥'
    },
    { 
      id: 'hotmeals', 
      name: 'Fast Food', 
      icon: '🍟',
      activeIcon: '🍟',
      storeTypes: ['Restaurant Meals Program', 'Restaurant'],
      namePatterns: ['Restaurant', 'Diner', 'Cafe', 'Grill', 'McDonald\'s', 'Burger King', 'Wendy\'s', 'Taco Bell', 'KFC', 'Subway', 'Pizza Hut', 'Domino\'s'],
      excludePatterns: ['CVS', 'Walgreens', 'Dollar', 'Market'],
      showStateWarning: true
    },
    { 
      id: 'grocery', 
      name: 'Grocery Store', 
      icon: '🏪',
      activeIcon: '🏪',
      storeTypes: ['Supermarket', 'Grocery Store', 'Supercenter'],
      namePatterns: ['Whole Foods', 'Safeway', 'Kroger', 'Publix', 'H-E-B', 'Wegmans', 'Food Lion', 'Giant', 'Stop & Shop', 'ShopRite', 'IGA', 'Piggly Wiggly', 'Harris Teeter', 'Meijer', 'Fred Meyer', 'King Soopers', 'Ralph\'s', 'Vons', 'Albertsons', 'Market', 'Food', 'Grocery'],
      excludePatterns: ['Farmers Market', 'Farm Market', 'Flea Market', 'Farmer\'s Market', 'CVS', 'Walgreens', 'Rite Aid', 'Dollar']
    },
    { 
      id: 'bakery', 
      name: 'Bakery', 
      icon: '🍞',
      activeIcon: '🍞',
      storeTypes: [],
      namePatterns: ['Bakery', 'Bake', 'Bread', 'Pastry', 'Cake', 'Donut', 'Doughnut', 'Bagel'],
      excludePatterns: []
    },
    { 
      id: 'farmersmarket', 
      name: "Farmer's Market", 
      icon: '🥕',
      activeIcon: '🥕',
      storeTypes: ['Farmers and Markets', 'Farmers Market'],
      namePatterns: ['Farmers Market', 'Farm Market', 'Farmer\'s Market', 'Farmstand', 'Farmers and Markets'],
      excludePatterns: []
    },
    { 
      id: 'delivery', 
      name: 'Delivery', 
      icon: '🚚',
      activeIcon: '🚚',
      storeTypes: [],
      namePatterns: ['Walmart', 'Amazon Fresh', 'Safeway', 'Kroger', 'Instacart', 'Whole Foods', 'Target', 'ALDI', 'ShopRite', 'Stop & Shop', 'Giant', 'Meijer', 'H-E-B'],
      excludePatterns: []
    },
    { 
      id: 'convenience', 
      name: 'Corner Stores', 
      icon: '🏬',
      activeIcon: '🏬',
      storeTypes: ['Convenience Store', 'Corner Store'],
      namePatterns: ['7-Eleven', '7 Eleven', 'Circle K', 'Wawa', 'Sheetz', 'QuikTrip', 'Casey\'s', 'Cumberland Farms'],
      excludePatterns: ['CVS', 'Walgreens', 'Rite Aid', 'Dollar']
    }
  ];

  const checkScrollButtons = () => {
    // Use requestAnimationFrame to batch DOM reads and avoid forced reflow
    requestAnimationFrame(() => {
      if (scrollContainerRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
        setCanScrollLeft(scrollLeft > 0);
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
      }
    });
  };

  useEffect(() => {
    checkScrollButtons();
    const handleResize = () => checkScrollButtons();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleCategoryClick = (categoryId: string) => {
    setActiveCategory(categoryId);
    const category = categories.find(c => c.id === categoryId);
    
    // Show RMP state warning if applicable
    if (category?.showStateWarning) {
      console.log('RMP category selected - may need state warning');
    }
    
    if (onCategoryChange) {
      onCategoryChange(categoryId, category?.storeTypes || [], category?.namePatterns || []);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Left fade indicator */}
      {canScrollLeft && (
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none md:hidden" />
      )}
      
      {/* Right fade indicator */}
      {canScrollRight && (
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none md:hidden" />
      )}

      {/* Left scroll button - visible on mobile */}
      {canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-1 top-1/2 -translate-y-1/2 z-20 p-1.5 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all duration-200 md:hidden"
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-4 w-4 text-gray-600" />
        </button>
      )}

      {/* Right scroll button - visible on mobile */}
      {canScrollRight && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-1 top-1/2 -translate-y-1/2 z-20 p-1.5 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all duration-200 md:hidden animate-pulse"
          aria-label="Scroll right"
        >
          <ChevronRight className="h-4 w-4 text-gray-600" />
        </button>
      )}

      <div 
        ref={scrollContainerRef}
        className="overflow-x-auto scrollbar-hide"
        onScroll={checkScrollButtons}
      >
        <nav 
          className="rounded-xl bg-muted flex items-center justify-start md:justify-center gap-2 md:gap-6 px-3 md:px-6 py-2 md:py-4 min-w-max"
          role="tablist"
          aria-label="Food categories"
        >
          {categories.map((category) => {
            const isActive = activeCategory === category.id;
            
            return (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
                className={`flex flex-col items-center justify-center min-w-[60px] md:min-w-[80px] px-2 md:px-4 py-2 md:py-4 transition-all duration-300 hover:opacity-80 rounded-xl md:rounded-2xl hover:scale-105 md:hover:scale-110 ${
                  isActive 
                    ? 'bg-gradient-to-br from-white to-gray-50 shadow-lg md:shadow-xl border border-primary/30 md:border-2 scale-105 md:scale-110 transform' 
                    : 'hover:bg-white/70 hover:shadow-md md:hover:shadow-lg'
                }`}
                role="button"
                aria-pressed={isActive}
              >
                <div className={`w-8 h-8 md:w-12 md:h-12 flex items-center justify-center mb-1 md:mb-2 transition-all duration-300 rounded-full ${
                  isActive 
                    ? 'scale-110 md:scale-125 bg-gradient-to-br from-primary/10 to-accent/10 shadow-md md:shadow-lg' 
                    : 'hover:scale-105 md:hover:scale-110 hover:bg-primary/5'
                }`}>
                  <span className={`transition-all duration-300 ${
                    isActive ? 'text-2xl md:text-4xl drop-shadow-lg' : 'text-xl md:text-3xl grayscale hover:grayscale-0'
                  }`}>
                    {isActive ? (category.activeIcon || category.icon) : category.icon}
                  </span>
                </div>
                <span className={`text-[10px] md:text-xs font-bold text-center whitespace-nowrap transition-all duration-300 ${
                  isActive 
                    ? 'text-primary scale-105 md:scale-110 drop-shadow-sm' 
                    : 'text-[#484848] hover:text-primary/80'
                }`}>
                  {category.name}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
      
      {/* Small scroll indicator dots for mobile */}
      <div className="flex justify-center mt-2 md:hidden">
        <div className="flex gap-1">
          {categories.map((_, index) => (
            <div
              key={index}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                Math.floor((activeCategory === categories[index]?.id ? index : 0)) === index
                  ? 'bg-primary' 
                  : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
      
      {/* Mobile RMP Explanation Toggle - only show on mobile */}
      {activeCategory === 'hotmeals' && (
        <div className="mt-3 md:hidden">
          <button
            onClick={() => setShowRmpExplanation(!showRmpExplanation)}
            className="text-xs text-blue-600 hover:text-blue-800 underline font-medium transition-colors duration-200"
          >
            What's this?
          </button>
          
          {showRmpExplanation && (
            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-800">
                RMP allows eligible SNAP recipients to buy prepared meals at participating restaurants in select states.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
