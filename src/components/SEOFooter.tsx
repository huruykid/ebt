
import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';

export const SEOFooter: React.FC = () => {
  const topCities = [
    { name: 'Los Angeles', slug: 'los-angeles' },
    { name: 'Chicago', slug: 'chicago-ebt' },
    { name: 'Houston', slug: 'houston' },
    { name: 'Phoenix', slug: 'phoenix' },
    { name: 'Philadelphia', slug: 'philadelphia' },
    { name: 'San Antonio', slug: 'san-antonio' },
    { name: 'San Diego', slug: 'san-diego' },
    { name: 'Dallas', slug: 'dallas' },
    { name: 'San Jose', slug: 'san-jose' },
    { name: 'Austin', slug: 'austin' },
    { name: 'Jacksonville', slug: 'jacksonville' },
    { name: 'Fort Worth', slug: 'fort-worth' },
    { name: 'Columbus', slug: 'columbus' },
    { name: 'Charlotte', slug: 'charlotte' },
    { name: 'San Francisco', slug: 'san-francisco' },
    { name: 'Fresno', slug: 'fresno' }
  ];

  return (
    <footer className="bg-muted/30 border-t mt-16">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* About EBT Finder - Link Building Section */}
        <div className="mb-12 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-foreground mb-4">About EBT Finder</h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              EBT Finder is a free tool that helps families and individuals find EBT-accepting stores, 
              hot meal providers (RMP), and more — based on location. Our comprehensive database makes 
              it easy to locate SNAP-approved retailers, farmers markets, and restaurants across the 
              United States. Whether you need groceries, fresh produce, or hot meals, EBT Finder 
              connects you with local businesses that accept your benefits.
            </p>
          </div>
        </div>

        {/* Location-Based SEO Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-4">Where can I use EBT near me?</h2>
          <p className="text-muted-foreground mb-6 max-w-3xl">
            EBT Finder supports searches in all major U.S. cities and ZIP codes. Whether you're in Los Angeles, Houston, or Atlanta, we help you find EBT-accepting locations with ease. Our database includes grocery stores, convenience stores, farmers markets, and restaurants that accept SNAP benefits and participate in the Restaurant Meals Program (RMP).
          </p>
          
          {/* Top Cities with Links */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-foreground mb-3">Find EBT Stores in Top Cities:</h3>
            <div className="flex flex-wrap gap-2">
              {topCities.map((city, index) => (
                <span key={city.slug}>
                  <Link 
                    to={`/${city.slug}`} 
                    className="text-primary hover:text-primary/80 hover:underline"
                  >
                    {city.name}
                  </Link>
                  {index < topCities.length - 1 && <span className="text-muted-foreground mx-2">•</span>}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Helpful Links */}
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">EBT & SNAP Information</h3>
            <ul className="space-y-2">
              <li>
                <a 
                  href="https://www.fns.usda.gov/snap/supplemental-nutrition-assistance-program"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80 flex items-center gap-1"
                >
                  How to Apply for SNAP <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a 
                  href="https://www.fns.usda.gov/snap/retailer/restaurant-meals-program"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80 flex items-center gap-1"
                >
                  What is RMP (Restaurant Meals Program)? <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a 
                  href="https://www.fns.usda.gov/snap/eligible-food-items"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80 flex items-center gap-1"
                >
                  What Can I Buy with EBT? <ExternalLink className="h-3 w-3" />
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Store Types</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>Grocery Stores & Supermarkets</li>
              <li>Convenience Stores</li>
              <li>Farmers Markets</li>
              <li>Restaurants (RMP Eligible)</li>
              <li>Wholesale Clubs</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">About EBT Finder</h3>
            <ul className="space-y-2">
              <li><Link to="/mission" className="text-primary hover:text-primary/80">Our Mission</Link></li>
              <li><Link to="/support" className="text-primary hover:text-primary/80">Support</Link></li>
              <li><Link to="/privacy-policy" className="text-primary hover:text-primary/80">Privacy Policy</Link></li>
              <li><Link to="/add-store" className="text-primary hover:text-primary/80">Add a Store</Link></li>
              <li><Link to="/report" className="text-primary hover:text-primary/80">Report a Store</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2024 EBT Finder. Helping families find SNAP-accepting stores and restaurants across the United States.</p>
          <p className="mt-2">
            Data sourced from USDA SNAP Retailer Locator. Store information updated regularly for accuracy.
          </p>
          <p className="mt-2">
            <Link to="/" className="text-primary hover:text-primary/80 font-medium">
              https://ebtfinder.org
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
};
