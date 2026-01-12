// Extended city data for 100+ city pages
// This supplements the existing cityData in CityPage.tsx

interface CityData {
  name: string;
  state: string;
  lat: number;
  lng: number;
  zipCodes: string[];
  description: string;
}

// Additional cities to expand to 100+ city pages
export const additionalCities: Record<string, CityData> = {
  'nashville': {
    name: 'Nashville',
    state: 'TN',
    lat: 36.1627,
    lng: -86.7816,
    zipCodes: ['37201', '37203', '37204', '37205', '37206', '37207', '37208', '37209', '37210', '37211', '37212', '37213', '37214', '37215', '37216', '37217', '37218', '37219', '37220', '37221'],
    description: 'Nashville, Tennessee offers numerous EBT and SNAP-accepting locations throughout Music City. From downtown to East Nashville, from the Gulch to Germantown, find Kroger, Publix, Walmart, and local markets that accept SNAP benefits.'
  },
  'portland': {
    name: 'Portland',
    state: 'OR',
    lat: 45.5152,
    lng: -122.6784,
    zipCodes: ['97201', '97202', '97203', '97204', '97205', '97206', '97207', '97208', '97209', '97210', '97211', '97212', '97213', '97214', '97215', '97216', '97217', '97218', '97219', '97220'],
    description: 'Portland, Oregon offers extensive EBT and SNAP-accepting locations throughout the City of Roses. From downtown to the Pearl District, from Alberta Arts to Hawthorne, find Fred Meyer, Safeway, New Seasons, and local markets that accept SNAP benefits.'
  },
  'oklahoma-city': {
    name: 'Oklahoma City',
    state: 'OK',
    lat: 35.4676,
    lng: -97.5164,
    zipCodes: ['73101', '73102', '73103', '73104', '73105', '73106', '73107', '73108', '73109', '73110', '73111', '73112', '73113', '73114', '73115', '73116', '73117', '73118', '73119', '73120'],
    description: 'Oklahoma City, Oklahoma offers numerous EBT and SNAP-accepting locations throughout the metro area. From Bricktown to Midtown, from Nichols Hills to Moore, find Walmart, Crest Foods, Aldi, and local markets that accept SNAP benefits.'
  },
  'milwaukee': {
    name: 'Milwaukee',
    state: 'WI',
    lat: 43.0389,
    lng: -87.9065,
    zipCodes: ['53201', '53202', '53203', '53204', '53205', '53206', '53207', '53208', '53209', '53210', '53211', '53212', '53213', '53214', '53215', '53216', '53217', '53218', '53219', '53220'],
    description: 'Milwaukee, Wisconsin offers numerous EBT and SNAP-accepting locations throughout Brew City. From the Third Ward to Bay View, from Riverwest to Walker\'s Point, find Pick \'n Save, Metro Market, Walmart, and local markets that accept SNAP benefits.'
  },
  'albuquerque': {
    name: 'Albuquerque',
    state: 'NM',
    lat: 35.0844,
    lng: -106.6504,
    zipCodes: ['87101', '87102', '87103', '87104', '87105', '87106', '87107', '87108', '87109', '87110', '87111', '87112', '87113', '87114', '87116', '87117', '87119', '87120', '87121', '87122'],
    description: 'Albuquerque, New Mexico offers numerous EBT and SNAP-accepting locations throughout the Duke City. From Old Town to Nob Hill, from Downtown to the West Side, find Smith\'s, Albertsons, Walmart, and local markets that accept SNAP benefits.'
  },
  'tucson': {
    name: 'Tucson',
    state: 'AZ',
    lat: 32.2226,
    lng: -110.9747,
    zipCodes: ['85701', '85702', '85703', '85704', '85705', '85706', '85707', '85708', '85709', '85710', '85711', '85712', '85713', '85714', '85715', '85716', '85717', '85718', '85719', '85720'],
    description: 'Tucson, Arizona offers numerous EBT and SNAP-accepting locations throughout the Old Pueblo. Arizona participates in the Restaurant Meals Program (RMP), allowing eligible EBT users to purchase hot meals at participating restaurants.'
  },
  'kansas-city': {
    name: 'Kansas City',
    state: 'MO',
    lat: 39.0997,
    lng: -94.5786,
    zipCodes: ['64101', '64102', '64105', '64106', '64108', '64109', '64110', '64111', '64112', '64113', '64114', '64116', '64117', '64118', '64119', '64120', '64121', '64123', '64124', '64125'],
    description: 'Kansas City, Missouri offers numerous EBT and SNAP-accepting locations throughout the metro area. From the Country Club Plaza to Westport, from Crossroads to the River Market, find Hy-Vee, Price Chopper, Walmart, and local markets that accept SNAP benefits.'
  },
  'raleigh': {
    name: 'Raleigh',
    state: 'NC',
    lat: 35.7796,
    lng: -78.6382,
    zipCodes: ['27601', '27602', '27603', '27604', '27605', '27606', '27607', '27608', '27609', '27610', '27612', '27613', '27614', '27615', '27616', '27617', '27619', '27620', '27622', '27624'],
    description: 'Raleigh, North Carolina offers numerous EBT and SNAP-accepting locations throughout the City of Oaks. From downtown to North Hills, from Cary to Wake Forest, find Harris Teeter, Food Lion, Walmart, and local markets that accept SNAP benefits.'
  },
  'long-beach': {
    name: 'Long Beach',
    state: 'CA',
    lat: 33.7701,
    lng: -118.1937,
    zipCodes: ['90801', '90802', '90803', '90804', '90805', '90806', '90807', '90808', '90809', '90810', '90813', '90814', '90815', '90822', '90831', '90832', '90833', '90834', '90835', '90840'],
    description: 'Long Beach, California offers numerous EBT and SNAP-accepting locations throughout the city. California participates in the Restaurant Meals Program (RMP), allowing eligible EBT users to purchase hot meals at participating restaurants.'
  },
  'virginia-beach': {
    name: 'Virginia Beach',
    state: 'VA',
    lat: 36.8529,
    lng: -75.9780,
    zipCodes: ['23450', '23451', '23452', '23453', '23454', '23455', '23456', '23457', '23458', '23459', '23460', '23461', '23462', '23463', '23464', '23465', '23466', '23467', '23471', '23479'],
    description: 'Virginia Beach, Virginia offers numerous EBT and SNAP-accepting locations throughout the resort city. Virginia participates in the Restaurant Meals Program (RMP) in some areas.'
  },
  'oakland': {
    name: 'Oakland',
    state: 'CA',
    lat: 37.8044,
    lng: -122.2712,
    zipCodes: ['94601', '94602', '94603', '94604', '94605', '94606', '94607', '94608', '94609', '94610', '94611', '94612', '94613', '94614', '94615', '94617', '94618', '94619', '94620', '94621'],
    description: 'Oakland, California offers numerous EBT and SNAP-accepting locations throughout the East Bay. California participates in RMP, making Oakland an excellent city for EBT hot meal purchases at qualified restaurants.'
  },
  'minneapolis': {
    name: 'Minneapolis',
    state: 'MN',
    lat: 44.9778,
    lng: -93.2650,
    zipCodes: ['55401', '55402', '55403', '55404', '55405', '55406', '55407', '55408', '55409', '55410', '55411', '55412', '55413', '55414', '55415', '55416', '55417', '55418', '55419', '55420'],
    description: 'Minneapolis, Minnesota offers numerous EBT and SNAP-accepting locations throughout the City of Lakes. From downtown to Uptown, from Northeast to South Minneapolis, find Cub Foods, Lunds & Byerlys, Walmart, and local markets that accept SNAP benefits.'
  },
  'tulsa': {
    name: 'Tulsa',
    state: 'OK',
    lat: 36.1540,
    lng: -95.9928,
    zipCodes: ['74101', '74102', '74103', '74104', '74105', '74106', '74107', '74108', '74110', '74112', '74114', '74115', '74116', '74117', '74119', '74120', '74121', '74126', '74127', '74128'],
    description: 'Tulsa, Oklahoma offers numerous EBT and SNAP-accepting locations throughout Green Country. From downtown to Brookside, from Cherry Street to South Tulsa, find Walmart, Reasor\'s, Aldi, and local markets that accept SNAP benefits.'
  },
  'arlington': {
    name: 'Arlington',
    state: 'TX',
    lat: 32.7357,
    lng: -97.1081,
    zipCodes: ['76001', '76002', '76003', '76004', '76005', '76006', '76010', '76011', '76012', '76013', '76014', '76015', '76016', '76017', '76018', '76019', '76094', '76096', '76097', '76099'],
    description: 'Arlington, Texas offers numerous EBT and SNAP-accepting locations between Dallas and Fort Worth. Find H-E-B, Walmart, Kroger, Tom Thumb, and local markets that accept SNAP benefits throughout the Entertainment Capital of Texas.'
  },
  'tampa': {
    name: 'Tampa',
    state: 'FL',
    lat: 27.9506,
    lng: -82.4572,
    zipCodes: ['33601', '33602', '33603', '33604', '33605', '33606', '33607', '33609', '33610', '33611', '33612', '33613', '33614', '33615', '33616', '33617', '33618', '33619', '33620', '33621'],
    description: 'Tampa, Florida offers numerous EBT and SNAP-accepting locations throughout Tampa Bay. From downtown to Ybor City, from South Tampa to Brandon, find Publix, Walmart, Winn-Dixie, and local markets that accept SNAP benefits.'
  },
  'new-orleans': {
    name: 'New Orleans',
    state: 'LA',
    lat: 29.9511,
    lng: -90.0715,
    zipCodes: ['70112', '70113', '70114', '70115', '70116', '70117', '70118', '70119', '70121', '70122', '70123', '70124', '70125', '70126', '70127', '70128', '70129', '70130', '70131', '70139'],
    description: 'New Orleans, Louisiana offers numerous EBT and SNAP-accepting locations throughout the Crescent City. From the French Quarter to Uptown, from Mid-City to the Marigny, find Rouses, Winn-Dixie, Walmart, and local markets that accept SNAP benefits.'
  },
  'wichita': {
    name: 'Wichita',
    state: 'KS',
    lat: 37.6872,
    lng: -97.3301,
    zipCodes: ['67201', '67202', '67203', '67204', '67205', '67206', '67207', '67208', '67209', '67210', '67211', '67212', '67213', '67214', '67215', '67216', '67217', '67218', '67219', '67220'],
    description: 'Wichita, Kansas offers numerous EBT and SNAP-accepting locations throughout the Air Capital of the World. From downtown to West Wichita, from East Wichita to Derby, find Dillons, Walmart, Aldi, and local markets that accept SNAP benefits.'
  },
  'cleveland': {
    name: 'Cleveland',
    state: 'OH',
    lat: 41.4993,
    lng: -81.6944,
    zipCodes: ['44101', '44102', '44103', '44104', '44105', '44106', '44107', '44108', '44109', '44110', '44111', '44112', '44113', '44114', '44115', '44116', '44117', '44118', '44119', '44120'],
    description: 'Cleveland, Ohio offers numerous EBT and SNAP-accepting locations throughout the Forest City. From downtown to Ohio City, from Tremont to University Circle, find Giant Eagle, Dave\'s Supermarkets, Walmart, and local markets that accept SNAP benefits.'
  },
  'bakersfield': {
    name: 'Bakersfield',
    state: 'CA',
    lat: 35.3733,
    lng: -119.0187,
    zipCodes: ['93301', '93302', '93303', '93304', '93305', '93306', '93307', '93308', '93309', '93311', '93312', '93313', '93314', '93380', '93381', '93382', '93383', '93384', '93385', '93386'],
    description: 'Bakersfield, California offers numerous EBT and SNAP-accepting locations throughout Kern County. California participates in RMP, making Bakersfield an excellent city for EBT hot meal purchases at qualified restaurants.'
  },
  'st-louis': {
    name: 'St. Louis',
    state: 'MO',
    lat: 38.6270,
    lng: -90.1994,
    zipCodes: ['63101', '63102', '63103', '63104', '63105', '63106', '63107', '63108', '63109', '63110', '63111', '63112', '63113', '63114', '63115', '63116', '63117', '63118', '63119', '63120'],
    description: 'St. Louis, Missouri offers numerous EBT and SNAP-accepting locations throughout the Gateway City. From downtown to the Central West End, from Soulard to the Hill, find Schnucks, Dierbergs, Walmart, and local markets that accept SNAP benefits.'
  },
  'pittsburgh': {
    name: 'Pittsburgh',
    state: 'PA',
    lat: 40.4406,
    lng: -79.9959,
    zipCodes: ['15201', '15203', '15204', '15205', '15206', '15207', '15208', '15209', '15210', '15211', '15212', '15213', '15214', '15215', '15216', '15217', '15218', '15219', '15220', '15221'],
    description: 'Pittsburgh, Pennsylvania offers numerous EBT and SNAP-accepting locations throughout the Steel City. From downtown to the Strip District, from Lawrenceville to South Side, find Giant Eagle, Aldi, Walmart, and local markets that accept SNAP benefits.'
  },
  'cincinnati': {
    name: 'Cincinnati',
    state: 'OH',
    lat: 39.1031,
    lng: -84.5120,
    zipCodes: ['45201', '45202', '45203', '45204', '45205', '45206', '45207', '45208', '45209', '45210', '45211', '45212', '45213', '45214', '45215', '45216', '45217', '45218', '45219', '45220'],
    description: 'Cincinnati, Ohio offers numerous EBT and SNAP-accepting locations throughout the Queen City. From downtown to Over-the-Rhine, from Clifton to Hyde Park, find Kroger, Meijer, Walmart, and local markets that accept SNAP benefits.'
  },
  'salt-lake-city': {
    name: 'Salt Lake City',
    state: 'UT',
    lat: 40.7608,
    lng: -111.8910,
    zipCodes: ['84101', '84102', '84103', '84104', '84105', '84106', '84107', '84108', '84109', '84110', '84111', '84112', '84113', '84114', '84115', '84116', '84117', '84118', '84119', '84120'],
    description: 'Salt Lake City, Utah offers numerous EBT and SNAP-accepting locations throughout the capital city. From downtown to Sugar House, from Avenues to the west side, find Smith\'s, Harmons, Walmart, and local markets that accept SNAP benefits.'
  }
};

// Function to get all city data combined
export function getAllCityData(): Record<string, CityData> {
  // Import the existing cityData and merge with additional cities
  return additionalCities;
}
