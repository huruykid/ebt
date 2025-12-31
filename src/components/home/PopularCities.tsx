import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';

const POPULAR_CITIES = [
  { name: 'Los Angeles', slug: 'los-angeles-ca', state: 'CA' },
  { name: 'New York', slug: 'new-york-ny', state: 'NY' },
  { name: 'Chicago', slug: 'chicago-il', state: 'IL' },
  { name: 'Houston', slug: 'houston-tx', state: 'TX' },
  { name: 'Phoenix', slug: 'phoenix-az', state: 'AZ' },
  { name: 'Philadelphia', slug: 'philadelphia-pa', state: 'PA' },
  { name: 'San Antonio', slug: 'san-antonio-tx', state: 'TX' },
  { name: 'San Diego', slug: 'san-diego-ca', state: 'CA' },
];

interface PopularCitiesProps {
  variant?: 'compact' | 'full';
}

export const PopularCities: React.FC<PopularCitiesProps> = ({ variant = 'compact' }) => {
  const cities = variant === 'compact' ? POPULAR_CITIES.slice(0, 5) : POPULAR_CITIES;

  return (
    <div className="space-y-2">
      <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        Browse by City
      </h3>
      <div className="flex flex-wrap gap-2">
        {cities.map((city) => (
          <Link
            key={city.slug}
            to={`/city/${city.slug}`}
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
