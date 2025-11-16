import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Search, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

export const PopularSearchesSection: React.FC = () => {
  const popularSearches = [
    { query: 'EBT stores open now', type: 'hours' },
    { query: 'Grocery stores that accept EBT near me', type: 'category' },
    { query: 'Farmers markets with EBT', type: 'category' },
    { query: 'Restaurants that take EBT', type: 'category' },
    { query: 'Walmart with EBT', type: 'store' },
    { query: 'Target EBT policy', type: 'store' },
    { query: '24 hour stores accepting EBT', type: 'hours' },
    { query: 'Convenience stores EBT near me', type: 'category' },
    { query: 'Does Whole Foods accept EBT', type: 'store' },
    { query: 'ALDI EBT accepted', type: 'store' },
    { query: 'Food 4 Less EBT', type: 'store' },
    { query: 'Dollar General SNAP benefits', type: 'store' }
  ];

  const citiesWithHighTraffic = [
    'New York City', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix',
    'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose',
    'Austin', 'Jacksonville', 'Fort Worth', 'Columbus', 'Charlotte',
    'San Francisco', 'Seattle', 'Denver', 'Boston', 'Portland'
  ];

  return (
    <section className="py-12 px-6 bg-muted/10">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Popular Searches */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">Trending EBT Searches</h2>
            </div>
            <Card>
              <CardContent className="pt-6">
                <div className="grid gap-2">
                  {popularSearches.map((search, index) => (
                    <div 
                      key={index}
                      className="flex items-center gap-2 p-2 rounded hover:bg-muted/50 transition-colors cursor-pointer"
                    >
                      <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm text-foreground">{search.query}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Cities */}
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-2">Find EBT Stores by City</h2>
              <p className="text-sm text-muted-foreground">Browse locations in major metropolitan areas</p>
            </div>
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-2">
                  {citiesWithHighTraffic.map((city, index) => (
                    <Link
                      key={index}
                      to={`/search?q=${encodeURIComponent(city)}`}
                      className="text-sm text-primary hover:text-primary/80 hover:underline py-1"
                    >
                      {city} EBT Stores
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* SEO Text Block */}
        <div className="mt-12 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Complete Guide to Finding EBT and SNAP Stores
          </h2>
          <div className="prose prose-sm max-w-none text-muted-foreground space-y-4">
            <p>
              <strong className="text-foreground">EBT Finder</strong> is the most comprehensive directory of stores accepting EBT cards and SNAP benefits in the United States. Our platform helps millions of SNAP recipients locate authorized retailers, from major supermarket chains to local corner stores and farmers markets.
            </p>
            <p>
              Whether you're searching for <strong className="text-foreground">grocery stores that accept EBT</strong>, <strong className="text-foreground">restaurants participating in RMP</strong>, or <strong className="text-foreground">convenience stores near you</strong>, our database covers over 300,000 locations across all 50 states. Find stores open 24 hours, discover farmers markets offering double-value SNAP programs, or locate warehouse clubs like Costco and Sam's Club.
            </p>
            <p>
              Use our advanced filters to search by store type, distance, customer ratings, and hours of operation. Each listing includes verified information such as phone numbers, addresses, business hours, and directions. Read community reviews from other EBT users to learn about their experiences before visiting.
            </p>
            <p>
              <strong className="text-foreground">Popular store chains accepting EBT:</strong> Walmart, Target, Kroger, Safeway, Albertsons, Publix, Food Lion, Whole Foods, Trader Joe's, ALDI, Costco, Sam's Club, 7-Eleven, Dollar General, Family Dollar, CVS, Walgreens, and thousands more local and regional retailers.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
