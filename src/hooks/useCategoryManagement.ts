
import { useState, useEffect } from 'react';
import { CATEGORY_RADIUS } from '@/constants/searchConstants';

export const useCategoryManagement = () => {
  const [activeCategory, setActiveCategory] = useState('trending');
  const [selectedStoreTypes, setSelectedStoreTypes] = useState<string[]>([]);
  const [selectedNamePatterns, setSelectedNamePatterns] = useState<string[]>([]);
  const [radius, setRadius] = useState(10);

  useEffect(() => {
    const categoryRadius = CATEGORY_RADIUS[activeCategory] || CATEGORY_RADIUS.default;
    setRadius(categoryRadius);
  }, [activeCategory]);

  const handleCategoryChange = (categoryId: string, storeTypes: string[] = [], namePatterns: string[] = []) => {
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
