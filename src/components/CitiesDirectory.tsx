import { Link } from 'react-router-dom';
import { MapPin, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface CityLink {
  slug: string;
  name: string;
  state: string;
  population: string;
  rmpEligible: boolean;
}

const cities: CityLink[] = [
  { slug: 'new-york', name: 'New York', state: 'NY', population: '8.3M', rmpEligible: true },
  { slug: 'los-angeles', name: 'Los Angeles', state: 'CA', population: '3.9M', rmpEligible: true },
  { slug: 'chicago-ebt', name: 'Chicago', state: 'IL', population: '2.7M', rmpEligible: true },
  { slug: 'houston', name: 'Houston', state: 'TX', population: '2.3M', rmpEligible: false },
  { slug: 'phoenix', name: 'Phoenix', state: 'AZ', population: '1.7M', rmpEligible: true },
  { slug: 'philadelphia', name: 'Philadelphia', state: 'PA', population: '1.6M', rmpEligible: true },
  { slug: 'san-antonio', name: 'San Antonio', state: 'TX', population: '1.5M', rmpEligible: false },
  { slug: 'san-diego', name: 'San Diego', state: 'CA', population: '1.4M', rmpEligible: true },
  { slug: 'dallas', name: 'Dallas', state: 'TX', population: '1.3M', rmpEligible: false },
  { slug: 'san-jose', name: 'San Jose', state: 'CA', population: '1.0M', rmpEligible: true },
  { slug: 'austin', name: 'Austin', state: 'TX', population: '978K', rmpEligible: false },
  { slug: 'jacksonville', name: 'Jacksonville', state: 'FL', population: '949K', rmpEligible: false },
  { slug: 'fort-worth', name: 'Fort Worth', state: 'TX', population: '935K', rmpEligible: false },
  { slug: 'columbus', name: 'Columbus', state: 'OH', population: '905K', rmpEligible: false },
  { slug: 'charlotte', name: 'Charlotte', state: 'NC', population: '885K', rmpEligible: false },
  { slug: 'san-francisco', name: 'San Francisco', state: 'CA', population: '874K', rmpEligible: true },
  { slug: 'fresno', name: 'Fresno', state: 'CA', population: '542K', rmpEligible: true }
];

export const CitiesDirectory = () => {
  return (
    <section className="py-16 bg-gradient-to-br from-secondary/5 to-background">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">EBT Stores by City</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Find EBT and SNAP-accepting stores in major cities across the United States. 
            Click on any city to discover local stores, neighborhoods, and ZIP codes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cities.map((city) => (
            <Link key={city.slug} to={`/${city.slug}`}>
              <Card className="p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-card border-border group">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
                    <div>
                      <h3 className="text-2xl font-bold group-hover:text-primary transition-colors">
                        {city.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">{city.state}</p>
                    </div>
                  </div>
                  {city.rmpEligible && (
                    <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      RMP
                    </span>
                  )}
                </div>
                
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Population</span>
                    <span className="font-semibold text-foreground">{city.population}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>EBT Stores</span>
                    <span className="font-semibold text-foreground">1000+</span>
                  </div>
                  <div className="mt-4 pt-4 border-t border-border">
                    <span className="text-primary font-medium group-hover:underline">
                      View {city.name} Stores →
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-muted-foreground">
            Don't see your city? Use our <Link to="/search" className="text-primary hover:underline font-semibold">ZIP code search</Link> to find stores anywhere in the USA.
          </p>
        </div>
      </div>
    </section>
  );
};
