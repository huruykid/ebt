
import { useState, useEffect } from 'react';
import { CATEGORY_RADIUS } from '@/constants/storeSearchConstants';

export const useCategoryManagement = () => {
  const [activeCategory, setActiveCategory] = useState('trending');
  const [selectedStoreTypes, setSelectedStoreTypes] = useState<string[]>([]);
  const [selectedNamePatterns, setSelectedNamePatterns] = useState<string[]>([]);
  const [radius, setRadius] = useState(10);

  // Adjust radius based on category
  useEffect(() => {
    const categoryRadius = CATEGORY_RADIUS[activeCategory] || CATEGORY_RADIUS.default;
    setRadius(categoryRadius);
  }, [activeCategory]);

  const handleCategoryChange = (categoryId: string, storeTypes: string[] = [], namePatterns: string[] = []) => {
    console.log('🔄 Category change called with:', { categoryId, storeTypes, namePatterns });
    
    setActiveCategory(categoryId);
    setSelectedStoreTypes(storeTypes);
    setSelectedNamePatterns(namePatterns);
  };

  return {
    activeCategory,
    selectedStoreTypes,
    selectedNamePatterns,
    radius,
    setRadius,
    handleCategoryChange
  };
};
