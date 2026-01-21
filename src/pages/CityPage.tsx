
import React from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { SearchContainer } from '@/components/store-search/SearchContainer';
import { SEOFooter } from '@/components/SEOFooter';
import { FAQSection } from '@/components/FAQSection';
import { SEOHead } from '@/components/SEOHead';
import { BreadcrumbSchema } from '@/components/BreadcrumbSchema';
import { BreadcrumbNavigation } from '@/components/BreadcrumbNavigation';
import { MapPin, Store } from 'lucide-react';

interface CityData {
  name: string;
  state: string;
  lat: number;
  lng: number;
  zipCodes: string[];
  description: string;
}

const cityData: Record<string, CityData> = {
  'los-angeles': {
    name: 'Los Angeles',
    state: 'CA',
    lat: 34.0522,
    lng: -118.2437,
    zipCodes: ['90001', '90002', '90003', '90004', '90005', '90006', '90007', '90008', '90009', '90010', '90011', '90012', '90013', '90014', '90015', '90016', '90017', '90018', '90019', '90020'],
    description: 'Los Angeles, California offers thousands of EBT and SNAP-accepting locations throughout the greater LA area. From downtown LA to Hollywood, Beverly Hills to Santa Monica, our comprehensive database helps LA residents find grocery stores, farmers markets, and participating restaurants. California participates in the Restaurant Meals Program (RMP), making LA an excellent city for EBT hot meal purchases at qualified restaurants.'
  },
  'new-york': {
    name: 'New York',
    state: 'NY',
    lat: 40.7128,
    lng: -74.0060,
    zipCodes: ['10001', '10002', '10003', '10004', '10005', '10006', '10007', '10009', '10010', '10011', '10012', '10013', '10014', '10016', '10017', '10018', '10019', '10020'],
    description: 'New York City offers extensive EBT and SNAP-accepting locations throughout all five boroughs. From Manhattan to Brooklyn, Queens to the Bronx, our database helps NYC residents find grocery stores, bodegas, and farmers markets. New York participates in the Restaurant Meals Program (RMP) for qualifying residents, making it easy to find hot meal options with your EBT card.'
  },
  'brooklyn': {
    name: 'Brooklyn',
    state: 'NY',
    lat: 40.6782,
    lng: -73.9442,
    zipCodes: ['11201', '11203', '11204', '11205', '11206', '11207', '11208', '11209', '11210', '11211', '11212', '11213', '11214', '11215', '11216', '11217', '11218', '11219', '11220'],
    description: 'Brooklyn, New York has thousands of EBT and SNAP-accepting stores, from Williamsburg to Bay Ridge, Crown Heights to Flatbush. Brooklyn has one of the highest concentrations of SNAP retailers in the country. Find bodegas, supermarkets, farmers markets, and RMP-participating restaurants throughout Kings County.'
  },
  'chicago': {
    name: 'Chicago',
    state: 'IL',
    lat: 41.8781,
    lng: -87.6298,
    zipCodes: ['60601', '60602', '60603', '60604', '60605', '60606', '60607', '60608', '60609', '60610', '60611', '60612', '60613', '60614', '60615', '60616', '60617', '60618', '60619', '60620'],
    description: 'Chicago EBT users can find thousands of SNAP-accepting locations across the Windy City, from downtown Loop to neighborhoods like Lincoln Park, Wicker Park, and South Side communities. Illinois participates in the Restaurant Meals Program (RMP), making Chicago one of the best cities for EBT hot meal purchases at participating restaurants.'
  },
  'houston': {
    name: 'Houston',
    state: 'TX',
    lat: 29.7604,
    lng: -95.3698,
    zipCodes: ['77001', '77002', '77003', '77004', '77005', '77006', '77007', '77008', '77009', '77010', '77011', '77012', '77013', '77014', '77015', '77016', '77017', '77018', '77019', '77020'],
    description: 'Houston, Texas residents can easily find EBT and SNAP-accepting stores throughout the Greater Houston area. From the Heights to Sugar Land, from Katy to Pasadena, our database covers all major Houston neighborhoods and surrounding communities. Houston has thousands of participating SNAP retailers, including H-E-B, Kroger, Walmart, and local Hispanic markets.'
  },
  'miami': {
    name: 'Miami',
    state: 'FL',
    lat: 25.7617,
    lng: -80.1918,
    zipCodes: ['33101', '33109', '33125', '33126', '33127', '33128', '33129', '33130', '33131', '33132', '33133', '33134', '33135', '33136', '33137', '33138', '33139', '33140', '33141', '33142'],
    description: 'Miami, Florida offers hundreds of EBT and SNAP-accepting stores throughout Miami-Dade County. From South Beach to Little Havana, Coconut Grove to Hialeah, find Publix, Sedanos, Walmart, and local bodegas that accept SNAP benefits. Florida does not currently participate in the Restaurant Meals Program (RMP).'
  },
  'atlanta': {
    name: 'Atlanta',
    state: 'GA',
    lat: 33.7490,
    lng: -84.3880,
    zipCodes: ['30301', '30302', '30303', '30304', '30305', '30306', '30307', '30308', '30309', '30310', '30311', '30312', '30313', '30314', '30315', '30316', '30317', '30318', '30319', '30320'],
    description: 'Atlanta, Georgia residents can find EBT and SNAP-accepting stores throughout Metro Atlanta. From Buckhead to East Atlanta, Midtown to College Park, our database covers Kroger, Publix, Walmart, and local markets throughout Fulton and DeKalb counties.'
  },
  'denver': {
    name: 'Denver',
    state: 'CO',
    lat: 39.7392,
    lng: -104.9903,
    zipCodes: ['80201', '80202', '80203', '80204', '80205', '80206', '80207', '80208', '80209', '80210', '80211', '80212', '80214', '80215', '80216', '80217', '80218', '80219', '80220', '80221'],
    description: 'Denver, Colorado offers extensive EBT and SNAP-accepting locations throughout the Mile High City. From downtown Denver to Capitol Hill, from RiNo to Cherry Creek, find King Soopers, Safeway, Walmart, and local markets that accept SNAP benefits.'
  },
  'seattle': {
    name: 'Seattle',
    state: 'WA',
    lat: 47.6062,
    lng: -122.3321,
    zipCodes: ['98101', '98102', '98103', '98104', '98105', '98106', '98107', '98108', '98109', '98112', '98115', '98116', '98117', '98118', '98119', '98121', '98122', '98125', '98126', '98133'],
    description: 'Seattle, Washington residents can find EBT and SNAP-accepting stores throughout King County. From Capitol Hill to Ballard, Fremont to Columbia City, find Safeway, QFC, Walmart, and local Asian markets that accept SNAP benefits.'
  },
  'boston': {
    name: 'Boston',
    state: 'MA',
    lat: 42.3601,
    lng: -71.0589,
    zipCodes: ['02108', '02109', '02110', '02111', '02113', '02114', '02115', '02116', '02118', '02119', '02120', '02121', '02122', '02124', '02125', '02126', '02127', '02128', '02129', '02130'],
    description: 'Boston, Massachusetts offers numerous EBT and SNAP-accepting locations throughout Greater Boston. From Back Bay to Dorchester, South End to Jamaica Plain, find Stop & Shop, Shaw\'s, Whole Foods, and local markets that accept SNAP benefits.'
  },
  'detroit': {
    name: 'Detroit',
    state: 'MI',
    lat: 42.3314,
    lng: -83.0458,
    zipCodes: ['48201', '48202', '48203', '48204', '48205', '48206', '48207', '48208', '48209', '48210', '48211', '48212', '48213', '48214', '48215', '48216', '48217', '48219', '48221', '48223'],
    description: 'Detroit, Michigan residents can find EBT and SNAP-accepting stores throughout the Motor City and Wayne County. From Midtown to Corktown, Southwest to the East Side, find Meijer, Kroger, Walmart, and local markets that accept SNAP benefits.'
  },
  'phoenix': {
    name: 'Phoenix',
    state: 'AZ',
    lat: 33.4484,
    lng: -112.0740,
    zipCodes: ['85001', '85002', '85003', '85004', '85005', '85006', '85007', '85008', '85009', '85010', '85011', '85012', '85013', '85014', '85015', '85016', '85017', '85018', '85019', '85020'],
    description: 'Phoenix, Arizona residents can locate EBT and SNAP-accepting stores throughout the Valley of the Sun. From downtown Phoenix to Scottsdale, Tempe to Glendale, our database covers the entire Phoenix metropolitan area. Arizona participates in the Restaurant Meals Program (RMP), allowing eligible EBT users to purchase hot meals at participating restaurants.'
  },
  'philadelphia': {
    name: 'Philadelphia',
    state: 'PA',
    lat: 39.9526,
    lng: -75.1652,
    zipCodes: ['19101', '19102', '19103', '19104', '19105', '19106', '19107', '19108', '19109', '19110', '19111', '19112', '19113', '19114', '19115', '19116', '19118', '19119', '19120', '19121'],
    description: 'Philadelphia, Pennsylvania offers extensive EBT and SNAP-accepting locations throughout the City of Brotherly Love. From Center City to South Philly, from Fishtown to West Philadelphia, our database helps Philly residents find grocery stores, corner stores, and participating restaurants.'
  },
  'san-antonio': {
    name: 'San Antonio',
    state: 'TX',
    lat: 29.4241,
    lng: -98.4936,
    zipCodes: ['78201', '78202', '78203', '78204', '78205', '78206', '78207', '78208', '78209', '78210', '78211', '78212', '78213', '78214', '78215', '78216', '78217', '78218', '78219', '78220'],
    description: 'San Antonio, Texas residents can find EBT and SNAP-accepting stores throughout the Alamo City and surrounding Bexar County. From downtown San Antonio to the Medical Center, from the Riverwalk area to suburban neighborhoods, our database covers all major San Antonio areas. Major retailers like H-E-B, Walmart, Target, and local Hispanic markets accept EBT benefits.'
  },
  'san-diego': {
    name: 'San Diego',
    state: 'CA',
    lat: 32.7157,
    lng: -117.1611,
    zipCodes: ['92101', '92102', '92103', '92104', '92105', '92106', '92107', '92108', '92109', '92110', '92111', '92112', '92113', '92114', '92115', '92116', '92117', '92118', '92119', '92120'],
    description: 'San Diego, California offers numerous EBT and SNAP-accepting locations throughout America\'s Finest City. From downtown San Diego to La Jolla, from Pacific Beach to Chula Vista, our database helps San Diego residents find grocery stores, farmers markets, and participating restaurants. California participates in the Restaurant Meals Program (RMP).'
  },
  'dallas': {
    name: 'Dallas',
    state: 'TX',
    lat: 32.7767,
    lng: -96.7970,
    zipCodes: ['75201', '75202', '75203', '75204', '75205', '75206', '75207', '75208', '75209', '75210', '75211', '75212', '75214', '75215', '75216', '75217', '75218', '75219', '75220', '75221'],
    description: 'Dallas, Texas residents can locate EBT and SNAP-accepting stores throughout the Dallas-Fort Worth metroplex. From downtown Dallas to Deep Ellum, from Uptown to Oak Cliff, our database covers all major Dallas neighborhoods and surrounding areas.'
  },
  'san-jose': {
    name: 'San Jose',
    state: 'CA',
    lat: 37.3382,
    lng: -121.8863,
    zipCodes: ['95101', '95103', '95106', '95108', '95109', '95110', '95111', '95112', '95113', '95116', '95117', '95118', '95119', '95120', '95121', '95122', '95123', '95124', '95125', '95126'],
    description: 'San Jose, California offers extensive EBT and SNAP-accepting locations throughout Silicon Valley. From downtown San Jose to Almaden Valley, from Willow Glen to East San Jose, our database helps San Jose residents find grocery stores, farmers markets, and participating restaurants. California participates in the Restaurant Meals Program (RMP).'
  },
  'austin': {
    name: 'Austin',
    state: 'TX',
    lat: 30.2672,
    lng: -97.7431,
    zipCodes: ['78701', '78702', '78703', '78704', '78705', '78712', '78717', '78719', '78721', '78722', '78723', '78724', '78725', '78726', '78727', '78728', '78729', '78730'],
    description: 'Austin, Texas residents can find EBT and SNAP-accepting stores throughout the Live Music Capital of the World. From downtown Austin to South Austin, from East Austin to West Lake Hills, our database covers all major Austin neighborhoods and surrounding Travis County areas.'
  },
  'jacksonville': {
    name: 'Jacksonville',
    state: 'FL',
    lat: 30.3322,
    lng: -81.6557,
    zipCodes: ['32099', '32201', '32202', '32203', '32204', '32205', '32206', '32207', '32208', '32209', '32210', '32211', '32212', '32214', '32216', '32217', '32218', '32219', '32220', '32221'],
    description: 'Jacksonville, Florida offers numerous EBT and SNAP-accepting locations throughout the River City. From downtown Jacksonville to Jacksonville Beach, from Riverside to Mandarin, our database helps Jacksonville residents find grocery stores, corner stores, and farmers markets.'
  },
  'fort-worth': {
    name: 'Fort Worth',
    state: 'TX',
    lat: 32.7555,
    lng: -97.3308,
    zipCodes: ['76101', '76102', '76103', '76104', '76105', '76106', '76107', '76108', '76109', '76110', '76111', '76112', '76113', '76114', '76115', '76116', '76117', '76118', '76119', '76120'],
    description: 'Fort Worth, Texas residents can locate EBT and SNAP-accepting stores throughout Cowtown and surrounding Tarrant County. From downtown Fort Worth to the Cultural District, from the Stockyards to south Fort Worth, our database covers all major Fort Worth neighborhoods.'
  },
  'columbus': {
    name: 'Columbus',
    state: 'OH',
    lat: 39.9612,
    lng: -82.9988,
    zipCodes: ['43085', '43201', '43202', '43203', '43204', '43205', '43206', '43207', '43209', '43210', '43211', '43212', '43213', '43214', '43215', '43216', '43217', '43218', '43219', '43220'],
    description: 'Columbus, Ohio offers extensive EBT and SNAP-accepting locations throughout the capital city. From downtown Columbus to the Short North, from German Village to Clintonville, our database helps Columbus residents find grocery stores, corner stores, and farmers markets.'
  },
  'charlotte': {
    name: 'Charlotte',
    state: 'NC',
    lat: 35.2271,
    lng: -80.8431,
    zipCodes: ['28201', '28202', '28203', '28204', '28205', '28206', '28207', '28208', '28209', '28210', '28211', '28212', '28213', '28214', '28215', '28216', '28217', '28218', '28219', '28220'],
    description: 'Charlotte, North Carolina offers numerous EBT and SNAP-accepting locations throughout the Queen City. From Uptown Charlotte to South End, from NoDa to Matthews, our database helps Charlotte residents find grocery stores, corner stores, and farmers markets.'
  },
  'san-francisco': {
    name: 'San Francisco',
    state: 'CA',
    lat: 37.7749,
    lng: -122.4194,
    zipCodes: ['94102', '94103', '94104', '94105', '94107', '94108', '94109', '94110', '94111', '94112', '94114', '94115', '94116', '94117', '94118', '94119', '94120', '94121', '94122', '94123'],
    description: 'San Francisco, California offers extensive EBT and SNAP-accepting locations throughout the City by the Bay. From downtown San Francisco to the Mission District, from Chinatown to the Sunset, our database helps San Francisco residents find grocery stores, corner stores, and farmers markets. California participates in the Restaurant Meals Program (RMP).'
  },
  'fresno': {
    name: 'Fresno',
    state: 'CA',
    lat: 36.7378,
    lng: -119.7871,
    zipCodes: ['93701', '93702', '93703', '93704', '93705', '93706', '93707', '93708', '93709', '93710', '93711', '93712', '93714', '93715', '93716', '93717', '93718', '93720', '93721', '93722'],
    description: 'Finding EBT-accepting stores in Fresno, California has never been easier. Our comprehensive database helps Fresno residents locate grocery stores, convenience stores, farmers markets, and restaurants that accept SNAP benefits and participate in the Restaurant Meals Program (RMP).'
  },
  'indianapolis': {
    name: 'Indianapolis',
    state: 'IN',
    lat: 39.7684,
    lng: -86.1581,
    zipCodes: ['46201', '46202', '46203', '46204', '46205', '46206', '46207', '46208', '46209', '46210', '46211', '46214', '46216', '46217', '46218', '46219', '46220', '46221', '46222', '46224'],
    description: 'Indianapolis, Indiana residents can find EBT and SNAP-accepting stores throughout the Circle City. From downtown Indianapolis to Broad Ripple, from Fountain Square to Castleton, find Kroger, Meijer, Walmart, and local markets that accept SNAP benefits.'
  },
  'sacramento': {
    name: 'Sacramento',
    state: 'CA',
    lat: 38.5816,
    lng: -121.4944,
    zipCodes: ['95811', '95812', '95813', '95814', '95815', '95816', '95817', '95818', '95819', '95820', '95821', '95822', '95823', '95824', '95825', '95826', '95827', '95828', '95829', '95830'],
    description: 'Sacramento, California offers extensive EBT and SNAP-accepting locations throughout the state capital. From Midtown to East Sacramento, from Oak Park to Natomas, find Safeway, Raley\'s, Walmart, and farmers markets that accept SNAP benefits. California participates in the Restaurant Meals Program (RMP).'
  },
  'orlando': {
    name: 'Orlando',
    state: 'FL',
    lat: 28.5383,
    lng: -81.3792,
    zipCodes: ['32801', '32802', '32803', '32804', '32805', '32806', '32807', '32808', '32809', '32810', '32811', '32812', '32814', '32816', '32817', '32818', '32819', '32820', '32821', '32822'],
    description: 'Orlando, Florida offers numerous EBT and SNAP-accepting locations throughout Central Florida. From downtown Orlando to Winter Park, from International Drive to Kissimmee, find Publix, Walmart, Winn-Dixie, and local markets that accept SNAP benefits.'
  },
  'las-vegas': {
    name: 'Las Vegas',
    state: 'NV',
    lat: 36.1699,
    lng: -115.1398,
    zipCodes: ['89101', '89102', '89103', '89104', '89106', '89107', '89108', '89109', '89110', '89113', '89115', '89117', '89118', '89119', '89120', '89121', '89122', '89123', '89124', '89128'],
    description: 'Las Vegas, Nevada residents can find EBT and SNAP-accepting stores throughout the Las Vegas Valley. From the Strip to Henderson, from North Las Vegas to Summerlin, find Smith\'s, Albertsons, Walmart, and local markets that accept SNAP benefits.'
  },
  'memphis': {
    name: 'Memphis',
    state: 'TN',
    lat: 35.1495,
    lng: -90.0490,
    zipCodes: ['38101', '38103', '38104', '38105', '38106', '38107', '38108', '38109', '38111', '38112', '38114', '38115', '38116', '38117', '38118', '38119', '38120', '38122', '38126', '38127'],
    description: 'Memphis, Tennessee offers numerous EBT and SNAP-accepting locations throughout the Bluff City. From downtown Memphis to Germantown, from Midtown to Whitehaven, find Kroger, Walmart, Aldi, and local markets that accept SNAP benefits.'
  },
  'baltimore': {
    name: 'Baltimore',
    state: 'MD',
    lat: 39.2904,
    lng: -76.6122,
    zipCodes: ['21201', '21202', '21205', '21206', '21207', '21208', '21209', '21210', '21211', '21212', '21213', '21214', '21215', '21216', '21217', '21218', '21223', '21224', '21225', '21226'],
    description: 'Baltimore, Maryland residents can find EBT and SNAP-accepting stores throughout Charm City. From Inner Harbor to Fells Point, from Canton to Hampden, find Giant, Safeway, Walmart, and local markets that accept SNAP benefits. Maryland participates in the Restaurant Meals Program (RMP) in some areas.'
  }
};

const CityPage: React.FC = () => {
  const { citySlug } = useParams<{ citySlug: string }>();
  const location = useLocation();
  
  // Extract city slug - handle both /city/:citySlug and legacy /:citySlug routes
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const actualCitySlug = citySlug || (pathSegments[0] === 'city' ? pathSegments[1] : pathSegments[0]);
  const city = actualCitySlug && cityData[actualCitySlug] ? cityData[actualCitySlug] : null;

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

  // Generate SEO data - use /city/ prefix for canonical URLs
  const seoTitle = `Find EBT Stores in ${city.name}, ${city.state} | EBT Finder`;
  const seoDescription = `Discover EBT and SNAP-accepting stores in ${city.name}, ${city.state}. Find grocery stores, restaurants, and markets near you. Search by ZIP code: ${city.zipCodes.slice(0, 5).join(', ')} and more.`;
  const seoKeywords = `EBT stores ${city.name}, SNAP benefits ${city.state}, ${city.name} grocery stores EBT, food assistance ${city.name}, ${city.zipCodes.slice(0, 3).join(' ')}, RMP restaurants ${city.name}`;
  const canonicalUrl = `https://ebtfinder.org/city/${actualCitySlug}`;

  // Breadcrumb data for SEO
  const breadcrumbItems = [
    { name: 'Home', url: '/' },
    { name: city.name, url: `/city/${actualCitySlug}` }
  ];

  // Enhanced structured data for city page
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": seoTitle,
    "description": seoDescription,
    "url": canonicalUrl,
    "isPartOf": {
      "@type": "WebSite",
      "name": "EBT Finder",
      "url": "https://ebtfinder.org"
    },
    "about": {
      "@type": "Place",
      "name": `${city.name}, ${city.state}`,
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": city.lat,
        "longitude": city.lng
      },
      "address": {
        "@type": "PostalAddress",
        "addressLocality": city.name,
        "addressRegion": city.state,
        "addressCountry": "US"
      }
    },
    "mainEntity": {
      "@type": "ItemList",
      "name": `EBT Stores in ${city.name}`,
      "description": `Directory of stores accepting EBT and SNAP benefits in ${city.name}, ${city.state}`,
      "numberOfItems": city.zipCodes.length
    }
  };

  return (
    <ProtectedRoute requireAuth={false}>
      <SEOHead
        title={seoTitle}
        description={seoDescription}
        keywords={seoKeywords}
        canonicalUrl={canonicalUrl}
        structuredData={structuredData}
      />
      
      {/* Enhanced SEO Schema Component */}
      <BreadcrumbSchema items={breadcrumbItems} />
      
      <div className="min-h-screen bg-background">
        {/* Breadcrumb Navigation */}
        <BreadcrumbNavigation />

        {/* City Hero Section */}
        <div className="bg-gradient-to-br from-primary/5 to-secondary/10 border-b">
          <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-4xl font-bold text-foreground mb-4">
                Find EBT-Accepting Stores in {city.name}
              </h1>
              
              {/* Location indicator */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full mb-6">
                <MapPin className="h-4 w-4" />
                <span className="font-medium">{city.name}, {city.state}</span>
              </div>
              
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                {city.description}
              </p>
              
              {/* ZIP Codes Section */}
              <div className="bg-card rounded-lg p-6 shadow-sm border mb-8">
                <h2 className="text-xl font-semibold mb-4">Popular ZIP Codes in {city.name}, {city.state}</h2>
                <div className="flex flex-wrap gap-2 justify-center">
                  {city.zipCodes.slice(0, 15).map((zip) => (
                    <span key={zip} className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                      {zip}
                    </span>
                  ))}
                  {city.zipCodes.length > 15 && (
                    <span className="text-muted-foreground text-sm px-3 py-1">
                      +{city.zipCodes.length - 15} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stores Near You Banner */}
        <div className="bg-primary/5 border-b">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-center gap-3">
              <Store className="h-5 w-5 text-primary" />
              <span className="font-medium text-foreground">
                Showing EBT stores near {city.name}, {city.state}
              </span>
            </div>
          </div>
        </div>

        {/* Search Results - Pass coordinates for auto-search */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <SearchContainer 
            initialCity={city.name} 
            initialLocation={{ lat: city.lat, lng: city.lng }}
          />
        </div>

        {/* FAQ Section */}
        <FAQSection />

        {/* SEO Footer */}
        <SEOFooter />
      </div>
    </ProtectedRoute>
  );
};

export default CityPage;
