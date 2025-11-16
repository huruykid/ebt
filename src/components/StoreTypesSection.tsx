import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ShoppingCart, Store, Apple, Utensils, Building2, Warehouse } from 'lucide-react';

export const StoreTypesSection: React.FC = () => {
  const storeTypes = [
    {
      icon: ShoppingCart,
      title: 'Grocery Stores',
      description: 'Major supermarket chains and local grocers that accept EBT cards. Find Walmart, Kroger, Safeway, Albertsons, and more.',
      keywords: 'grocery stores, supermarkets, food markets'
    },
    {
      icon: Store,
      title: 'Convenience Stores',
      description: 'Quick-stop shops and gas stations accepting SNAP benefits. Includes 7-Eleven, Circle K, and local convenience stores.',
      keywords: 'convenience stores, corner stores, bodegas'
    },
    {
      icon: Apple,
      title: 'Farmers Markets',
      description: 'Fresh, local produce at farmers markets that accept EBT. Many offer double-value programs for SNAP recipients.',
      keywords: 'farmers markets, fresh produce, local farms'
    },
    {
      icon: Utensils,
      title: 'RMP Restaurants',
      description: 'Hot meal providers through the Restaurant Meals Program for eligible seniors, disabled, and homeless individuals.',
      keywords: 'restaurant meals program, hot meals, prepared food'
    },
    {
      icon: Building2,
      title: 'Specialty Stores',
      description: 'Ethnic grocers, health food stores, and specialty retailers accepting EBT for diverse food options.',
      keywords: 'specialty stores, ethnic markets, health food'
    },
    {
      icon: Warehouse,
      title: 'Warehouse Clubs',
      description: 'Bulk shopping at Costco, Sam\'s Club, and BJ\'s Wholesale Club with your SNAP benefits for better value.',
      keywords: 'warehouse clubs, bulk shopping, wholesale'
    }
  ];

  return (
    <section className="py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-foreground mb-3">Types of Stores That Accept EBT & SNAP</h2>
          <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
            Find every type of retailer that accepts SNAP benefits. From grocery stores to farmers markets, we help you locate authorized EBT vendors in your area.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {storeTypes.map((type, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <type.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground mb-2">{type.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-2">{type.description}</p>
                    <div className="text-xs text-primary/70 italic">{type.keywords}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
