import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { trackCityClick } from '@/utils/analytics';

const POPULAR_CITIES = [
  { name: 'Los Angeles', slug: 'los-angeles', state: 'CA' },
  { name: 'New York', slug: 'new-york', state: 'NY' },
  { name: 'Chicago', slug: 'chicago', state: 'IL' },
  { name: 'Houston', slug: 'houston', state: 'TX' },
  { name: 'Phoenix', slug: 'phoenix', state: 'AZ' },
  { name: 'Philadelphia', slug: 'philadelphia', state: 'PA' },
  { name: 'San Antonio', slug: 'san-antonio', state: 'TX' },
  { name: 'San Diego', slug: 'san-diego', state: 'CA' },
  { name: 'Dallas', slug: 'dallas', state: 'TX' },
  { name: 'Miami', slug: 'miami', state: 'FL' },
  { name: 'Atlanta', slug: 'atlanta', state: 'GA' },
  { name: 'Brooklyn', slug: 'brooklyn', state: 'NY' },
];

interface PopularCitiesProps {
  variant?: 'compact' | 'full';
}

export const PopularCities: React.FC<PopularCitiesProps> = ({ variant = 'compact' }) => {
  const cities = variant === 'compact' ? POPULAR_CITIES.slice(0, 6) : POPULAR_CITIES;

  const handleCityClick = (city: typeof POPULAR_CITIES[0]) => {
    trackCityClick(city.name, city.slug, city.state);
  };

  return (
    <div className="space-y-2">
      <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        Browse by City
      </h3>
      <div className="flex flex-wrap gap-2">
        {cities.map((city) => (
          <Link
            key={city.slug}
            to={`/${city.slug}`}
            onClick={() => handleCityClick(city)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-secondary/50 hover:bg-secondary text-secondary-foreground rounded-full text-xs font-medium transition-colors"
          >
            <MapPin className="h-3 w-3" />
            {city.name}
          </Link>
        ))}
      </div>
    </div>
  );
};
