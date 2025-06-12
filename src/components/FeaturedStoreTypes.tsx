
import React from 'react';
import { ShoppingCart, Coffee, Utensils, Store } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface FeaturedStoreTypesProps {
  onCategorySelect: (searchTerm: string) => void;
}

export const FeaturedStoreTypes: React.FC<FeaturedStoreTypesProps> = ({ onCategorySelect }) => {
  const storeTypes = [
    {
      icon: ShoppingCart,
      title: 'Grocery Stores',
      description: 'Full-service supermarkets',
      examples: 'Walmart, Safeway, Kroger',
      searchTerm: 'grocery store'
    },
    {
      icon: Store,
      title: 'Convenience Stores',
      description: 'Quick shopping options',
      examples: '7-Eleven, Circle K, Wawa',
      searchTerm: 'convenience store'
    },
    {
      icon: Utensils,
      title: 'Restaurants (RMP)',
      description: 'Hot meals with EBT',
      examples: 'Subway, KFC, participating restaurants',
      searchTerm: 'restaurant'
    },
    {
      icon: Coffee,
      title: 'Specialty Stores',
      description: 'Farmers markets & more',
      examples: 'Farmers markets, specialty food stores',
      searchTerm: 'farmers market'
    }
  ];

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-foreground mb-2">Browse Store Types</h2>
        <p className="text-sm text-muted-foreground">Find different types of stores that accept EBT/SNAP</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {storeTypes.map((type) => {
          const IconComponent = type.icon;
          return (
            <Card 
              key={type.title} 
              className="cursor-pointer hover:shadow-md transition-shadow duration-200 border-2 hover:border-primary/30"
              onClick={() => onCategorySelect(type.searchTerm)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <IconComponent className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground mb-1">{type.title}</h3>
                    <p className="text-sm text-muted-foreground mb-1">{type.description}</p>
                    <p className="text-xs text-muted-foreground">{type.examples}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
