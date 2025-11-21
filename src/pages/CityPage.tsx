import React from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { SearchContainer } from '@/components/store-search/SearchContainer';
import { SEOFooter } from '@/components/SEOFooter';
import { FAQSection } from '@/components/FAQSection';
import { CityPageSEO } from '@/components/CityPageSEO';
import { BreadcrumbNavigation } from '@/components/BreadcrumbNavigation';
import { MapPin, Store, Users, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface CityData {
  name: string;
  state: string;
  stateAbbr: string;
  zipCodes: string[];
  description: string;
  coordinates: { lat: number; lng: number };
  population: string;
  neighborhoods: string[];
  popularStores: string[];
  rmpEligible: boolean;
}

const cityData: Record<string, CityData> = {
  'los-angeles': {
    name: 'Los Angeles',
    state: 'California',
    stateAbbr: 'CA',
    zipCodes: ['90001', '90002', '90003', '90004', '90005', '90012', '90013', '90014', '90015', '90017', '90028', '90038', '90046', '90048', '90049', '90064', '90066', '90067', '90068', '90069'],
    description: 'Los Angeles, California offers thousands of EBT and SNAP-accepting locations throughout the greater LA area. From downtown LA to Hollywood, Beverly Hills to Santa Monica, our comprehensive database helps LA residents find grocery stores, farmers markets, and participating restaurants. California participates in the Restaurant Meals Program (RMP), making LA an excellent city for EBT hot meal purchases at qualified restaurants.',
    coordinates: { lat: 34.0522, lng: -118.2437 },
    population: '3.9M',
    neighborhoods: ['Downtown LA', 'Hollywood', 'Beverly Hills', 'Santa Monica', 'Venice Beach', 'Koreatown', 'Westwood', 'Silver Lake'],
    popularStores: ['Ralphs', 'Vons', 'Trader Joe\'s', 'Whole Foods', 'Walmart', 'Target', 'Food 4 Less'],
    rmpEligible: true
  },
  'new-york': {
    name: 'New York',
    state: 'New York',
    stateAbbr: 'NY',
    zipCodes: ['10001', '10002', '10003', '10004', '10005', '10009', '10010', '10011', '10012', '10013', '10014', '10016', '10017', '10018', '10019', '10021', '10022', '10023', '10024', '10025'],
    description: 'New York City offers the most comprehensive EBT and SNAP acceptance in the nation. From Manhattan to Brooklyn, Queens to the Bronx, find thousands of grocery stores, bodegas, farmers markets, and restaurants accepting EBT. NYC participates in the Restaurant Meals Program (RMP), allowing eligible residents to purchase hot meals at participating restaurants.',
    coordinates: { lat: 40.7128, lng: -74.0060 },
    population: '8.3M',
    neighborhoods: ['Manhattan', 'Brooklyn', 'Queens', 'Bronx', 'Staten Island', 'Harlem', 'East Village', 'Williamsburg'],
    popularStores: ['Key Food', 'Food Bazaar', 'C-Town', 'Met Foods', 'Fairway', 'Whole Foods', 'Target'],
    rmpEligible: true
  },
  'chicago-ebt': {
    name: 'Chicago',
    state: 'Illinois',
    stateAbbr: 'IL',
    zipCodes: ['60601', '60602', '60603', '60604', '60605', '60606', '60607', '60610', '60611', '60614', '60618', '60622', '60642', '60647', '60657'],
    description: 'Chicago EBT users can find thousands of SNAP-accepting locations across the Windy City. Illinois participates in the Restaurant Meals Program (RMP), making Chicago one of the best cities for EBT hot meal purchases at participating restaurants.',
    coordinates: { lat: 41.8781, lng: -87.6298 },
    population: '2.7M',
    neighborhoods: ['The Loop', 'Lincoln Park', 'Wicker Park', 'Hyde Park', 'South Side', 'North Side', 'West Loop', 'River North'],
    popularStores: ['Jewel-Osco', 'Mariano\'s', 'Aldi', 'Walmart', 'Target', 'Whole Foods', 'Pete\'s Fresh Market'],
    rmpEligible: true
  },
  'houston': {
    name: 'Houston',
    state: 'Texas',
    stateAbbr: 'TX',
    zipCodes: ['77001', '77002', '77003', '77004', '77005', '77006', '77007', '77008', '77019', '77025', '77027', '77030', '77056', '77057', '77063'],
    description: 'Houston, Texas offers extensive EBT and SNAP-accepting stores throughout the Greater Houston area. Our database covers all major Houston neighborhoods with thousands of participating retailers including H-E-B, Kroger, Walmart, and local Hispanic markets.',
    coordinates: { lat: 29.7604, lng: -95.3698 },
    population: '2.3M',
    neighborhoods: ['Downtown', 'The Heights', 'Montrose', 'Midtown', 'River Oaks', 'Bellaire', 'Galleria', 'Energy Corridor'],
    popularStores: ['H-E-B', 'Kroger', 'Walmart', 'Fiesta Mart', 'Food Town', 'Target', 'Aldi'],
    rmpEligible: false
  },
  'phoenix': {
    name: 'Phoenix',
    state: 'Arizona',
    stateAbbr: 'AZ',
    zipCodes: ['85001', '85003', '85004', '85006', '85007', '85008', '85012', '85014', '85016', '85018', '85020', '85028', '85032', '85040', '85044'],
    description: 'Phoenix, Arizona residents can locate EBT and SNAP-accepting stores throughout the Valley of the Sun. Arizona participates in the Restaurant Meals Program (RMP), allowing eligible EBT users to purchase hot meals at participating restaurants.',
    coordinates: { lat: 33.4484, lng: -112.0740 },
    population: '1.7M',
    neighborhoods: ['Downtown Phoenix', 'Scottsdale', 'Tempe', 'Mesa', 'Glendale', 'Chandler', 'Paradise Valley', 'Arcadia'],
    popularStores: ['Fry\'s Food Stores', 'Safeway', 'Walmart', 'Target', 'Sprouts', 'Albertsons', 'Basha\'s'],
    rmpEligible: true
  },
  'philadelphia': {
    name: 'Philadelphia',
    state: 'Pennsylvania',
    stateAbbr: 'PA',
    zipCodes: ['19101', '19102', '19103', '19104', '19106', '19107', '19122', '19123', '19125', '19130', '19131', '19134', '19140', '19145', '19146'],
    description: 'Philadelphia, Pennsylvania offers extensive EBT and SNAP-accepting locations throughout the City of Brotherly Love. Pennsylvania participates in the Restaurant Meals Program (RMP) in select areas, allowing qualified EBT users to purchase prepared meals.',
    coordinates: { lat: 39.9526, lng: -75.1652 },
    population: '1.6M',
    neighborhoods: ['Center City', 'South Philly', 'Fishtown', 'West Philadelphia', 'University City', 'Old City', 'Northern Liberties', 'Manayunk'],
    popularStores: ['ACME Markets', 'ShopRite', 'Giant', 'Walmart', 'Target', 'Whole Foods', 'Fresh Grocer'],
    rmpEligible: true
  },
  'san-antonio': {
    name: 'San Antonio',
    state: 'Texas',
    stateAbbr: 'TX',
    zipCodes: ['78201', '78202', '78203', '78204', '78205', '78207', '78208', '78209', '78210', '78212', '78213', '78215', '78216', '78217', '78228'],
    description: 'San Antonio, Texas residents can find EBT and SNAP-accepting stores throughout the Alamo City. Our database covers all major San Antonio areas with retailers like H-E-B, Walmart, Target, and local Hispanic markets accepting EBT benefits.',
    coordinates: { lat: 29.4241, lng: -98.4936 },
    population: '1.5M',
    neighborhoods: ['Downtown', 'Alamo Heights', 'Stone Oak', 'Medical Center', 'Riverwalk', 'Southtown', 'Monte Vista', 'King William'],
    popularStores: ['H-E-B', 'Walmart', 'Target', 'Fiesta', 'La Michoacana', 'Food Town', 'Sprouts'],
    rmpEligible: false
  },
  'san-diego': {
    name: 'San Diego',
    state: 'California',
    stateAbbr: 'CA',
    zipCodes: ['92101', '92102', '92103', '92104', '92105', '92106', '92107', '92109', '92110', '92111', '92113', '92114', '92115', '92116', '92117'],
    description: 'San Diego, California offers numerous EBT and SNAP-accepting locations throughout America\'s Finest City. California participates in the Restaurant Meals Program (RMP), making San Diego an excellent city for EBT hot meal purchases.',
    coordinates: { lat: 32.7157, lng: -117.1611 },
    population: '1.4M',
    neighborhoods: ['Downtown', 'La Jolla', 'Pacific Beach', 'Chula Vista', 'North Park', 'Hillcrest', 'Ocean Beach', 'Point Loma'],
    popularStores: ['Vons', 'Ralphs', 'Walmart', 'Target', 'Sprouts', 'Whole Foods', 'Northgate Market'],
    rmpEligible: true
  },
  'dallas': {
    name: 'Dallas',
    state: 'Texas',
    stateAbbr: 'TX',
    zipCodes: ['75201', '75202', '75203', '75204', '75205', '75206', '75207', '75208', '75209', '75214', '75218', '75219', '75220', '75223', '75225'],
    description: 'Dallas, Texas residents can locate EBT and SNAP-accepting stores throughout the Dallas-Fort Worth metroplex. Our database covers all major Dallas neighborhoods with major retailers like Kroger, Tom Thumb, Walmart, and local Hispanic markets.',
    coordinates: { lat: 32.7767, lng: -96.7970 },
    population: '1.3M',
    neighborhoods: ['Downtown Dallas', 'Deep Ellum', 'Uptown', 'Oak Cliff', 'Bishop Arts', 'Highland Park', 'Lake Highlands', 'Preston Hollow'],
    popularStores: ['Kroger', 'Tom Thumb', 'Walmart', 'Target', 'Fiesta', 'Aldi', 'Market Street'],
    rmpEligible: false
  },
  'san-jose': {
    name: 'San Jose',
    state: 'California',
    stateAbbr: 'CA',
    zipCodes: ['95101', '95110', '95111', '95112', '95116', '95117', '95118', '95119', '95120', '95121', '95122', '95123', '95124', '95125', '95126'],
    description: 'San Jose, California offers extensive EBT and SNAP-accepting locations throughout Silicon Valley. California participates in the Restaurant Meals Program (RMP), making San Jose excellent for EBT hot meal purchases at qualified restaurants.',
    coordinates: { lat: 37.3382, lng: -121.8863 },
    population: '1.0M',
    neighborhoods: ['Downtown San Jose', 'Almaden Valley', 'Willow Glen', 'East San Jose', 'Evergreen', 'Rose Garden', 'Japantown', 'Cambrian'],
    popularStores: ['Safeway', 'Lucky', 'Walmart', 'Target', 'Whole Foods', 'Trader Joe\'s', 'Mi Pueblo'],
    rmpEligible: true
  },
  'austin': {
    name: 'Austin',
    state: 'Texas',
    stateAbbr: 'TX',
    zipCodes: ['78701', '78702', '78703', '78704', '78705', '78721', '78722', '78723', '78724', '78725', '78726', '78731', '78741', '78745', '78751'],
    description: 'Austin, Texas residents can find EBT and SNAP-accepting stores throughout the Live Music Capital. Our database covers all major Austin neighborhoods and surrounding Travis County areas with major retailers and local markets.',
    coordinates: { lat: 30.2672, lng: -97.7431 },
    population: '978K',
    neighborhoods: ['Downtown', 'South Austin', 'East Austin', 'West Lake Hills', 'Hyde Park', 'Zilker', 'Barton Hills', 'Mueller'],
    popularStores: ['H-E-B', 'Walmart', 'Target', 'Whole Foods', 'Trader Joe\'s', 'Sprouts', 'Central Market'],
    rmpEligible: false
  },
  'jacksonville': {
    name: 'Jacksonville',
    state: 'Florida',
    stateAbbr: 'FL',
    zipCodes: ['32099', '32201', '32202', '32204', '32205', '32206', '32207', '32208', '32209', '32210', '32211', '32216', '32217', '32218', '32224'],
    description: 'Jacksonville, Florida offers numerous EBT and SNAP-accepting locations throughout the River City. Our database helps Jacksonville residents find grocery stores, corner stores, and farmers markets throughout Duval County.',
    coordinates: { lat: 30.3322, lng: -81.6557 },
    population: '949K',
    neighborhoods: ['Downtown Jacksonville', 'Jacksonville Beach', 'Riverside', 'Mandarin', 'San Marco', 'Ortega', 'Springfield', 'Avondale'],
    popularStores: ['Publix', 'Winn-Dixie', 'Walmart', 'Target', 'Aldi', 'Save-A-Lot', 'Fresh Market'],
    rmpEligible: false
  },
  'fort-worth': {
    name: 'Fort Worth',
    state: 'Texas',
    stateAbbr: 'TX',
    zipCodes: ['76102', '76103', '76104', '76105', '76106', '76107', '76109', '76110', '76111', '76112', '76114', '76115', '76116', '76117', '76118'],
    description: 'Fort Worth, Texas residents can locate EBT and SNAP-accepting stores throughout Cowtown. Our database covers all major Fort Worth neighborhoods and Tarrant County with major retailers accepting EBT benefits.',
    coordinates: { lat: 32.7555, lng: -97.3308 },
    population: '935K',
    neighborhoods: ['Downtown', 'Cultural District', 'Stockyards', 'South Fort Worth', 'Sundance Square', 'West 7th', 'Near Southside', 'TCU Area'],
    popularStores: ['Kroger', 'Tom Thumb', 'Walmart', 'Target', 'Fiesta', 'Aldi', 'Market Street'],
    rmpEligible: false
  },
  'columbus': {
    name: 'Columbus',
    state: 'Ohio',
    stateAbbr: 'OH',
    zipCodes: ['43085', '43201', '43202', '43203', '43204', '43205', '43206', '43207', '43209', '43210', '43211', '43212', '43213', '43214', '43215'],
    description: 'Columbus, Ohio offers extensive EBT and SNAP-accepting locations throughout the capital city. Our database helps Columbus residents find grocery stores, corner stores, and farmers markets throughout Franklin County.',
    coordinates: { lat: 39.9612, lng: -82.9988 },
    population: '905K',
    neighborhoods: ['Downtown Columbus', 'Short North', 'German Village', 'Clintonville', 'Italian Village', 'Franklinton', 'Victorian Village', 'Brewery District'],
    popularStores: ['Kroger', 'Giant Eagle', 'Walmart', 'Target', 'Aldi', 'Meijer', 'Whole Foods'],
    rmpEligible: false
  },
  'charlotte': {
    name: 'Charlotte',
    state: 'North Carolina',
    stateAbbr: 'NC',
    zipCodes: ['28201', '28202', '28203', '28204', '28205', '28206', '28207', '28208', '28209', '28210', '28211', '28212', '28213', '28214', '28215'],
    description: 'Charlotte, North Carolina offers numerous EBT and SNAP-accepting locations throughout the Queen City. Our database helps Charlotte residents find grocery stores throughout Mecklenburg County with major chains and local markets.',
    coordinates: { lat: 35.2271, lng: -80.8431 },
    population: '885K',
    neighborhoods: ['Uptown Charlotte', 'South End', 'NoDa', 'Plaza Midwood', 'Dilworth', 'Myers Park', 'Elizabeth', 'Ballantyne'],
    popularStores: ['Harris Teeter', 'Food Lion', 'Walmart', 'Target', 'Aldi', 'Publix', 'Whole Foods'],
    rmpEligible: false
  },
  'san-francisco': {
    name: 'San Francisco',
    state: 'California',
    stateAbbr: 'CA',
    zipCodes: ['94102', '94103', '94104', '94105', '94107', '94108', '94109', '94110', '94111', '94112', '94114', '94115', '94116', '94117', '94118'],
    description: 'San Francisco, California offers extensive EBT and SNAP-accepting locations throughout the City by the Bay. California participates in the Restaurant Meals Program (RMP), making San Francisco excellent for EBT hot meal purchases.',
    coordinates: { lat: 37.7749, lng: -122.4194 },
    population: '874K',
    neighborhoods: ['Downtown SF', 'Mission District', 'Chinatown', 'Sunset', 'Richmond', 'SOMA', 'Castro', 'Haight-Ashbury'],
    popularStores: ['Safeway', 'Whole Foods', 'Trader Joe\'s', 'Target', 'Rainbow Grocery', 'Mollie Stone\'s', 'Gus\'s Market'],
    rmpEligible: true
  },
  'fresno': {
    name: 'Fresno',
    state: 'California',
    stateAbbr: 'CA',
    zipCodes: ['93701', '93702', '93703', '93704', '93705', '93706', '93710', '93711', '93720', '93721', '93722', '93723', '93725', '93726', '93727'],
    description: 'Finding EBT-accepting stores in Fresno, California has never been easier. California participates in the Restaurant Meals Program (RMP), perfect for elderly, disabled, or homeless individuals who qualify.',
    coordinates: { lat: 36.7378, lng: -119.7871 },
    population: '542K',
    neighborhoods: ['Downtown Fresno', 'Tower District', 'Fig Garden', 'Woodward Park', 'Sunnyside', 'Northwest Fresno', 'Old Fig', 'Bullard'],
    popularStores: ['Save Mart', 'Food 4 Less', 'Walmart', 'Target', 'WinCo', 'Foodmaxx', 'Grocery Outlet'],
    rmpEligible: true
  }
};

const CityPage: React.FC = () => {
  const { citySlug } = useParams<{ citySlug: string }>();
  const location = useLocation();
  
  const actualCitySlug = citySlug || location.pathname.slice(1);
  const city = actualCitySlug && cityData[actualCitySlug as keyof typeof cityData] ? cityData[actualCitySlug as keyof typeof cityData] : null;

  if (!city) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">City Not Found</h1>
          <p className="text-muted-foreground">The city page you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute requireAuth={false}>
      <CityPageSEO
        cityName={actualCitySlug}
        stateAbbr={city.stateAbbr}
        coordinates={city.coordinates}
        storeCount={1000}
      />
      
      <div className="min-h-screen bg-background">
        <BreadcrumbNavigation />

        {/* Enhanced Hero Section */}
        <div className="bg-gradient-to-br from-primary/10 via-secondary/5 to-background border-b">
          <div className="max-w-7xl mx-auto px-6 py-16">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-5xl font-bold text-foreground mb-6 leading-tight">
                Find EBT & SNAP Stores in {city.name}, {city.stateAbbr}
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                {city.description}
              </p>
              
              {/* City Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <Card className="p-4 bg-card border-border">
                  <Users className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <div className="text-2xl font-bold">{city.population}</div>
                  <div className="text-sm text-muted-foreground">Population</div>
                </Card>
                <Card className="p-4 bg-card border-border">
                  <Store className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <div className="text-2xl font-bold">1000+</div>
                  <div className="text-sm text-muted-foreground">EBT Stores</div>
                </Card>
                <Card className="p-4 bg-card border-border">
                  <MapPin className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <div className="text-2xl font-bold">{city.neighborhoods.length}</div>
                  <div className="text-sm text-muted-foreground">Neighborhoods</div>
                </Card>
                <Card className="p-4 bg-card border-border">
                  <TrendingUp className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <div className="text-2xl font-bold">{city.rmpEligible ? 'Yes' : 'No'}</div>
                  <div className="text-sm text-muted-foreground">RMP Available</div>
                </Card>
              </div>
            </div>
          </div>
        </div>

        {/* Neighborhoods Section */}
        <div className="max-w-7xl mx-auto px-6 py-12">
          <h2 className="text-3xl font-bold mb-6">Neighborhoods in {city.name}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-12">
            {city.neighborhoods.map((neighborhood) => (
              <div key={neighborhood} className="bg-primary/5 text-foreground px-4 py-2 rounded-lg text-center hover:bg-primary/10 transition-colors">
                {neighborhood}
              </div>
            ))}
          </div>

          {/* Popular Stores */}
          <h2 className="text-3xl font-bold mb-6">Popular EBT-Accepting Stores</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-12">
            {city.popularStores.map((store) => (
              <Card key={store} className="p-4 text-center hover:shadow-lg transition-shadow bg-card border-border">
                <Store className="w-6 h-6 mx-auto mb-2 text-primary" />
                <div className="font-semibold">{store}</div>
              </Card>
            ))}
          </div>

          {/* ZIP Codes Section */}
          <h2 className="text-3xl font-bold mb-6">Search by ZIP Code</h2>
          <Card className="p-6 bg-card border-border mb-8">
            <p className="text-muted-foreground mb-4">
              Popular ZIP codes in {city.name}, {city.stateAbbr}:
            </p>
            <div className="flex flex-wrap gap-2">
              {city.zipCodes.map((zip) => (
                <span key={zip} className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm hover:bg-primary/20 transition-colors">
                  {zip}
                </span>
              ))}
            </div>
          </Card>
        </div>

        {/* Search Container */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <SearchContainer initialCity={city.name} />
        </div>

        <FAQSection />
        <SEOFooter />
      </div>
    </ProtectedRoute>
  );
};

export default CityPage;
