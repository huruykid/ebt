
import React, { useState } from 'react';

interface Category {
  id: string;
  name: string;
  icon: string;
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
      icon: 'https://cdn.builder.io/api/v1/image/assets/107acf227ed0407ab298bbec90bffe3b/84a53db7192571e4f81ae7fea35d1049ed61331a?placeholderIfAbsent=true' 
    },
    { 
      id: 'grocery', 
      name: 'Grocery Store', 
      icon: '', 
      storeTypes: ['Supermarket', 'Grocery Store', 'Supercenter'] 
    },
    { 
      id: 'fastfood', 
      name: 'Fast Food', 
      icon: 'https://cdn.builder.io/api/v1/image/assets/107acf227ed0407ab298bbec90bffe3b/25b026a8835e0580160584d741f3eb34bdd700ff?placeholderIfAbsent=true', 
      storeTypes: ['Fast Food Restaurant', 'Restaurant'] 
    },
    { 
      id: 'bakery', 
      name: 'Bakery', 
      icon: 'https://cdn.builder.io/api/v1/image/assets/107acf227ed0407ab298bbec90bffe3b/0e0eb0d8b84c0ff7b3c5f356798b854a2fead4f7?placeholderIfAbsent=true', 
      storeTypes: ['Bakery'] 
    },
    { 
      id: 'convenience', 
      name: 'Corner Stores', 
      icon: 'https://cdn.builder.io/api/v1/image/assets/107acf227ed0407ab298bbec90bffe3b/01efcd486066ad0e23741e85f7ef0e703475631b?placeholderIfAbsent=true', 
      storeTypes: ['Convenience Store', 'Corner Store'] 
    },
    { 
      id: 'dollar', 
      name: 'Dollar Stores', 
      icon: '', 
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
        className="rounded bg-neutral-100 flex items-center gap-[30px] px-4 py-2 min-w-max"
        role="tablist"
        aria-label="Food categories"
      >
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => handleCategoryClick(category.id)}
            className={`flex flex-col items-center min-w-[55px] px-2 py-2 transition-opacity hover:opacity-80 ${
              activeCategory === category.id ? 'border-b-2 border-black' : ''
            }`}
            role="tab"
            aria-selected={activeCategory === category.id}
            aria-controls={`panel-${category.id}`}
          >
            {category.icon ? (
              <img
                src={category.icon}
                alt={`${category.name} icon`}
                className="w-[31px] h-[31px] object-contain mb-1"
              />
            ) : category.id === 'grocery' ? (
              <div className="w-[31px] h-[31px] bg-green-100 rounded flex items-center justify-center mb-1">
                <span className="text-green-600 font-bold text-xs">🏪</span>
              </div>
            ) : category.id === 'dollar' ? (
              <div className="w-[31px] h-[31px] bg-black flex items-center justify-center mb-1 rounded">
                <span className="text-white font-semibold text-xs">$1</span>
              </div>
            ) : null}
            <span className="text-[10px] text-[#484848] font-bold text-center whitespace-nowrap">
              {category.name}
            </span>
          </button>
        ))}
      </nav>
    </div>
  );
};
