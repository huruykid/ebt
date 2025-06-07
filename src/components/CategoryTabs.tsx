import React, { useState } from 'react';

interface Category {
  id: string;
  name: string;
  icon: string;
  isActive?: boolean;
}

interface CategoryTabsProps {
  onCategoryChange?: (categoryId: string) => void;
  className?: string;
}

export const CategoryTabs: React.FC<CategoryTabsProps> = ({ 
  onCategoryChange,
  className = ""
}) => {
  const [activeCategory, setActiveCategory] = useState('trending');

  const categories: Category[] = [
    { id: 'trending', name: 'Trending', icon: 'https://cdn.builder.io/api/v1/image/assets/107acf227ed0407ab298bbec90bffe3b/84a53db7192571e4f81ae7fea35d1049ed61331a?placeholderIfAbsent=true', isActive: true },
    { id: 'grocery', name: 'Grocery Store', icon: '', isActive: false },
    { id: 'fastfood', name: 'Fast Food', icon: 'https://cdn.builder.io/api/v1/image/assets/107acf227ed0407ab298bbec90bffe3b/25b026a8835e0580160584d741f3eb34bdd700ff?placeholderIfAbsent=true', isActive: false },
    { id: 'bakery', name: 'Bakery', icon: 'https://cdn.builder.io/api/v1/image/assets/107acf227ed0407ab298bbec90bffe3b/0e0eb0d8b84c0ff7b3c5f356798b854a2fead4f7?placeholderIfAbsent=true', isActive: false },
    { id: 'convenience', name: 'Corner Stores', icon: 'https://cdn.builder.io/api/v1/image/assets/107acf227ed0407ab298bbec90bffe3b/01efcd486066ad0e23741e85f7ef0e703475631b?placeholderIfAbsent=true', isActive: false },
    { id: 'dollar', name: 'Dollar Stores', icon: '', isActive: false }
  ];

  const handleCategoryClick = (categoryId: string) => {
    setActiveCategory(categoryId);
    if (onCategoryChange) {
      onCategoryChange(categoryId);
    }
  };

  return (
    <nav 
      className={`rounded bg-neutral-100 overflow-x-auto flex mr-[-134px] items-center gap-[30px] overflow-hidden justify-center ${className}`}
      role="tablist"
      aria-label="Food categories"
    >
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => handleCategoryClick(category.id)}
          className={`${
            category.id === 'trending' 
              ? 'self-stretch flex flex-col items-center w-[55px] my-auto' 
              : category.id === 'grocery'
              ? 'text-[#484848] self-stretch text-[10px] font-bold my-auto'
              : category.id === 'fastfood'
              ? 'self-stretch flex flex-col items-center text-[10px] text-[#484848] font-bold my-auto px-[5px]'
              : category.id === 'bakery'
              ? 'self-stretch flex flex-col items-center text-[10px] text-[#484848] font-bold whitespace-nowrap my-auto'
              : category.id === 'convenience'
              ? 'self-stretch flex flex-col items-center text-[10px] text-[#484848] font-bold my-auto'
              : 'self-stretch flex flex-col items-center my-auto'
          } hover:opacity-80 transition-opacity`}
          role="tab"
          aria-selected={activeCategory === category.id}
          aria-controls={`panel-${category.id}`}
        >
          {category.id === 'trending' && (
            <>
              <div className="flex flex-col items-center text-[10px] text-[#484848] font-bold whitespace-nowrap justify-center">
                <img
                  src={category.icon}
                  alt={`${category.name} icon`}
                  className="aspect-[0.97] object-contain w-[31px]"
                />
                <div className="text-[#484848]">
                  {category.name}
                </div>
              </div>
              <div className="w-[55px]">
                <div className="border min-h-0 w-full border-black border-solid" />
              </div>
            </>
          )}
          
          {category.id === 'grocery' && category.name}
          
          {(category.id === 'fastfood' || category.id === 'bakery' || category.id === 'convenience') && (
            <>
              <img
                src={category.icon}
                alt={`${category.name} icon`}
                className={
                  category.id === 'fastfood' 
                    ? "aspect-[1] object-contain w-[34px]"
                    : category.id === 'bakery'
                    ? "aspect-[0.97] object-contain w-[31px]"
                    : "aspect-[1] object-contain w-[31px]"
                }
              />
              <div className="text-[#484848]">
                {category.name}
              </div>
            </>
          )}
          
          {category.id === 'dollar' && (
            <>
              <div className="w-[31px] overflow-hidden text-xs text-black font-semibold whitespace-nowrap">
                <div className="bg-black flex flex-col items-center w-full h-[31px] pt-[11px] pb-0.5 px-[3px]">
                  <div className="min-h-[18px]">
                    $1
                  </div>
                </div>
              </div>
              <div className="text-[#484848] text-[10px] font-bold">
                {category.name}
              </div>
            </>
          )}
        </button>
      ))}
    </nav>
  );
};
