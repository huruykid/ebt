
import React from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { SearchContainer } from '@/components/store-search/SearchContainer';
import { SEOFooter } from '@/components/SEOFooter';
import { FAQSection } from '@/components/FAQSection';
import { SEOHead } from '@/components/SEOHead';
import { BreadcrumbNavigation } from '@/components/BreadcrumbNavigation';

const cityData = {
  'los-angeles': {
    name: 'Los Angeles',
    state: 'CA',
    zipCodes: ['90001', '90002', '90003', '90004', '90005', '90006', '90007', '90008', '90009', '90010', '90011', '90012', '90013', '90014', '90015', '90016', '90017', '90018', '90019', '90020', '90021', '90022', '90023', '90024', '90025', '90026', '90027', '90028', '90029', '90030', '90031', '90032', '90033', '90034', '90035', '90036', '90037', '90038', '90039', '90040', '90041', '90042', '90043', '90044', '90045', '90046', '90047', '90048', '90049', '90050', '90051', '90052', '90053', '90054', '90055', '90056', '90057', '90058', '90059', '90060', '90061', '90062', '90063', '90064', '90065', '90066', '90067', '90068', '90069', '90070', '90071', '90072', '90073', '90074', '90075', '90076', '90077', '90078', '90079', '90080', '90081', '90082', '90083', '90084', '90086', '90087', '90088', '90089', '90091', '90093', '90094', '90095', '90096', '90099'],
    description: 'Los Angeles, California offers thousands of EBT and SNAP-accepting locations throughout the greater LA area. From downtown LA to Hollywood, Beverly Hills to Santa Monica, our comprehensive database helps LA residents find grocery stores, farmers markets, and participating restaurants. California participates in the Restaurant Meals Program (RMP), making LA an excellent city for EBT hot meal purchases at qualified restaurants. Major chains like Ralph\'s, Vons, Walmart, and Target accept EBT, along with numerous local markets, ethnic grocery stores, and farmers markets throughout LA County.'
  },
  'chicago-ebt': {
    name: 'Chicago',
    state: 'IL',
    zipCodes: ['60601', '60602', '60603', '60604', '60605', '60606', '60607', '60608', '60609', '60610', '60611', '60612', '60613', '60614', '60615', '60616', '60617', '60618', '60619', '60620', '60621', '60622', '60623', '60624', '60625', '60626', '60628', '60629', '60630', '60631', '60632', '60633', '60634', '60636', '60637', '60638', '60639', '60640', '60641', '60642', '60643', '60644', '60645', '60646', '60647', '60649', '60651', '60652', '60653', '60654', '60655', '60656', '60657', '60659', '60660', '60661', '60664', '60666', '60668', '60669', '60670', '60673', '60674', '60675', '60677', '60678', '60680', '60681', '60682', '60684', '60685', '60686', '60687', '60688', '60689', '60690', '60691', '60693', '60694', '60695', '60696', '60697', '60699'],
    description: 'Chicago EBT users can find thousands of SNAP-accepting locations across the Windy City, from downtown Loop to neighborhoods like Lincoln Park, Wicker Park, and South Side communities. Illinois participates in the Restaurant Meals Program (RMP), making Chicago one of the best cities for EBT hot meal purchases at participating restaurants. Our comprehensive database includes major chains like Jewel-Osco, Mariano\'s, and Walmart, plus local corner stores, ethnic markets, and authorized farmers markets throughout Cook County. Whether you\'re taking the CTA or driving, use our location search to find EBT-friendly stores near Chicago\'s diverse neighborhoods. Many locations also offer online ordering and pickup services for added convenience.'
  },
  'houston': {
    name: 'Houston',
    state: 'TX',
    zipCodes: ['77001', '77002', '77003', '77004', '77005', '77006', '77007', '77008', '77009', '77010', '77011', '77012', '77013', '77014', '77015', '77016', '77017', '77018', '77019', '77020', '77021', '77022', '77023', '77024', '77025', '77026', '77027', '77028', '77029', '77030', '77031', '77032', '77033', '77034', '77035', '77036', '77037', '77038', '77039', '77040', '77041', '77042', '77043', '77044', '77045', '77046', '77047', '77048', '77049', '77050', '77051', '77052', '77053', '77054', '77055', '77056', '77057', '77058', '77059', '77060', '77061', '77062', '77063', '77064', '77065', '77066', '77067', '77068', '77069', '77070', '77071', '77072', '77073', '77074', '77075', '77076', '77077', '77078', '77079', '77080', '77081', '77082', '77083', '77084', '77085', '77086', '77087', '77088', '77089', '77090', '77091', '77092', '77093', '77094', '77095', '77096', '77097', '77098', '77099'],
    description: 'Houston, Texas residents can easily find EBT and SNAP-accepting stores throughout the Greater Houston area using our location-based search tool. From the Heights to Sugar Land, from Katy to Pasadena, our database covers all major Houston neighborhoods and surrounding communities. Houston has thousands of participating SNAP retailers, including H-E-B, Kroger, Walmart, and local Hispanic markets that serve the diverse community. While Texas doesn\'t currently participate in the Restaurant Meals Program (RMP), eligible residents can still use EBT benefits at authorized food retailers, farmers markets, and even some food trucks. Use our ZIP code search to find the most convenient locations near your Houston address.'
  },
  'phoenix': {
    name: 'Phoenix',
    state: 'AZ',
    zipCodes: ['85001', '85002', '85003', '85004', '85005', '85006', '85007', '85008', '85009', '85010', '85011', '85012', '85013', '85014', '85015', '85016', '85017', '85018', '85019', '85020', '85021', '85022', '85023', '85024', '85025', '85026', '85027', '85028', '85029', '85030', '85031', '85032', '85033', '85034', '85035', '85036', '85037', '85038', '85039', '85040', '85041', '85042', '85043', '85044', '85045', '85046', '85048', '85050', '85051', '85053', '85054', '85083', '85085'],
    description: 'Phoenix, Arizona residents can locate EBT and SNAP-accepting stores throughout the Valley of the Sun. From downtown Phoenix to Scottsdale, Tempe to Glendale, our database covers the entire Phoenix metropolitan area. Arizona participates in the Restaurant Meals Program (RMP), allowing eligible EBT users to purchase hot meals at participating restaurants. Major retailers like Fry\'s Food Stores, Walmart, Target, and Safeway accept EBT benefits, along with numerous local markets, specialty stores, and farmers markets throughout Maricopa County.'
  },
  'philadelphia': {
    name: 'Philadelphia',
    state: 'PA',
    zipCodes: ['19101', '19102', '19103', '19104', '19105', '19106', '19107', '19108', '19109', '19110', '19111', '19112', '19113', '19114', '19115', '19116', '19118', '19119', '19120', '19121', '19122', '19123', '19124', '19125', '19126', '19127', '19128', '19129', '19130', '19131', '19132', '19133', '19134', '19135', '19136', '19137', '19138', '19139', '19140', '19141', '19142', '19143', '19144', '19145', '19146', '19147', '19148', '19149', '19150', '19151', '19152', '19153', '19154', '19155', '19160', '19161', '19162', '19170', '19171', '19172', '19173', '19175', '19176', '19177', '19178', '19179', '19181', '19182', '19183', '19184', '19185', '19187', '19188', '19191', '19192', '19193', '19194', '19195', '19196'],
    description: 'Philadelphia, Pennsylvania offers extensive EBT and SNAP-accepting locations throughout the City of Brotherly Love. From Center City to South Philly, from Fishtown to West Philadelphia, our database helps Philly residents find grocery stores, corner stores, and participating restaurants. Pennsylvania participates in the Restaurant Meals Program (RMP) in select areas, allowing qualified EBT users to purchase prepared meals. Major chains like ACME Markets, ShopRite, and Giant accept EBT, along with numerous local markets, ethnic grocery stores, and farmers markets throughout Philadelphia County.'
  },
  'san-antonio': {
    name: 'San Antonio',
    state: 'TX',
    zipCodes: ['78201', '78202', '78203', '78204', '78205', '78206', '78207', '78208', '78209', '78210', '78211', '78212', '78213', '78214', '78215', '78216', '78217', '78218', '78219', '78220', '78221', '78222', '78223', '78224', '78225', '78226', '78227', '78228', '78229', '78230', '78231', '78232', '78233', '78234', '78235', '78236', '78237', '78238', '78239', '78240', '78241', '78242', '78243', '78244', '78245', '78246', '78247', '78248', '78249', '78250', '78251', '78252', '78253', '78254', '78255', '78256', '78257', '78258', '78259', '78260', '78261', '78263', '78264', '78265', '78266', '78268', '78269', '78270', '78278', '78279', '78280', '78283', '78284', '78285', '78288', '78289', '78291', '78292', '78293', '78294', '78295', '78296', '78297', '78298', '78299'],
    description: 'San Antonio, Texas residents can find EBT and SNAP-accepting stores throughout the Alamo City and surrounding Bexar County. From downtown San Antonio to the Medical Center, from the Riverwalk area to suburban neighborhoods, our database covers all major San Antonio areas. Major retailers like H-E-B, Walmart, Target, and local Hispanic markets accept EBT benefits. While Texas doesn\'t participate in the Restaurant Meals Program (RMP), EBT users can shop at authorized food retailers, farmers markets, and specialty stores throughout San Antonio.'
  },
  'san-diego': {
    name: 'San Diego',
    state: 'CA',
    zipCodes: ['92101', '92102', '92103', '92104', '92105', '92106', '92107', '92108', '92109', '92110', '92111', '92112', '92113', '92114', '92115', '92116', '92117', '92118', '92119', '92120', '92121', '92122', '92123', '92124', '92126', '92127', '92128', '92129', '92130', '92131', '92132', '92133', '92134', '92135', '92136', '92137', '92138', '92139', '92140', '92142', '92143', '92145', '92147', '92149', '92150', '92152', '92153', '92154', '92155', '92158', '92159', '92160', '92161', '92162', '92163', '92164', '92165', '92166', '92167', '92168', '92169', '92170', '92171', '92172', '92173', '92174', '92175', '92176', '92177', '92178', '92179', '92182', '92184', '92186', '92187', '92190', '92191', '92192', '92193', '92194', '92195', '92196', '92197', '92198', '92199'],
    description: 'San Diego, California offers numerous EBT and SNAP-accepting locations throughout America\'s Finest City. From downtown San Diego to La Jolla, from Pacific Beach to Chula Vista, our database helps San Diego residents find grocery stores, farmers markets, and participating restaurants. California participates in the Restaurant Meals Program (RMP), making San Diego an excellent city for EBT hot meal purchases at qualified restaurants. Major chains like Vons, Ralph\'s, Walmart, and Target accept EBT, along with numerous local markets, ethnic grocery stores, and farmers markets throughout San Diego County.'
  },
  'dallas': {
    name: 'Dallas',
    state: 'TX',
    zipCodes: ['75201', '75202', '75203', '75204', '75205', '75206', '75207', '75208', '75209', '75210', '75211', '75212', '75214', '75215', '75216', '75217', '75218', '75219', '75220', '75221', '75222', '75223', '75224', '75225', '75226', '75227', '75228', '75229', '75230', '75231', '75232', '75233', '75234', '75235', '75236', '75237', '75238', '75240', '75241', '75242', '75243', '75244', '75246', '75247', '75248', '75249', '75250', '75251', '75252', '75253', '75254', '75260', '75261', '75262', '75263', '75264', '75265', '75266', '75267', '75270', '75275', '75277', '75283', '75284', '75285', '75286', '75287', '75295', '75301', '75303', '75310', '75312', '75313', '75315', '75320', '75323', '75326', '75336', '75339', '75342', '75354', '75355', '75356', '75357', '75359', '75360', '75363', '75364', '75367', '75368', '75370', '75371', '75372', '75373', '75374', '75376', '75378', '75379', '75380', '75381', '75382', '75386', '75387', '75388', '75389', '75390', '75391', '75392', '75393', '75394', '75395', '75396', '75397', '75398'],
    description: 'Dallas, Texas residents can locate EBT and SNAP-accepting stores throughout the Dallas-Fort Worth metroplex. From downtown Dallas to Deep Ellum, from Uptown to Oak Cliff, our database covers all major Dallas neighborhoods and surrounding areas. Major retailers like Kroger, Tom Thumb, Walmart, and local Hispanic markets accept EBT benefits. While Texas doesn\'t participate in the Restaurant Meals Program (RMP), EBT users can shop at authorized food retailers, farmers markets, and specialty stores throughout Dallas County.'
  },
  'san-jose': {
    name: 'San Jose',
    state: 'CA',
    zipCodes: ['95101', '95103', '95106', '95108', '95109', '95110', '95111', '95112', '95113', '95116', '95117', '95118', '95119', '95120', '95121', '95122', '95123', '95124', '95125', '95126', '95127', '95128', '95129', '95130', '95131', '95132', '95133', '95134', '95135', '95136', '95138', '95139', '95140', '95141', '95148', '95150', '95151', '95152', '95153', '95154', '95155', '95156', '95157', '95158', '95159', '95160', '95161', '95164', '95170', '95172', '95173', '95190', '95191', '95192', '95193', '95194', '95196'],
    description: 'San Jose, California offers extensive EBT and SNAP-accepting locations throughout Silicon Valley. From downtown San Jose to Almaden Valley, from Willow Glen to East San Jose, our database helps San Jose residents find grocery stores, farmers markets, and participating restaurants. California participates in the Restaurant Meals Program (RMP), making San Jose an excellent city for EBT hot meal purchases at qualified restaurants. Major chains like Safeway, Lucky, Walmart, and Target accept EBT, along with numerous local markets, ethnic grocery stores, and farmers markets throughout Santa Clara County.'
  },
  'austin': {
    name: 'Austin',
    state: 'TX',
    zipCodes: ['73301', '73344', '78701', '78702', '78703', '78704', '78705', '78712', '78717', '78719', '78721', '78722', '78723', '78724', '78725', '78726', '78727', '78728', '78729', '78730', '78731', '78732', '78733', '78734', '78735', '78736', '78737', '78738', '78739', '78741', '78742', '78744', '78745', '78746', '78747', '78748', '78749', '78750', '78751', '78752', '78753', '78754', '78756', '78757', '78758', '78759', '78760', '78761', '78762', '78763', '78764', '78765', '78766', '78767', '78768', '78769', '78772', '78773', '78774', '78778', '78779', '78780', '78781', '78783', '78785', '78789', '78799'],
    description: 'Austin, Texas residents can find EBT and SNAP-accepting stores throughout the Live Music Capital of the World. From downtown Austin to South Austin, from East Austin to West Lake Hills, our database covers all major Austin neighborhoods and surrounding Travis County areas. Major retailers like H-E-B, Walmart, Target, and local markets accept EBT benefits. While Texas doesn\'t participate in the Restaurant Meals Program (RMP), EBT users can shop at authorized food retailers, farmers markets, food trucks, and specialty stores throughout Austin.'
  },
  'jacksonville': {
    name: 'Jacksonville',
    state: 'FL',
    zipCodes: ['32099', '32201', '32202', '32203', '32204', '32205', '32206', '32207', '32208', '32209', '32210', '32211', '32212', '32214', '32216', '32217', '32218', '32219', '32220', '32221', '32222', '32223', '32224', '32225', '32226', '32227', '32228', '32229', '32230', '32231', '32232', '32233', '32234', '32235', '32236', '32237', '32238', '32239', '32240', '32241', '32244', '32245', '32246', '32247', '32254', '32255', '32256', '32257', '32258', '32259', '32260', '32266', '32267', '32277', '32290'],
    description: 'Jacksonville, Florida offers numerous EBT and SNAP-accepting locations throughout the River City. From downtown Jacksonville to Jacksonville Beach, from Riverside to Mandarin, our database helps Jacksonville residents find grocery stores, corner stores, and farmers markets. Major chains like Publix, Winn-Dixie, Walmart, and Target accept EBT benefits, along with local markets and specialty stores throughout Duval County. While Florida doesn\'t currently participate in the Restaurant Meals Program (RMP), EBT users can shop at authorized food retailers and farmers markets throughout Jacksonville.'
  },
  'fort-worth': {
    name: 'Fort Worth',
    state: 'TX',
    zipCodes: ['76101', '76102', '76103', '76104', '76105', '76106', '76107', '76108', '76109', '76110', '76111', '76112', '76113', '76114', '76115', '76116', '76117', '76118', '76119', '76120', '76121', '76122', '76123', '76124', '76126', '76127', '76129', '76130', '76131', '76132', '76133', '76134', '76135', '76136', '76137', '76140', '76147', '76148', '76150', '76155', '76161', '76162', '76163', '76164', '76166', '76177', '76179', '76180', '76181', '76182', '76185', '76191', '76192', '76193', '76196', '76197', '76198', '76199'],
    description: 'Fort Worth, Texas residents can locate EBT and SNAP-accepting stores throughout Cowtown and surrounding Tarrant County. From downtown Fort Worth to the Cultural District, from the Stockyards to south Fort Worth, our database covers all major Fort Worth neighborhoods. Major retailers like Kroger, Tom Thumb, Walmart, and local markets accept EBT benefits. While Texas doesn\'t participate in the Restaurant Meals Program (RMP), EBT users can shop at authorized food retailers, farmers markets, and specialty stores throughout Fort Worth.'
  },
  'columbus': {
    name: 'Columbus',
    state: 'OH',
    zipCodes: ['43085', '43201', '43202', '43203', '43204', '43205', '43206', '43207', '43209', '43210', '43211', '43212', '43213', '43214', '43215', '43216', '43217', '43218', '43219', '43220', '43221', '43222', '43223', '43224', '43226', '43227', '43228', '43229', '43230', '43231', '43232', '43234', '43235', '43236', '43240', '43251', '43260', '43266', '43268', '43270', '43271', '43272', '43279', '43287', '43291'],
    description: 'Columbus, Ohio offers extensive EBT and SNAP-accepting locations throughout the capital city. From downtown Columbus to the Short North, from German Village to Clintonville, our database helps Columbus residents find grocery stores, corner stores, and farmers markets. Major chains like Kroger, Giant Eagle, Walmart, and Target accept EBT benefits, along with local markets and specialty stores throughout Franklin County. Ohio doesn\'t currently participate in the Restaurant Meals Program (RMP), but EBT users can shop at authorized food retailers and farmers markets throughout Columbus.'
  },
  'charlotte': {
    name: 'Charlotte',
    state: 'NC',
    zipCodes: ['28201', '28202', '28203', '28204', '28205', '28206', '28207', '28208', '28209', '28210', '28211', '28212', '28213', '28214', '28215', '28216', '28217', '28218', '28219', '28220', '28221', '28222', '28223', '28224', '28226', '28227', '28228', '28229', '28230', '28231', '28232', '28233', '28234', '28235', '28236', '28237', '28241', '28244', '28246', '28247', '28249', '28250', '28253', '28254', '28255', '28256', '28258', '28260', '28262', '28263', '28265', '28266', '28269', '28270', '28271', '28272', '28273', '28274', '28275', '28277', '28278', '28280', '28281', '28282', '28284', '28285', '28287', '28288', '28289', '28290', '28296', '28297', '28299'],
    description: 'Charlotte, North Carolina offers numerous EBT and SNAP-accepting locations throughout the Queen City. From Uptown Charlotte to South End, from NoDa to Matthews, our database helps Charlotte residents find grocery stores, corner stores, and farmers markets. Major chains like Harris Teeter, Food Lion, Walmart, and Target accept EBT benefits, along with local markets and specialty stores throughout Mecklenburg County. North Carolina doesn\'t currently participate in the Restaurant Meals Program (RMP), but EBT users can shop at authorized food retailers and farmers markets throughout Charlotte.'
  },
  'san-francisco': {
    name: 'San Francisco',
    state: 'CA',
    zipCodes: ['94102', '94103', '94104', '94105', '94107', '94108', '94109', '94110', '94111', '94112', '94114', '94115', '94116', '94117', '94118', '94119', '94120', '94121', '94122', '94123', '94124', '94125', '94126', '94127', '94128', '94129', '94130', '94131', '94132', '94133', '94134', '94137', '94139', '94140', '94141', '94142', '94143', '94144', '94145', '94146', '94147', '94151', '94158', '94159', '94160', '94161', '94163', '94164', '94172', '94177', '94188'],
    description: 'San Francisco, California offers extensive EBT and SNAP-accepting locations throughout the City by the Bay. From downtown San Francisco to the Mission District, from Chinatown to the Sunset, our database helps San Francisco residents find grocery stores, corner stores, and farmers markets. California participates in the Restaurant Meals Program (RMP), making San Francisco an excellent city for EBT hot meal purchases at qualified restaurants. Major chains like Safeway, Whole Foods, Walmart (in nearby areas), and Target accept EBT, along with numerous local markets, ethnic grocery stores, and farmers markets throughout San Francisco County.'
  },
  'fresno': {
    name: 'Fresno',
    state: 'CA',
    zipCodes: ['93701', '93702', '93703', '93704', '93705', '93706', '93707', '93708', '93709', '93710', '93711', '93712', '93714', '93715', '93716', '93717', '93718', '93720', '93721', '93722', '93723', '93724', '93725', '93726', '93727', '93728', '93729', '93730', '93737', '93740', '93741', '93744', '93745', '93747', '93750', '93755', '93760', '93761', '93764', '93765', '93771', '93772', '93773', '93774', '93775', '93776', '93777', '93778', '93779', '93786', '93790', '93791', '93792', '93793', '93794'],
    description: 'Finding EBT-accepting stores in Fresno, California has never been easier. Our comprehensive database helps Fresno residents locate grocery stores, convenience stores, farmers markets, and restaurants that accept SNAP benefits and participate in the Restaurant Meals Program (RMP). Whether you\'re in downtown Fresno, the Tower District, or surrounding neighborhoods, use our ZIP code search to find the closest EBT-friendly locations. Fresno County has numerous participating retailers, from major chains like Walmart and Target to local markets and specialty stores. Many locations also accept hot meal purchases through California\'s RMP program, perfect for elderly, disabled, or homeless individuals who qualify.'
  }
};

const CityPage: React.FC = () => {
  const { citySlug } = useParams<{ citySlug: string }>();
  const location = useLocation();
  
  // Extract city slug from pathname if not in params (for hardcoded routes)
  const actualCitySlug = citySlug || location.pathname.slice(1);
  const city = actualCitySlug ? cityData[actualCitySlug as keyof typeof cityData] : null;

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
  const canonicalUrl = `https://ebtfinder.org/${actualCitySlug}`;

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
