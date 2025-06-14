
import React, { useState } from 'react';

interface Category {
  id: string;
  name: string;
  icon: string;
  activeIcon?: string; // For colorful active state
  storeTypes?: string[]; // Map to actual store types in database
  namePatterns?: string[]; // Additional name patterns to match
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
      namePatterns: ['Market', 'mart', 'Food', 'Grocery']
    },
    { 
      id: 'convenience', 
      name: 'Corner Stores', 
      icon: '🏬',
      activeIcon: '🏬',
      storeTypes: ['Convenience Store', 'Corner Store'],
      namePatterns: ['7-Eleven', '7 Eleven', 'Circle K', 'Wawa', 'Sheetz']
    },
    { 
      id: 'dollar', 
      name: 'Dollar Stores', 
      icon: '💵',
      activeIcon: '💵',
      storeTypes: ['Dollar Store', 'Discount Store', 'Other'],
      namePatterns: ['Dollar', '99', 'Cent', 'Discount', 'Family Dollar', 'Dollar Tree', 'Dollar General', '99 Cent']
    },
    { 
      id: 'pharmacy', 
      name: 'Pharmacy', 
      icon: '💊',
      activeIcon: '💊',
      storeTypes: ['Pharmacy', 'Drug Store'],
      namePatterns: ['CVS', 'Walgreens', 'Rite Aid', 'Pharmacy', 'Drug', 'Duane Reade']
    },
    { 
      id: 'farmers', 
      name: 'Farmers Markets', 
      icon: '🥕',
      activeIcon: '🥕',
      storeTypes: ['Farmers Market', 'Market'],
      namePatterns: ['Farmers Market', 'Farm Market', 'Produce Market']
    },
    { 
      id: 'hotmeals', 
      name: 'Hot Meals (RMP)', 
      icon: '🍽️',
      activeIcon: '🍽️',
      storeTypes: ['Restaurant Meals Program', 'Restaurant'],
      namePatterns: ['Restaurant', 'Diner', 'Cafe', 'Grill'],
      showStateWarning: true
    }
  ];

  const handleCategoryClick = (categoryId: string) => {
    setActiveCategory(categoryId);
    const category = categories.find(c => c.id === categoryId);
    
    // Show RMP state warning if applicable
    if (category?.showStateWarning) {
      // You can add a toast notification here or handle the warning in the parent component
      console.log('RMP category selected - may need state warning');
    }
    
    if (onCategoryChange) {
      onCategoryChange(categoryId, category?.storeTypes || [], category?.namePatterns || []);
    }
  };

  return (
    <div className={`overflow-x-auto ${className}`}>
      <nav 
        className="rounded bg-neutral-100 flex items-center justify-center gap-[30px] px-4 py-2 min-w-max"
        role="tablist"
        aria-label="Food categories"
      >
        {categories.map((category) => {
          const isActive = activeCategory === category.id;
          
          return (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className={`flex flex-col items-center justify-center min-w-[55px] px-2 py-2 transition-all duration-200 hover:opacity-80 rounded-lg ${
                isActive 
                  ? 'bg-white shadow-sm border-2 border-primary/20 scale-105' 
                  : 'hover:bg-white/50'
              }`}
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${category.id}`}
            >
              <div className={`w-[31px] h-[31px] flex items-center justify-center mb-1 transition-all duration-200 ${
                isActive ? 'scale-110' : 'grayscale hover:grayscale-0'
              }`}>
                <span className="text-2xl">
                  {isActive ? (category.activeIcon || category.icon) : category.icon}
                </span>
              </div>
              <span className={`text-[10px] font-bold text-center whitespace-nowrap transition-colors duration-200 ${
                isActive ? 'text-primary' : 'text-[#484848]'
              }`}>
                {category.name}
              </span>
            </button>
          );
        })}
      </nav>
      
      {/* RMP State Warning */}
      {activeCategory === 'hotmeals' && (
        <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm">
          <p className="text-amber-800 mb-2">
            <strong>Restaurant Meals Program (RMP):</strong> Your state may not have RMP available. 
            This program is only available in certain states and for eligible SNAP recipients (elderly, disabled, or homeless).
          </p>
          <a 
            href="https://www.fns.usda.gov/snap/retailer/restaurant-meals-program"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline font-medium"
          >
            Learn more about RMP eligibility and participating states →
          </a>
        </div>
      )}
    </div>
  );
};
