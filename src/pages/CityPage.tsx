import React from 'react';
import { useParams } from 'react-router-dom';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { SearchContainer } from '@/components/store-search/SearchContainer';
import { SEOFooter } from '@/components/SEOFooter';
import { FAQSection } from '@/components/FAQSection';
import { SEOHead } from '@/components/SEOHead';
import { BreadcrumbNavigation } from '@/components/BreadcrumbNavigation';

const cityData = {
  'fresno': {
    name: 'Fresno',
    state: 'CA',
    zipCodes: ['93701', '93702', '93703', '93704', '93705', '93706', '93707', '93708', '93709', '93710', '93711', '93712', '93714', '93715', '93716', '93717', '93718', '93720', '93721', '93722', '93723', '93724', '93725', '93726', '93727', '93728', '93729', '93730', '93737', '93740', '93741', '93744', '93745', '93747', '93750', '93755', '93760', '93761', '93764', '93765', '93771', '93772', '93773', '93774', '93775', '93776', '93777', '93778', '93779', '93786', '93790', '93791', '93792', '93793', '93794'],
    description: 'Finding EBT-accepting stores in Fresno, California has never been easier. Our comprehensive database helps Fresno residents locate grocery stores, convenience stores, farmers markets, and restaurants that accept SNAP benefits and participate in the Restaurant Meals Program (RMP). Whether you\'re in downtown Fresno, the Tower District, or surrounding neighborhoods, use our ZIP code search to find the closest EBT-friendly locations. Fresno County has numerous participating retailers, from major chains like Walmart and Target to local markets and specialty stores. Many locations also accept hot meal purchases through California\'s RMP program, perfect for elderly, disabled, or homeless individuals who qualify.'
  },
  'houston': {
    name: 'Houston',
    state: 'TX',
    zipCodes: ['77001', '77002', '77003', '77004', '77005', '77006', '77007', '77008', '77009', '77010', '77011', '77012', '77013', '77014', '77015', '77016', '77017', '77018', '77019', '77020', '77021', '77022', '77023', '77024', '77025', '77026', '77027', '77028', '77029', '77030', '77031', '77032', '77033', '77034', '77035', '77036', '77037', '77038', '77039', '77040', '77041', '77042', '77043', '77044', '77045', '77046', '77047', '77048', '77049', '77050', '77051', '77052', '77053', '77054', '77055', '77056', '77057', '77058', '77059', '77060', '77061', '77062', '77063', '77064', '77065', '77066', '77067', '77068', '77069', '77070', '77071', '77072', '77073', '77074', '77075', '77076', '77077', '77078', '77079', '77080', '77081', '77082', '77083', '77084', '77085', '77086', '77087', '77088', '77089', '77090', '77091', '77092', '77093', '77094', '77095', '77096', '77097', '77098', '77099'],
    description: 'Houston, Texas residents can easily find EBT and SNAP-accepting stores throughout the Greater Houston area using our location-based search tool. From the Heights to Sugar Land, from Katy to Pasadena, our database covers all major Houston neighborhoods and surrounding communities. Houston has thousands of participating SNAP retailers, including H-E-B, Kroger, Walmart, and local Hispanic markets that serve the diverse community. While Texas doesn\'t currently participate in the Restaurant Meals Program (RMP), eligible residents can still use EBT benefits at authorized food retailers, farmers markets, and even some food trucks. Use our ZIP code search to find the most convenient locations near your Houston address.'
  },
  'chicago-ebt': {
    name: 'Chicago',
    state: 'IL',
    zipCodes: ['60601', '60602', '60603', '60604', '60605', '60606', '60607', '60608', '60609', '60610', '60611', '60612', '60613', '60614', '60615', '60616', '60617', '60618', '60619', '60620', '60621', '60622', '60623', '60624', '60625', '60626', '60628', '60629', '60630', '60631', '60632', '60633', '60634', '60636', '60637', '60638', '60639', '60640', '60641', '60642', '60643', '60644', '60645', '60646', '60647', '60649', '60651', '60652', '60653', '60654', '60655', '60656', '60657', '60659', '60660', '60661', '60664', '60666', '60668', '60669', '60670', '60673', '60674', '60675', '60677', '60678', '60680', '60681', '60682', '60684', '60685', '60686', '60687', '60688', '60689', '60690', '60691', '60693', '60694', '60695', '60696', '60697', '60699'],
    description: 'Chicago EBT users can find thousands of SNAP-accepting locations across the Windy City, from downtown Loop to neighborhoods like Lincoln Park, Wicker Park, and South Side communities. Illinois participates in the Restaurant Meals Program (RMP), making Chicago one of the best cities for EBT hot meal purchases at participating restaurants. Our comprehensive database includes major chains like Jewel-Osco, Mariano\'s, and Walmart, plus local corner stores, ethnic markets, and authorized farmers markets throughout Cook County. Whether you\'re taking the CTA or driving, use our location search to find EBT-friendly stores near Chicago\'s diverse neighborhoods. Many locations also offer online ordering and pickup services for added convenience.'
  }
};

const CityPage: React.FC = () => {
  const { citySlug } = useParams<{ citySlug: string }>();
  const city = citySlug ? cityData[citySlug as keyof typeof cityData] : null;

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

  // Generate SEO data
  const seoTitle = `Find EBT Stores in ${city.name}, ${city.state} | EBT Finder`;
  const seoDescription = `Discover EBT and SNAP-accepting stores in ${city.name}, ${city.state}. Find grocery stores, restaurants, and markets near you. Search by ZIP code: ${city.zipCodes.slice(0, 5).join(', ')} and more.`;
  const seoKeywords = `EBT stores ${city.name}, SNAP benefits ${city.state}, ${city.name} grocery stores EBT, food assistance ${city.name}, ${city.zipCodes.slice(0, 3).join(' ')}, RMP restaurants ${city.name}`;
  const canonicalUrl = `https://ebtfinder.org/${citySlug}`;

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
    },
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://ebtfinder.org"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": city.name,
          "item": canonicalUrl
        }
      ]
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
      
      <div className="min-h-screen bg-background">
        {/* Breadcrumb Navigation */}
        <BreadcrumbNavigation />

        {/* City Hero Section */}
        <div className="bg-gradient-to-br from-primary/5 to-secondary/10 border-b">
          <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-4xl font-bold text-foreground mb-6">
                Find EBT-Accepting Stores in {city.name}
              </h1>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                {city.description}
              </p>
              
              {/* ZIP Codes Section */}
              <div className="bg-white rounded-lg p-6 shadow-sm border mb-8">
                <h2 className="text-xl font-semibold mb-4">Popular ZIP Codes in {city.name}, {city.state}</h2>
                <div className="flex flex-wrap gap-2 justify-center">
                  {city.zipCodes.slice(0, 20).map((zip) => (
                    <span key={zip} className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                      {zip}
                    </span>
                  ))}
                  {city.zipCodes.length > 20 && (
                    <span className="text-muted-foreground text-sm px-3 py-1">
                      +{city.zipCodes.length - 20} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search Results */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <SearchContainer initialCity={city.name} />
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
