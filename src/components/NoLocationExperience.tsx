import React from 'react';
import { MapPin, Store, Coffee, ShoppingCart, Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Link } from 'react-router-dom';

interface NoLocationExperienceProps {
  onSmartSearch: (query: string) => void;
  onRequestLocation: () => void;
}

const popularStores = [
  { name: 'Walmart', icon: ShoppingCart, query: 'walmart' },
  { name: 'Dollar General', icon: Store, query: 'dollar general' },
  { name: "McDonald's", icon: Coffee, query: "mcdonald's" },
  { name: 'Whole Foods', icon: Leaf, query: 'whole foods' },
];

const popularCities = [
  { name: 'Los Angeles', path: '/los-angeles' },
  { name: 'New York', path: '/new-york' },
  { name: 'Chicago', path: '/chicago-ebt' },
  { name: 'Houston', path: '/houston' },
  { name: 'Phoenix', path: '/phoenix' },
  { name: 'Philadelphia', path: '/philadelphia' },
];

const NoLocationExperience: React.FC<NoLocationExperienceProps> = ({
  onSmartSearch,
  onRequestLocation,
}) => {
  return (
    <div className="py-6 space-y-6 w-full">
      {/* Enable Location CTA */}
      <Card className="p-6 text-center bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <div className="text-4xl mb-4">📍</div>
        <h2 className="text-xl font-bold text-foreground mb-2">
          Find Stores Near You
        </h2>
        <p className="text-muted-foreground text-sm mb-4">
          Enable location to see EBT stores nearby
        </p>
        <Button onClick={onRequestLocation} size="lg" className="w-full">
          <MapPin className="h-4 w-4 mr-2" />
          Enable Location
        </Button>
      </Card>

      {/* Popular Stores - Quick Access */}
      <div>
        <h3 className="font-semibold text-foreground mb-3">Popular Stores</h3>
        <div className="grid grid-cols-2 gap-2">
          {popularStores.map((store) => (
            <button
              key={store.name}
              onClick={() => onSmartSearch(store.query)}
              className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors text-left"
            >
              <store.icon className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">{store.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Browse by City */}
      <div>
        <h3 className="font-semibold text-foreground mb-3">Browse by City</h3>
        <div className="flex flex-wrap gap-2">
          {popularCities.map((city) => (
            <Link
              key={city.name}
              to={city.path}
              className="px-3 py-2 bg-muted/50 rounded-full text-sm hover:bg-muted transition-colors"
            >
              {city.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Trust Signal */}
      <div className="text-center py-4 border-t">
        <p className="text-sm text-muted-foreground">
          🏪 <strong>300,000+</strong> stores nationwide
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Your location is only used to find nearby stores
        </p>
      </div>
    </div>
  );
};

export default NoLocationExperience;