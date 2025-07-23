
import React, { useState } from 'react';
import { Info } from 'lucide-react';

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

  const categories: Category[] = [
    { 
      id: 'trending', 
      name: 'Trending', 
      icon: '🔥',
      activeIcon: '🔥'
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
      id: 'convenience', 
      name: 'Corner Stores', 
      icon: '🏬',
      activeIcon: '🏬',
      storeTypes: ['Convenience Store', 'Corner Store'],
      namePatterns: ['7-Eleven', '7 Eleven', 'Circle K', 'Wawa', 'Sheetz', 'QuikTrip', 'Casey\'s', 'Cumberland Farms'],
      excludePatterns: ['CVS', 'Walgreens', 'Rite Aid', 'Dollar']
    },
    { 
      id: 'hotmeals', 
      name: 'Hot Meals (RMP)', 
      icon: '🍽️',
      activeIcon: '🍽️',
      storeTypes: ['Restaurant Meals Program', 'Restaurant'],
      namePatterns: ['Restaurant', 'Diner', 'Cafe', 'Grill'],
      excludePatterns: ['CVS', 'Walgreens', 'Dollar', 'Market'],
      showStateWarning: true
    },
    { 
      id: 'farmersmarket', 
      name: "Farmer's Market", 
      icon: '🥕',
      activeIcon: '🥕',
      storeTypes: ['Farmers and Markets', 'Farmers Market'],
      namePatterns: ['Farmers Market', 'Farm Market', 'Farmer\'s Market', 'Farmstand', 'Farmers and Markets'],
      excludePatterns: []
    }
  ];

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

  return (
    <div className={`overflow-x-auto ${className}`}>
      <div className="relative">
        <nav 
          className="rounded-2xl bg-gradient-to-r from-neutral-50 to-neutral-100 flex items-center justify-center gap-6 px-6 py-4 min-w-max shadow-lg"
          role="tablist"
          aria-label="Food categories"
        >
          {categories.map((category) => {
            const isActive = activeCategory === category.id;
            
            return (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
                className={`flex flex-col items-center justify-center min-w-[80px] px-4 py-4 transition-all duration-300 hover:opacity-80 rounded-2xl hover:scale-110 ${
                  isActive 
                    ? 'bg-gradient-to-br from-white to-gray-50 shadow-xl border-2 border-primary/30 scale-110 transform' 
                    : 'hover:bg-white/70 hover:shadow-lg'
                }`}
                role="tab"
                aria-selected={isActive}
                aria-controls={`panel-${category.id}`}
              >
                <div className={`w-12 h-12 flex items-center justify-center mb-2 transition-all duration-300 rounded-full ${
                  isActive 
                    ? 'scale-125 bg-gradient-to-br from-primary/10 to-accent/10 shadow-lg' 
                    : 'hover:scale-110 hover:bg-primary/5'
                }`}>
                  <span className={`transition-all duration-300 ${
                    isActive ? 'text-4xl drop-shadow-lg' : 'text-3xl grayscale hover:grayscale-0'
                  }`}>
                    {isActive ? (category.activeIcon || category.icon) : category.icon}
                  </span>
                </div>
                <span className={`text-xs font-bold text-center whitespace-nowrap transition-all duration-300 ${
                  isActive 
                    ? 'text-primary scale-110 drop-shadow-sm' 
                    : 'text-[#484848] hover:text-primary/80'
                }`}>
                  {category.name}
                </span>
              </button>
            );
          })}
        </nav>
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
