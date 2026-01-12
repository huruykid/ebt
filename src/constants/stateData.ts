interface StateData {
  name: string;
  abbr: string;
  lat: number;
  lng: number;
  storeCount: number;
  rmpParticipating: boolean;
  description: string;
}

interface CityLink {
  name: string;
  slug: string;
  state: string;
}

// States participating in Restaurant Meals Program (RMP)
const RMP_STATES = ['AZ', 'CA', 'IL', 'MD', 'MI', 'NY', 'RI', 'VA'];

export const stateData: Record<string, StateData> = {
  'alabama': { name: 'Alabama', abbr: 'AL', lat: 32.806671, lng: -86.791130, storeCount: 4200, rmpParticipating: false, description: 'Find EBT and SNAP-accepting stores across Alabama. From Birmingham to Mobile, Montgomery to Huntsville, our database covers grocery stores, farmers markets, and retailers throughout the Heart of Dixie.' },
  'alaska': { name: 'Alaska', abbr: 'AK', lat: 61.370716, lng: -152.404419, storeCount: 800, rmpParticipating: false, description: 'Locate SNAP retailers in Alaska from Anchorage to Fairbanks and beyond. Our database helps Alaska residents find grocery stores and markets accepting EBT benefits.' },
  'arizona': { name: 'Arizona', abbr: 'AZ', lat: 33.729759, lng: -111.431221, storeCount: 5800, rmpParticipating: true, description: 'Arizona participates in the Restaurant Meals Program (RMP). Find grocery stores, farmers markets, and RMP restaurants accepting EBT from Phoenix to Tucson and throughout the Grand Canyon State.' },
  'arkansas': { name: 'Arkansas', abbr: 'AR', lat: 34.969704, lng: -92.373123, storeCount: 2900, rmpParticipating: false, description: 'Find EBT-accepting stores across Arkansas from Little Rock to Fayetteville. Our comprehensive database covers grocery stores, convenience stores, and farmers markets.' },
  'california': { name: 'California', abbr: 'CA', lat: 36.116203, lng: -119.681564, storeCount: 42000, rmpParticipating: true, description: 'California offers the largest network of EBT retailers in the nation with full RMP participation. Find grocery stores, farmers markets, and restaurants from Los Angeles to San Francisco, San Diego to Sacramento.' },
  'colorado': { name: 'Colorado', abbr: 'CO', lat: 39.059811, lng: -105.311104, storeCount: 4500, rmpParticipating: false, description: 'Discover EBT and SNAP-accepting locations throughout Colorado. From Denver to Colorado Springs, Boulder to Fort Collins, find grocery stores, markets, and retailers.' },
  'connecticut': { name: 'Connecticut', abbr: 'CT', lat: 41.597782, lng: -72.755371, storeCount: 2800, rmpParticipating: false, description: 'Find SNAP retailers across Connecticut from Hartford to New Haven, Stamford to Bridgeport. Our database covers grocery stores, bodegas, and farmers markets.' },
  'delaware': { name: 'Delaware', abbr: 'DE', lat: 39.318523, lng: -75.507141, storeCount: 900, rmpParticipating: false, description: 'Locate EBT-accepting stores in Delaware from Wilmington to Dover and throughout the First State.' },
  'florida': { name: 'Florida', abbr: 'FL', lat: 27.766279, lng: -81.686783, storeCount: 18000, rmpParticipating: false, description: 'Find EBT and SNAP retailers across the Sunshine State. From Miami to Jacksonville, Tampa to Orlando, our database covers Publix, Walmart, Winn-Dixie, and local markets.' },
  'georgia': { name: 'Georgia', abbr: 'GA', lat: 33.040619, lng: -83.643074, storeCount: 8500, rmpParticipating: false, description: 'Discover SNAP-accepting stores throughout Georgia from Atlanta to Savannah, Augusta to Columbus. Find Kroger, Publix, Walmart, and local markets.' },
  'hawaii': { name: 'Hawaii', abbr: 'HI', lat: 21.094318, lng: -157.498337, storeCount: 1200, rmpParticipating: false, description: 'Find EBT retailers across the Hawaiian islands from Honolulu to Maui, Big Island to Kauai. Our database covers grocery stores, markets, and local shops.' },
  'idaho': { name: 'Idaho', abbr: 'ID', lat: 44.240459, lng: -114.478828, storeCount: 1600, rmpParticipating: false, description: 'Locate SNAP-accepting stores in Idaho from Boise to Idaho Falls, Pocatello to Twin Falls.' },
  'illinois': { name: 'Illinois', abbr: 'IL', lat: 40.349457, lng: -88.986137, storeCount: 11000, rmpParticipating: true, description: 'Illinois participates in RMP. Find EBT retailers from Chicago to Springfield, Rockford to Peoria. Our database covers grocery stores, corner stores, and RMP restaurants.' },
  'indiana': { name: 'Indiana', abbr: 'IN', lat: 39.849426, lng: -86.258278, storeCount: 5200, rmpParticipating: false, description: 'Find SNAP retailers across Indiana from Indianapolis to Fort Wayne, South Bend to Evansville. Discover Kroger, Meijer, Walmart, and local markets.' },
  'iowa': { name: 'Iowa', abbr: 'IA', lat: 42.011539, lng: -93.210526, storeCount: 2800, rmpParticipating: false, description: 'Locate EBT-accepting stores in Iowa from Des Moines to Cedar Rapids, Davenport to Sioux City.' },
  'kansas': { name: 'Kansas', abbr: 'KS', lat: 38.526600, lng: -96.726486, storeCount: 2400, rmpParticipating: false, description: 'Find SNAP retailers across Kansas from Wichita to Kansas City, Topeka to Lawrence.' },
  'kentucky': { name: 'Kentucky', abbr: 'KY', lat: 37.668140, lng: -84.670067, storeCount: 4100, rmpParticipating: false, description: 'Discover EBT-accepting stores throughout Kentucky from Louisville to Lexington, Bowling Green to Owensboro.' },
  'louisiana': { name: 'Louisiana', abbr: 'LA', lat: 31.169546, lng: -91.867805, storeCount: 4800, rmpParticipating: false, description: 'Find SNAP retailers across Louisiana from New Orleans to Baton Rouge, Shreveport to Lafayette.' },
  'maine': { name: 'Maine', abbr: 'ME', lat: 44.693947, lng: -69.381927, storeCount: 1400, rmpParticipating: false, description: 'Locate EBT-accepting stores in Maine from Portland to Bangor, Augusta to Lewiston.' },
  'maryland': { name: 'Maryland', abbr: 'MD', lat: 39.063946, lng: -76.802101, storeCount: 4600, rmpParticipating: true, description: 'Maryland participates in RMP in some areas. Find EBT retailers from Baltimore to Silver Spring, Bethesda to Annapolis.' },
  'massachusetts': { name: 'Massachusetts', abbr: 'MA', lat: 42.230171, lng: -71.530106, storeCount: 5200, rmpParticipating: false, description: 'Find SNAP-accepting stores across Massachusetts from Boston to Worcester, Springfield to Cambridge.' },
  'michigan': { name: 'Michigan', abbr: 'MI', lat: 43.326618, lng: -84.536095, storeCount: 8200, rmpParticipating: true, description: 'Michigan participates in RMP. Find EBT retailers from Detroit to Grand Rapids, Ann Arbor to Lansing. Discover Meijer, Kroger, and local markets.' },
  'minnesota': { name: 'Minnesota', abbr: 'MN', lat: 45.694454, lng: -93.900192, storeCount: 4100, rmpParticipating: false, description: 'Locate SNAP retailers in Minnesota from Minneapolis to St. Paul, Rochester to Duluth.' },
  'mississippi': { name: 'Mississippi', abbr: 'MS', lat: 32.741646, lng: -89.678696, storeCount: 3200, rmpParticipating: false, description: 'Find EBT-accepting stores across Mississippi from Jackson to Gulfport, Biloxi to Hattiesburg.' },
  'missouri': { name: 'Missouri', abbr: 'MO', lat: 38.456085, lng: -92.288368, storeCount: 5400, rmpParticipating: false, description: 'Discover SNAP retailers throughout Missouri from St. Louis to Kansas City, Springfield to Columbia.' },
  'montana': { name: 'Montana', abbr: 'MT', lat: 46.921925, lng: -110.454353, storeCount: 1100, rmpParticipating: false, description: 'Find EBT retailers in Montana from Billings to Missoula, Great Falls to Bozeman.' },
  'nebraska': { name: 'Nebraska', abbr: 'NE', lat: 41.125370, lng: -98.268082, storeCount: 1700, rmpParticipating: false, description: 'Locate SNAP-accepting stores in Nebraska from Omaha to Lincoln, Grand Island to Bellevue.' },
  'nevada': { name: 'Nevada', abbr: 'NV', lat: 38.313515, lng: -117.055374, storeCount: 2400, rmpParticipating: false, description: 'Find EBT retailers across Nevada from Las Vegas to Reno, Henderson to North Las Vegas.' },
  'new-hampshire': { name: 'New Hampshire', abbr: 'NH', lat: 43.452492, lng: -71.563896, storeCount: 1100, rmpParticipating: false, description: 'Discover SNAP retailers in New Hampshire from Manchester to Nashua, Concord to Portsmouth.' },
  'new-jersey': { name: 'New Jersey', abbr: 'NJ', lat: 40.298904, lng: -74.521011, storeCount: 7200, rmpParticipating: false, description: 'Find EBT-accepting stores across New Jersey from Newark to Jersey City, Paterson to Elizabeth.' },
  'new-mexico': { name: 'New Mexico', abbr: 'NM', lat: 34.840515, lng: -106.248482, storeCount: 1800, rmpParticipating: false, description: 'Locate SNAP retailers in New Mexico from Albuquerque to Santa Fe, Las Cruces to Rio Rancho.' },
  'new-york': { name: 'New York', abbr: 'NY', lat: 42.165726, lng: -74.948051, storeCount: 18500, rmpParticipating: true, description: 'New York participates in RMP. Find EBT retailers from NYC to Buffalo, Albany to Rochester. Discover grocery stores, bodegas, and RMP restaurants.' },
  'north-carolina': { name: 'North Carolina', abbr: 'NC', lat: 35.630066, lng: -79.806419, storeCount: 8100, rmpParticipating: false, description: 'Find SNAP-accepting stores across North Carolina from Charlotte to Raleigh, Greensboro to Durham.' },
  'north-dakota': { name: 'North Dakota', abbr: 'ND', lat: 47.528912, lng: -99.784012, storeCount: 700, rmpParticipating: false, description: 'Locate EBT retailers in North Dakota from Fargo to Bismarck, Grand Forks to Minot.' },
  'ohio': { name: 'Ohio', abbr: 'OH', lat: 40.388783, lng: -82.764915, storeCount: 10200, rmpParticipating: false, description: 'Find SNAP retailers across Ohio from Columbus to Cleveland, Cincinnati to Toledo. Discover Kroger, Meijer, Giant Eagle, and local markets.' },
  'oklahoma': { name: 'Oklahoma', abbr: 'OK', lat: 35.565342, lng: -96.928917, storeCount: 3600, rmpParticipating: false, description: 'Discover EBT-accepting stores in Oklahoma from Oklahoma City to Tulsa, Norman to Lawton.' },
  'oregon': { name: 'Oregon', abbr: 'OR', lat: 44.572021, lng: -122.070938, storeCount: 3400, rmpParticipating: false, description: 'Find SNAP retailers across Oregon from Portland to Eugene, Salem to Bend.' },
  'pennsylvania': { name: 'Pennsylvania', abbr: 'PA', lat: 40.590752, lng: -77.209755, storeCount: 11500, rmpParticipating: false, description: 'Locate EBT-accepting stores in Pennsylvania from Philadelphia to Pittsburgh, Allentown to Erie.' },
  'rhode-island': { name: 'Rhode Island', abbr: 'RI', lat: 41.680893, lng: -71.511780, storeCount: 900, rmpParticipating: true, description: 'Rhode Island participates in RMP. Find EBT retailers from Providence to Warwick, Cranston to Pawtucket.' },
  'south-carolina': { name: 'South Carolina', abbr: 'SC', lat: 33.856892, lng: -80.945007, storeCount: 4200, rmpParticipating: false, description: 'Find SNAP-accepting stores across South Carolina from Charleston to Columbia, Greenville to Myrtle Beach.' },
  'south-dakota': { name: 'South Dakota', abbr: 'SD', lat: 44.299782, lng: -99.438828, storeCount: 800, rmpParticipating: false, description: 'Locate EBT retailers in South Dakota from Sioux Falls to Rapid City, Aberdeen to Brookings.' },
  'tennessee': { name: 'Tennessee', abbr: 'TN', lat: 35.747845, lng: -86.692345, storeCount: 5800, rmpParticipating: false, description: 'Find SNAP retailers across Tennessee from Nashville to Memphis, Knoxville to Chattanooga.' },
  'texas': { name: 'Texas', abbr: 'TX', lat: 31.054487, lng: -97.563461, storeCount: 28000, rmpParticipating: false, description: 'Discover EBT-accepting stores throughout Texas from Houston to Dallas, San Antonio to Austin. Find H-E-B, Walmart, Kroger, and local markets.' },
  'utah': { name: 'Utah', abbr: 'UT', lat: 40.150032, lng: -111.862434, storeCount: 2100, rmpParticipating: false, description: 'Find SNAP retailers in Utah from Salt Lake City to Provo, West Valley City to Ogden.' },
  'vermont': { name: 'Vermont', abbr: 'VT', lat: 44.045876, lng: -72.710686, storeCount: 600, rmpParticipating: false, description: 'Locate EBT-accepting stores in Vermont from Burlington to South Burlington, Rutland to Barre.' },
  'virginia': { name: 'Virginia', abbr: 'VA', lat: 37.769337, lng: -78.169968, storeCount: 6200, rmpParticipating: true, description: 'Virginia participates in RMP. Find EBT retailers from Virginia Beach to Norfolk, Richmond to Arlington.' },
  'washington': { name: 'Washington', abbr: 'WA', lat: 47.400902, lng: -121.490494, storeCount: 5800, rmpParticipating: false, description: 'Find SNAP retailers across Washington from Seattle to Spokane, Tacoma to Vancouver.' },
  'west-virginia': { name: 'West Virginia', abbr: 'WV', lat: 38.491226, lng: -80.954453, storeCount: 1800, rmpParticipating: false, description: 'Discover EBT-accepting stores in West Virginia from Charleston to Huntington, Morgantown to Parkersburg.' },
  'wisconsin': { name: 'Wisconsin', abbr: 'WI', lat: 44.268543, lng: -89.616508, storeCount: 4800, rmpParticipating: false, description: 'Find SNAP retailers across Wisconsin from Milwaukee to Madison, Green Bay to Kenosha.' },
  'wyoming': { name: 'Wyoming', abbr: 'WY', lat: 42.755966, lng: -107.302490, storeCount: 500, rmpParticipating: false, description: 'Locate EBT retailers in Wyoming from Cheyenne to Casper, Laramie to Gillette.' },
  'washington-dc': { name: 'Washington D.C.', abbr: 'DC', lat: 38.907192, lng: -77.036871, storeCount: 800, rmpParticipating: false, description: 'Find SNAP-accepting stores in Washington D.C. from Capitol Hill to Georgetown, Adams Morgan to Anacostia.' }
};

// City data mapping for linking to city pages
const cityToState: Record<string, CityLink[]> = {
  'CA': [
    { name: 'Los Angeles', slug: 'los-angeles', state: 'CA' },
    { name: 'San Diego', slug: 'san-diego', state: 'CA' },
    { name: 'San Jose', slug: 'san-jose', state: 'CA' },
    { name: 'San Francisco', slug: 'san-francisco', state: 'CA' },
    { name: 'Fresno', slug: 'fresno', state: 'CA' },
    { name: 'Sacramento', slug: 'sacramento', state: 'CA' },
    { name: 'Long Beach', slug: 'long-beach', state: 'CA' },
    { name: 'Oakland', slug: 'oakland', state: 'CA' },
    { name: 'Bakersfield', slug: 'bakersfield', state: 'CA' },
    { name: 'Anaheim', slug: 'anaheim', state: 'CA' },
    { name: 'Riverside', slug: 'riverside', state: 'CA' },
    { name: 'Stockton', slug: 'stockton', state: 'CA' },
  ],
  'TX': [
    { name: 'Houston', slug: 'houston', state: 'TX' },
    { name: 'San Antonio', slug: 'san-antonio', state: 'TX' },
    { name: 'Dallas', slug: 'dallas', state: 'TX' },
    { name: 'Austin', slug: 'austin', state: 'TX' },
    { name: 'Fort Worth', slug: 'fort-worth', state: 'TX' },
    { name: 'El Paso', slug: 'el-paso', state: 'TX' },
    { name: 'Arlington', slug: 'arlington', state: 'TX' },
    { name: 'Plano', slug: 'plano', state: 'TX' },
    { name: 'Laredo', slug: 'laredo', state: 'TX' },
    { name: 'Lubbock', slug: 'lubbock', state: 'TX' },
    { name: 'Garland', slug: 'garland', state: 'TX' },
  ],
  'FL': [
    { name: 'Miami', slug: 'miami', state: 'FL' },
    { name: 'Jacksonville', slug: 'jacksonville', state: 'FL' },
    { name: 'Orlando', slug: 'orlando', state: 'FL' },
    { name: 'Tampa', slug: 'tampa', state: 'FL' },
    { name: 'St. Petersburg', slug: 'st-petersburg', state: 'FL' },
    { name: 'Hialeah', slug: 'hialeah', state: 'FL' },
  ],
  'NY': [
    { name: 'New York City', slug: 'new-york', state: 'NY' },
    { name: 'Brooklyn', slug: 'brooklyn', state: 'NY' },
    { name: 'Buffalo', slug: 'buffalo', state: 'NY' },
    { name: 'Rochester', slug: 'rochester', state: 'NY' },
    { name: 'Yonkers', slug: 'yonkers', state: 'NY' },
  ],
  'IL': [
    { name: 'Chicago', slug: 'chicago', state: 'IL' },
    { name: 'Aurora', slug: 'aurora', state: 'IL' },
  ],
  'PA': [
    { name: 'Philadelphia', slug: 'philadelphia', state: 'PA' },
    { name: 'Pittsburgh', slug: 'pittsburgh', state: 'PA' },
  ],
  'AZ': [
    { name: 'Phoenix', slug: 'phoenix', state: 'AZ' },
    { name: 'Tucson', slug: 'tucson', state: 'AZ' },
    { name: 'Mesa', slug: 'mesa', state: 'AZ' },
    { name: 'Chandler', slug: 'chandler', state: 'AZ' },
    { name: 'Scottsdale', slug: 'scottsdale', state: 'AZ' },
    { name: 'Gilbert', slug: 'gilbert', state: 'AZ' },
    { name: 'Glendale', slug: 'glendale-az', state: 'AZ' },
  ],
  'OH': [
    { name: 'Columbus', slug: 'columbus', state: 'OH' },
    { name: 'Cleveland', slug: 'cleveland', state: 'OH' },
    { name: 'Cincinnati', slug: 'cincinnati', state: 'OH' },
    { name: 'Toledo', slug: 'toledo', state: 'OH' },
  ],
  'GA': [
    { name: 'Atlanta', slug: 'atlanta', state: 'GA' },
  ],
  'NC': [
    { name: 'Charlotte', slug: 'charlotte', state: 'NC' },
    { name: 'Raleigh', slug: 'raleigh', state: 'NC' },
    { name: 'Greensboro', slug: 'greensboro', state: 'NC' },
    { name: 'Durham', slug: 'durham', state: 'NC' },
    { name: 'Fayetteville', slug: 'fayetteville', state: 'NC' },
  ],
  'MI': [
    { name: 'Detroit', slug: 'detroit', state: 'MI' },
    { name: 'Grand Rapids', slug: 'grand-rapids', state: 'MI' },
  ],
  'NJ': [
    { name: 'Newark', slug: 'newark', state: 'NJ' },
    { name: 'Jersey City', slug: 'jersey-city', state: 'NJ' },
  ],
  'VA': [
    { name: 'Virginia Beach', slug: 'virginia-beach', state: 'VA' },
    { name: 'Norfolk', slug: 'norfolk', state: 'VA' },
    { name: 'Richmond', slug: 'richmond', state: 'VA' },
  ],
  'WA': [
    { name: 'Seattle', slug: 'seattle', state: 'WA' },
    { name: 'Spokane', slug: 'spokane', state: 'WA' },
    { name: 'Tacoma', slug: 'tacoma', state: 'WA' },
  ],
  'MA': [
    { name: 'Boston', slug: 'boston', state: 'MA' },
    { name: 'Worcester', slug: 'worcester', state: 'MA' },
  ],
  'TN': [
    { name: 'Nashville', slug: 'nashville', state: 'TN' },
    { name: 'Memphis', slug: 'memphis', state: 'TN' },
  ],
  'CO': [
    { name: 'Denver', slug: 'denver', state: 'CO' },
    { name: 'Colorado Springs', slug: 'colorado-springs', state: 'CO' },
    { name: 'Aurora', slug: 'aurora-co', state: 'CO' },
  ],
  'IN': [
    { name: 'Indianapolis', slug: 'indianapolis', state: 'IN' },
    { name: 'Fort Wayne', slug: 'fort-wayne', state: 'IN' },
  ],
  'MD': [
    { name: 'Baltimore', slug: 'baltimore', state: 'MD' },
  ],
  'WI': [
    { name: 'Milwaukee', slug: 'milwaukee', state: 'WI' },
    { name: 'Madison', slug: 'madison', state: 'WI' },
  ],
  'MN': [
    { name: 'Minneapolis', slug: 'minneapolis', state: 'MN' },
    { name: 'St. Paul', slug: 'st-paul', state: 'MN' },
  ],
  'MO': [
    { name: 'Kansas City', slug: 'kansas-city', state: 'MO' },
    { name: 'St. Louis', slug: 'st-louis', state: 'MO' },
  ],
  'OK': [
    { name: 'Oklahoma City', slug: 'oklahoma-city', state: 'OK' },
    { name: 'Tulsa', slug: 'tulsa', state: 'OK' },
  ],
  'OR': [
    { name: 'Portland', slug: 'portland', state: 'OR' },
  ],
  'NV': [
    { name: 'Las Vegas', slug: 'las-vegas', state: 'NV' },
    { name: 'Henderson', slug: 'henderson', state: 'NV' },
    { name: 'Reno', slug: 'reno', state: 'NV' },
    { name: 'North Las Vegas', slug: 'north-las-vegas', state: 'NV' },
  ],
  'KY': [
    { name: 'Louisville', slug: 'louisville', state: 'KY' },
    { name: 'Lexington', slug: 'lexington', state: 'KY' },
  ],
  'LA': [
    { name: 'New Orleans', slug: 'new-orleans', state: 'LA' },
    { name: 'Baton Rouge', slug: 'baton-rouge', state: 'LA' },
  ],
  'AL': [
    { name: 'Birmingham', slug: 'birmingham', state: 'AL' },
    { name: 'Montgomery', slug: 'montgomery', state: 'AL' },
  ],
  'NM': [
    { name: 'Albuquerque', slug: 'albuquerque', state: 'NM' },
  ],
  'KS': [
    { name: 'Wichita', slug: 'wichita', state: 'KS' },
  ],
  'NE': [
    { name: 'Omaha', slug: 'omaha', state: 'NE' },
    { name: 'Lincoln', slug: 'lincoln', state: 'NE' },
  ],
  'UT': [
    { name: 'Salt Lake City', slug: 'salt-lake-city', state: 'UT' },
  ],
  'ID': [
    { name: 'Boise', slug: 'boise', state: 'ID' },
  ],
  'IA': [
    { name: 'Des Moines', slug: 'des-moines', state: 'IA' },
  ],
};

export function getCitiesForState(stateAbbr: string): CityLink[] {
  return cityToState[stateAbbr] || [];
}

export function getStateByAbbr(abbr: string): StateData | undefined {
  return Object.values(stateData).find(s => s.abbr === abbr);
}

export function getAllStates(): StateData[] {
  return Object.values(stateData);
}
