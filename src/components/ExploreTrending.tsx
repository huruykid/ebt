
import React, { useState } from 'react';
import { Header } from './Header';
import { SearchBar } from './SearchBar';
import { CategoryTabs } from './CategoryTabs';
import { RestaurantCard } from './RestaurantCard';
import { BottomNavigation } from './BottomNavigation';
import { useNavigate } from 'react-router-dom';

export const ExploreTrending: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('trending');
  const navigate = useNavigate();

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    console.log('Searching for:', query);
    // Navigate to search page with query
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId);
    console.log('Category changed to:', categoryId);
  };

  const handleViewDetails = (restaurantId: string) => {
    console.log('View details for restaurant:', restaurantId);
  };

  const handleNavigate = (itemId: string) => {
    console.log('Navigate to:', itemId);
    if (itemId === 'search') {
      navigate('/search');
    }
  };

  return (
    <div className="bg-neutral-100 flex max-w-[480px] w-full flex-col overflow-hidden items-stretch mx-auto pt-3">
      <div className="flex w-full flex-col items-stretch px-3.5">
        <Header className="self-center flex w-full max-w-[335px] items-stretch gap-5 justify-between" />
        
        <SearchBar 
          onSearch={handleSearch}
          className="mt-4"
        />
      </div>

      <CategoryTabs 
        onCategoryChange={handleCategoryChange}
        className="mt-4"
      />

      <main className="self-center flex h-[597px] w-full max-w-[336px] flex-col overflow-hidden items-center font-bold mt-4">
        <section className="w-full">
          <RestaurantCard
            id="dolls-kitchen"
            name="Dolls Kitchen"
            address="4532 N. Blackstone Ave, Fresno, CA"
            category="hot food, Soul food"
            rating={4.2}
            imageUrl="https://cdn.builder.io/api/v1/image/assets/107acf227ed0407ab298bbec90bffe3b/25adcacf75cbb3b014b1012342e27801296f92b1?placeholderIfAbsent=true"
            onViewDetails={handleViewDetails}
          />
          
          <img
            src="https://cdn.builder.io/api/v1/image/assets/107acf227ed0407ab298bbec90bffe3b/fd328a0d4171d8484ce503d1336ae9cbbeba6743?placeholderIfAbsent=true"
            alt="Additional restaurant content"
            className="aspect-[1.57] object-contain w-full mt-[29px] rounded-lg"
          />
        </section>
      </main>

      <BottomNavigation onNavigate={handleNavigate} />
    </div>
  );
};

export default ExploreTrending;
