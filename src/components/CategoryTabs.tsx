
import React, { useState } from 'react';

interface Category {
  id: string;
  name: string;
  icon: string;
  activeIcon?: string; // For colorful active state
  storeTypes?: string[]; // Map to actual store types in database
}

interface CategoryTabsProps {
  onCategoryChange?: (categoryId: string, storeTypes?: string[]) => void;
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
      storeTypes: ['Supermarket', 'Grocery Store', 'Supercenter'] 
    },
    { 
      id: 'fastfood', 
      name: 'Fast Food', 
      icon: '🍔',
      activeIcon: '🍔',
      storeTypes: ['Fast Food Restaurant', 'Restaurant'] 
    },
    { 
      id: 'hotmeals', 
      name: 'Hot Meals (RMP)', 
      icon: '🍽️',
      activeIcon: '🍽️',
      storeTypes: ['Restaurant', 'Fast Food Restaurant', 'Cafeteria'] 
    },
    { 
      id: 'bakery', 
      name: 'Bakery', 
      icon: '🥖',
      activeIcon: '🥖',
      storeTypes: ['Bakery'] 
    },
    { 
      id: 'convenience', 
      name: 'Corner Stores', 
      icon: '🏬',
      activeIcon: '🏬',
      storeTypes: ['Convenience Store', 'Corner Store'] 
    },
    { 
      id: 'dollar', 
      name: 'Dollar Stores', 
      icon: '💵',
      activeIcon: '💵',
      storeTypes: ['Dollar Store', 'Discount Store'] 
    }
  ];

  const handleCategoryClick = (categoryId: string) => {
    setActiveCategory(categoryId);
    const category = categories.find(c => c.id === categoryId);
    if (onCategoryChange) {
      onCategoryChange(categoryId, category?.storeTypes);
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
    </div>
  );
};
