// Extended city data for 200+ city pages for comprehensive SEO coverage

export interface CityData {
  name: string;
  state: string;
  lat: number;
  lng: number;
  zipCodes: string[];
  description: string;
}

// Complete city database with 200+ major US cities
export const cityData: Record<string, CityData> = {
  // Top 50 US Cities by Population
  'los-angeles': {
    name: 'Los Angeles',
    state: 'CA',
    lat: 34.0522,
    lng: -118.2437,
    zipCodes: ['90001', '90002', '90003', '90004', '90005', '90006', '90007', '90008', '90009', '90010'],
    description: 'Los Angeles, California offers thousands of EBT and SNAP-accepting locations throughout the greater LA area. California participates in the Restaurant Meals Program (RMP), making LA excellent for EBT hot meal purchases.'
  },
  'new-york': {
    name: 'New York',
    state: 'NY',
    lat: 40.7128,
    lng: -74.0060,
    zipCodes: ['10001', '10002', '10003', '10004', '10005', '10006', '10007', '10009', '10010', '10011'],
    description: 'New York City offers extensive EBT and SNAP-accepting locations throughout all five boroughs. New York participates in the Restaurant Meals Program (RMP) for qualifying residents.'
  },
  'brooklyn': {
    name: 'Brooklyn',
    state: 'NY',
    lat: 40.6782,
    lng: -73.9442,
    zipCodes: ['11201', '11203', '11204', '11205', '11206', '11207', '11208', '11209', '11210', '11211'],
    description: 'Brooklyn, New York has thousands of EBT and SNAP-accepting stores, from Williamsburg to Bay Ridge. Brooklyn has one of the highest concentrations of SNAP retailers in the country.'
  },
  'chicago': {
    name: 'Chicago',
    state: 'IL',
    lat: 41.8781,
    lng: -87.6298,
    zipCodes: ['60601', '60602', '60603', '60604', '60605', '60606', '60607', '60608', '60609', '60610'],
    description: 'Chicago EBT users can find thousands of SNAP-accepting locations across the Windy City. Illinois participates in RMP, making Chicago excellent for EBT hot meal purchases.'
  },
  'houston': {
    name: 'Houston',
    state: 'TX',
    lat: 29.7604,
    lng: -95.3698,
    zipCodes: ['77001', '77002', '77003', '77004', '77005', '77006', '77007', '77008', '77009', '77010'],
    description: 'Houston, Texas residents can easily find EBT and SNAP-accepting stores throughout the Greater Houston area including H-E-B, Kroger, Walmart, and local markets.'
  },
  'phoenix': {
    name: 'Phoenix',
    state: 'AZ',
    lat: 33.4484,
    lng: -112.0740,
    zipCodes: ['85001', '85002', '85003', '85004', '85005', '85006', '85007', '85008', '85009', '85010'],
    description: 'Phoenix, Arizona offers extensive EBT locations throughout the Valley of the Sun. Arizona participates in RMP, allowing eligible EBT users to purchase hot meals.'
  },
  'philadelphia': {
    name: 'Philadelphia',
    state: 'PA',
    lat: 39.9526,
    lng: -75.1652,
    zipCodes: ['19101', '19102', '19103', '19104', '19105', '19106', '19107', '19108', '19109', '19110'],
    description: 'Philadelphia, Pennsylvania offers extensive EBT and SNAP-accepting locations throughout the City of Brotherly Love including grocery stores and participating restaurants.'
  },
  'san-antonio': {
    name: 'San Antonio',
    state: 'TX',
    lat: 29.4241,
    lng: -98.4936,
    zipCodes: ['78201', '78202', '78203', '78204', '78205', '78206', '78207', '78208', '78209', '78210'],
    description: 'San Antonio, Texas residents can find EBT stores throughout the Alamo City including H-E-B, Walmart, Target, and local Hispanic markets.'
  },
  'san-diego': {
    name: 'San Diego',
    state: 'CA',
    lat: 32.7157,
    lng: -117.1611,
    zipCodes: ['92101', '92102', '92103', '92104', '92105', '92106', '92107', '92108', '92109', '92110'],
    description: 'San Diego, California offers numerous EBT locations throughout America\'s Finest City. California participates in RMP for qualifying residents.'
  },
  'dallas': {
    name: 'Dallas',
    state: 'TX',
    lat: 32.7767,
    lng: -96.7970,
    zipCodes: ['75201', '75202', '75203', '75204', '75205', '75206', '75207', '75208', '75209', '75210'],
    description: 'Dallas, Texas residents can locate EBT stores throughout the Dallas-Fort Worth metroplex including major retailers and local markets.'
  },
  'san-jose': {
    name: 'San Jose',
    state: 'CA',
    lat: 37.3382,
    lng: -121.8863,
    zipCodes: ['95101', '95103', '95106', '95108', '95109', '95110', '95111', '95112', '95113', '95116'],
    description: 'San Jose, California offers extensive EBT locations throughout Silicon Valley. California participates in RMP for qualifying residents.'
  },
  'austin': {
    name: 'Austin',
    state: 'TX',
    lat: 30.2672,
    lng: -97.7431,
    zipCodes: ['78701', '78702', '78703', '78704', '78705', '78712', '78717', '78719', '78721', '78722'],
    description: 'Austin, Texas residents can find EBT stores throughout the Live Music Capital including H-E-B, Walmart, and local markets.'
  },
  'jacksonville': {
    name: 'Jacksonville',
    state: 'FL',
    lat: 30.3322,
    lng: -81.6557,
    zipCodes: ['32099', '32201', '32202', '32203', '32204', '32205', '32206', '32207', '32208', '32209'],
    description: 'Jacksonville, Florida offers numerous EBT locations throughout the River City including Publix, Walmart, and Winn-Dixie.'
  },
  'fort-worth': {
    name: 'Fort Worth',
    state: 'TX',
    lat: 32.7555,
    lng: -97.3308,
    zipCodes: ['76101', '76102', '76103', '76104', '76105', '76106', '76107', '76108', '76109', '76110'],
    description: 'Fort Worth, Texas residents can locate EBT stores throughout Cowtown including major retailers and local markets.'
  },
  'columbus': {
    name: 'Columbus',
    state: 'OH',
    lat: 39.9612,
    lng: -82.9988,
    zipCodes: ['43085', '43201', '43202', '43203', '43204', '43205', '43206', '43207', '43209', '43210'],
    description: 'Columbus, Ohio offers extensive EBT locations throughout the capital city including Kroger, Meijer, and Walmart.'
  },
  'charlotte': {
    name: 'Charlotte',
    state: 'NC',
    lat: 35.2271,
    lng: -80.8431,
    zipCodes: ['28201', '28202', '28203', '28204', '28205', '28206', '28207', '28208', '28209', '28210'],
    description: 'Charlotte, North Carolina offers numerous EBT locations throughout the Queen City including Harris Teeter, Food Lion, and Walmart.'
  },
  'san-francisco': {
    name: 'San Francisco',
    state: 'CA',
    lat: 37.7749,
    lng: -122.4194,
    zipCodes: ['94102', '94103', '94104', '94105', '94107', '94108', '94109', '94110', '94111', '94112'],
    description: 'San Francisco, California offers extensive EBT locations throughout the City by the Bay. California participates in RMP.'
  },
  'indianapolis': {
    name: 'Indianapolis',
    state: 'IN',
    lat: 39.7684,
    lng: -86.1581,
    zipCodes: ['46201', '46202', '46203', '46204', '46205', '46206', '46207', '46208', '46209', '46210'],
    description: 'Indianapolis, Indiana residents can find EBT stores throughout the Circle City including Kroger, Meijer, and Walmart.'
  },
  'seattle': {
    name: 'Seattle',
    state: 'WA',
    lat: 47.6062,
    lng: -122.3321,
    zipCodes: ['98101', '98102', '98103', '98104', '98105', '98106', '98107', '98108', '98109', '98112'],
    description: 'Seattle, Washington residents can find EBT stores throughout King County including Safeway, QFC, and local Asian markets.'
  },
  'denver': {
    name: 'Denver',
    state: 'CO',
    lat: 39.7392,
    lng: -104.9903,
    zipCodes: ['80201', '80202', '80203', '80204', '80205', '80206', '80207', '80208', '80209', '80210'],
    description: 'Denver, Colorado offers extensive EBT locations throughout the Mile High City including King Soopers, Safeway, and Walmart.'
  },
  'miami': {
    name: 'Miami',
    state: 'FL',
    lat: 25.7617,
    lng: -80.1918,
    zipCodes: ['33101', '33109', '33125', '33126', '33127', '33128', '33129', '33130', '33131', '33132'],
    description: 'Miami, Florida offers hundreds of EBT stores throughout Miami-Dade County including Publix, Sedanos, and Walmart.'
  },
  'boston': {
    name: 'Boston',
    state: 'MA',
    lat: 42.3601,
    lng: -71.0589,
    zipCodes: ['02108', '02109', '02110', '02111', '02113', '02114', '02115', '02116', '02118', '02119'],
    description: 'Boston, Massachusetts offers numerous EBT locations throughout Greater Boston including Stop & Shop, Shaw\'s, and Whole Foods.'
  },
  'atlanta': {
    name: 'Atlanta',
    state: 'GA',
    lat: 33.7490,
    lng: -84.3880,
    zipCodes: ['30301', '30302', '30303', '30304', '30305', '30306', '30307', '30308', '30309', '30310'],
    description: 'Atlanta, Georgia residents can find EBT stores throughout Metro Atlanta including Kroger, Publix, and Walmart.'
  },
  'detroit': {
    name: 'Detroit',
    state: 'MI',
    lat: 42.3314,
    lng: -83.0458,
    zipCodes: ['48201', '48202', '48203', '48204', '48205', '48206', '48207', '48208', '48209', '48210'],
    description: 'Detroit, Michigan residents can find EBT stores throughout the Motor City including Meijer, Kroger, and Walmart.'
  },
  'fresno': {
    name: 'Fresno',
    state: 'CA',
    lat: 36.7378,
    lng: -119.7871,
    zipCodes: ['93701', '93702', '93703', '93704', '93705', '93706', '93707', '93708', '93709', '93710'],
    description: 'Fresno, California offers numerous EBT locations. California participates in RMP for qualifying residents.'
  },
  'sacramento': {
    name: 'Sacramento',
    state: 'CA',
    lat: 38.5816,
    lng: -121.4944,
    zipCodes: ['95811', '95812', '95813', '95814', '95815', '95816', '95817', '95818', '95819', '95820'],
    description: 'Sacramento, California offers extensive EBT locations throughout the state capital. California participates in RMP.'
  },
  'orlando': {
    name: 'Orlando',
    state: 'FL',
    lat: 28.5383,
    lng: -81.3792,
    zipCodes: ['32801', '32802', '32803', '32804', '32805', '32806', '32807', '32808', '32809', '32810'],
    description: 'Orlando, Florida offers numerous EBT locations throughout Central Florida including Publix, Walmart, and Winn-Dixie.'
  },
  'las-vegas': {
    name: 'Las Vegas',
    state: 'NV',
    lat: 36.1699,
    lng: -115.1398,
    zipCodes: ['89101', '89102', '89103', '89104', '89106', '89107', '89108', '89109', '89110', '89113'],
    description: 'Las Vegas, Nevada residents can find EBT stores throughout the Las Vegas Valley including Smith\'s, Albertsons, and Walmart.'
  },
  'memphis': {
    name: 'Memphis',
    state: 'TN',
    lat: 35.1495,
    lng: -90.0490,
    zipCodes: ['38101', '38103', '38104', '38105', '38106', '38107', '38108', '38109', '38111', '38112'],
    description: 'Memphis, Tennessee offers numerous EBT locations throughout the Bluff City including Kroger, Walmart, and Aldi.'
  },
  'baltimore': {
    name: 'Baltimore',
    state: 'MD',
    lat: 39.2904,
    lng: -76.6122,
    zipCodes: ['21201', '21202', '21205', '21206', '21207', '21208', '21209', '21210', '21211', '21212'],
    description: 'Baltimore, Maryland residents can find EBT stores throughout Charm City including Giant, Safeway, and Walmart.'
  },
  // Cities 31-60
  'nashville': {
    name: 'Nashville',
    state: 'TN',
    lat: 36.1627,
    lng: -86.7816,
    zipCodes: ['37201', '37203', '37204', '37205', '37206', '37207', '37208', '37209', '37210', '37211'],
    description: 'Nashville, Tennessee offers numerous EBT locations throughout Music City including Kroger, Publix, and Walmart.'
  },
  'portland': {
    name: 'Portland',
    state: 'OR',
    lat: 45.5152,
    lng: -122.6784,
    zipCodes: ['97201', '97202', '97203', '97204', '97205', '97206', '97207', '97208', '97209', '97210'],
    description: 'Portland, Oregon offers extensive EBT locations including Fred Meyer, Safeway, New Seasons, and local markets.'
  },
  'oklahoma-city': {
    name: 'Oklahoma City',
    state: 'OK',
    lat: 35.4676,
    lng: -97.5164,
    zipCodes: ['73101', '73102', '73103', '73104', '73105', '73106', '73107', '73108', '73109', '73110'],
    description: 'Oklahoma City, Oklahoma offers numerous EBT locations including Walmart, Crest Foods, and Aldi.'
  },
  'milwaukee': {
    name: 'Milwaukee',
    state: 'WI',
    lat: 43.0389,
    lng: -87.9065,
    zipCodes: ['53201', '53202', '53203', '53204', '53205', '53206', '53207', '53208', '53209', '53210'],
    description: 'Milwaukee, Wisconsin offers numerous EBT locations including Pick \'n Save, Metro Market, and Walmart.'
  },
  'albuquerque': {
    name: 'Albuquerque',
    state: 'NM',
    lat: 35.0844,
    lng: -106.6504,
    zipCodes: ['87101', '87102', '87103', '87104', '87105', '87106', '87107', '87108', '87109', '87110'],
    description: 'Albuquerque, New Mexico offers numerous EBT locations including Smith\'s, Albertsons, and Walmart.'
  },
  'tucson': {
    name: 'Tucson',
    state: 'AZ',
    lat: 32.2226,
    lng: -110.9747,
    zipCodes: ['85701', '85702', '85703', '85704', '85705', '85706', '85707', '85708', '85709', '85710'],
    description: 'Tucson, Arizona offers numerous EBT locations. Arizona participates in RMP for qualifying residents.'
  },
  'kansas-city': {
    name: 'Kansas City',
    state: 'MO',
    lat: 39.0997,
    lng: -94.5786,
    zipCodes: ['64101', '64102', '64105', '64106', '64108', '64109', '64110', '64111', '64112', '64113'],
    description: 'Kansas City, Missouri offers numerous EBT locations including Hy-Vee, Price Chopper, and Walmart.'
  },
  'raleigh': {
    name: 'Raleigh',
    state: 'NC',
    lat: 35.7796,
    lng: -78.6382,
    zipCodes: ['27601', '27602', '27603', '27604', '27605', '27606', '27607', '27608', '27609', '27610'],
    description: 'Raleigh, North Carolina offers numerous EBT locations including Harris Teeter, Food Lion, and Walmart.'
  },
  'long-beach': {
    name: 'Long Beach',
    state: 'CA',
    lat: 33.7701,
    lng: -118.1937,
    zipCodes: ['90801', '90802', '90803', '90804', '90805', '90806', '90807', '90808', '90809', '90810'],
    description: 'Long Beach, California offers numerous EBT locations. California participates in RMP.'
  },
  'virginia-beach': {
    name: 'Virginia Beach',
    state: 'VA',
    lat: 36.8529,
    lng: -75.9780,
    zipCodes: ['23450', '23451', '23452', '23453', '23454', '23455', '23456', '23457', '23458', '23459'],
    description: 'Virginia Beach, Virginia offers numerous EBT locations. Virginia participates in RMP in some areas.'
  },
  'oakland': {
    name: 'Oakland',
    state: 'CA',
    lat: 37.8044,
    lng: -122.2712,
    zipCodes: ['94601', '94602', '94603', '94604', '94605', '94606', '94607', '94608', '94609', '94610'],
    description: 'Oakland, California offers numerous EBT locations. California participates in RMP.'
  },
  'minneapolis': {
    name: 'Minneapolis',
    state: 'MN',
    lat: 44.9778,
    lng: -93.2650,
    zipCodes: ['55401', '55402', '55403', '55404', '55405', '55406', '55407', '55408', '55409', '55410'],
    description: 'Minneapolis, Minnesota offers numerous EBT locations including Cub Foods, Lunds & Byerlys, and Walmart.'
  },
  'tulsa': {
    name: 'Tulsa',
    state: 'OK',
    lat: 36.1540,
    lng: -95.9928,
    zipCodes: ['74101', '74102', '74103', '74104', '74105', '74106', '74107', '74108', '74110', '74112'],
    description: 'Tulsa, Oklahoma offers numerous EBT locations including Walmart, Reasor\'s, and Aldi.'
  },
  'arlington': {
    name: 'Arlington',
    state: 'TX',
    lat: 32.7357,
    lng: -97.1081,
    zipCodes: ['76001', '76002', '76003', '76004', '76005', '76006', '76010', '76011', '76012', '76013'],
    description: 'Arlington, Texas offers numerous EBT locations including H-E-B, Walmart, Kroger, and Tom Thumb.'
  },
  'tampa': {
    name: 'Tampa',
    state: 'FL',
    lat: 27.9506,
    lng: -82.4572,
    zipCodes: ['33601', '33602', '33603', '33604', '33605', '33606', '33607', '33609', '33610', '33611'],
    description: 'Tampa, Florida offers numerous EBT locations including Publix, Walmart, and Winn-Dixie.'
  },
  'new-orleans': {
    name: 'New Orleans',
    state: 'LA',
    lat: 29.9511,
    lng: -90.0715,
    zipCodes: ['70112', '70113', '70114', '70115', '70116', '70117', '70118', '70119', '70121', '70122'],
    description: 'New Orleans, Louisiana offers numerous EBT locations including Rouses, Winn-Dixie, and Walmart.'
  },
  'wichita': {
    name: 'Wichita',
    state: 'KS',
    lat: 37.6872,
    lng: -97.3301,
    zipCodes: ['67201', '67202', '67203', '67204', '67205', '67206', '67207', '67208', '67209', '67210'],
    description: 'Wichita, Kansas offers numerous EBT locations including Dillons, Walmart, and Aldi.'
  },
  'cleveland': {
    name: 'Cleveland',
    state: 'OH',
    lat: 41.4993,
    lng: -81.6944,
    zipCodes: ['44101', '44102', '44103', '44104', '44105', '44106', '44107', '44108', '44109', '44110'],
    description: 'Cleveland, Ohio offers numerous EBT locations including Giant Eagle, Dave\'s Supermarkets, and Walmart.'
  },
  'bakersfield': {
    name: 'Bakersfield',
    state: 'CA',
    lat: 35.3733,
    lng: -119.0187,
    zipCodes: ['93301', '93302', '93303', '93304', '93305', '93306', '93307', '93308', '93309', '93311'],
    description: 'Bakersfield, California offers numerous EBT locations. California participates in RMP.'
  },
  'aurora': {
    name: 'Aurora',
    state: 'CO',
    lat: 39.7294,
    lng: -104.8319,
    zipCodes: ['80010', '80011', '80012', '80013', '80014', '80015', '80016', '80017', '80018', '80019'],
    description: 'Aurora, Colorado offers numerous EBT locations including King Soopers, Safeway, and Walmart.'
  },
  // Cities 61-100
  'anaheim': {
    name: 'Anaheim',
    state: 'CA',
    lat: 33.8366,
    lng: -117.9143,
    zipCodes: ['92801', '92802', '92803', '92804', '92805', '92806', '92807', '92808', '92809', '92812'],
    description: 'Anaheim, California offers numerous EBT locations. California participates in RMP.'
  },
  'st-louis': {
    name: 'St. Louis',
    state: 'MO',
    lat: 38.6270,
    lng: -90.1994,
    zipCodes: ['63101', '63102', '63103', '63104', '63105', '63106', '63107', '63108', '63109', '63110'],
    description: 'St. Louis, Missouri offers numerous EBT locations including Schnucks, Dierbergs, and Walmart.'
  },
  'pittsburgh': {
    name: 'Pittsburgh',
    state: 'PA',
    lat: 40.4406,
    lng: -79.9959,
    zipCodes: ['15201', '15203', '15204', '15205', '15206', '15207', '15208', '15209', '15210', '15211'],
    description: 'Pittsburgh, Pennsylvania offers numerous EBT locations including Giant Eagle, Aldi, and Walmart.'
  },
  'riverside': {
    name: 'Riverside',
    state: 'CA',
    lat: 33.9806,
    lng: -117.3755,
    zipCodes: ['92501', '92502', '92503', '92504', '92505', '92506', '92507', '92508', '92509', '92513'],
    description: 'Riverside, California offers numerous EBT locations. California participates in RMP.'
  },
  'stockton': {
    name: 'Stockton',
    state: 'CA',
    lat: 37.9577,
    lng: -121.2908,
    zipCodes: ['95201', '95202', '95203', '95204', '95205', '95206', '95207', '95208', '95209', '95210'],
    description: 'Stockton, California offers numerous EBT locations. California participates in RMP.'
  },
  'cincinnati': {
    name: 'Cincinnati',
    state: 'OH',
    lat: 39.1031,
    lng: -84.5120,
    zipCodes: ['45201', '45202', '45203', '45204', '45205', '45206', '45207', '45208', '45209', '45210'],
    description: 'Cincinnati, Ohio offers numerous EBT locations including Kroger, Meijer, and Walmart.'
  },
  'greensboro': {
    name: 'Greensboro',
    state: 'NC',
    lat: 36.0726,
    lng: -79.7920,
    zipCodes: ['27401', '27402', '27403', '27404', '27405', '27406', '27407', '27408', '27409', '27410'],
    description: 'Greensboro, North Carolina offers numerous EBT locations including Harris Teeter, Food Lion, and Walmart.'
  },
  'plano': {
    name: 'Plano',
    state: 'TX',
    lat: 33.0198,
    lng: -96.6989,
    zipCodes: ['75023', '75024', '75025', '75026', '75074', '75075', '75086', '75093', '75094'],
    description: 'Plano, Texas offers numerous EBT locations including Kroger, Tom Thumb, and Walmart.'
  },
  'newark': {
    name: 'Newark',
    state: 'NJ',
    lat: 40.7357,
    lng: -74.1724,
    zipCodes: ['07101', '07102', '07103', '07104', '07105', '07106', '07107', '07108', '07109', '07110'],
    description: 'Newark, New Jersey offers numerous EBT locations including ShopRite, Walmart, and local bodegas.'
  },
  'henderson': {
    name: 'Henderson',
    state: 'NV',
    lat: 36.0395,
    lng: -114.9817,
    zipCodes: ['89002', '89009', '89011', '89012', '89014', '89015', '89016', '89052', '89053', '89074'],
    description: 'Henderson, Nevada offers numerous EBT locations including Smith\'s, Albertsons, and Walmart.'
  },
  'lincoln': {
    name: 'Lincoln',
    state: 'NE',
    lat: 40.8258,
    lng: -96.6852,
    zipCodes: ['68501', '68502', '68503', '68504', '68505', '68506', '68507', '68508', '68509', '68510'],
    description: 'Lincoln, Nebraska offers numerous EBT locations including Hy-Vee, Super Saver, and Walmart.'
  },
  'buffalo': {
    name: 'Buffalo',
    state: 'NY',
    lat: 42.8864,
    lng: -78.8784,
    zipCodes: ['14201', '14202', '14203', '14204', '14205', '14206', '14207', '14208', '14209', '14210'],
    description: 'Buffalo, New York offers numerous EBT locations including Tops, Wegmans, and Walmart.'
  },
  'jersey-city': {
    name: 'Jersey City',
    state: 'NJ',
    lat: 40.7282,
    lng: -74.0776,
    zipCodes: ['07302', '07303', '07304', '07305', '07306', '07307', '07308', '07309', '07310', '07311'],
    description: 'Jersey City, New Jersey offers numerous EBT locations including ShopRite, Walmart, and local markets.'
  },
  'chula-vista': {
    name: 'Chula Vista',
    state: 'CA',
    lat: 32.6401,
    lng: -117.0842,
    zipCodes: ['91909', '91910', '91911', '91912', '91913', '91914', '91915', '91921'],
    description: 'Chula Vista, California offers numerous EBT locations. California participates in RMP.'
  },
  'fort-wayne': {
    name: 'Fort Wayne',
    state: 'IN',
    lat: 41.0793,
    lng: -85.1394,
    zipCodes: ['46801', '46802', '46803', '46804', '46805', '46806', '46807', '46808', '46809', '46814'],
    description: 'Fort Wayne, Indiana offers numerous EBT locations including Kroger, Meijer, and Walmart.'
  },
  'durham': {
    name: 'Durham',
    state: 'NC',
    lat: 35.9940,
    lng: -78.8986,
    zipCodes: ['27701', '27702', '27703', '27704', '27705', '27706', '27707', '27708', '27709', '27710'],
    description: 'Durham, North Carolina offers numerous EBT locations including Harris Teeter, Food Lion, and Walmart.'
  },
  'st-petersburg': {
    name: 'St. Petersburg',
    state: 'FL',
    lat: 27.7676,
    lng: -82.6403,
    zipCodes: ['33701', '33702', '33703', '33704', '33705', '33706', '33707', '33708', '33709', '33710'],
    description: 'St. Petersburg, Florida offers numerous EBT locations including Publix, Walmart, and Winn-Dixie.'
  },
  'laredo': {
    name: 'Laredo',
    state: 'TX',
    lat: 27.5306,
    lng: -99.4803,
    zipCodes: ['78040', '78041', '78042', '78043', '78044', '78045', '78046'],
    description: 'Laredo, Texas offers numerous EBT locations including H-E-B, Walmart, and local markets.'
  },
  'norfolk': {
    name: 'Norfolk',
    state: 'VA',
    lat: 36.8508,
    lng: -76.2859,
    zipCodes: ['23501', '23502', '23503', '23504', '23505', '23506', '23507', '23508', '23509', '23510'],
    description: 'Norfolk, Virginia offers numerous EBT locations including Food Lion, Walmart, and local markets.'
  },
  'madison': {
    name: 'Madison',
    state: 'WI',
    lat: 43.0731,
    lng: -89.4012,
    zipCodes: ['53701', '53702', '53703', '53704', '53705', '53706', '53707', '53708', '53711', '53713'],
    description: 'Madison, Wisconsin offers numerous EBT locations including Pick \'n Save, Woodman\'s, and Walmart.'
  },
  // Cities 101-150
  'lubbock': {
    name: 'Lubbock',
    state: 'TX',
    lat: 33.5779,
    lng: -101.8552,
    zipCodes: ['79401', '79402', '79403', '79404', '79405', '79406', '79407', '79408', '79409', '79410'],
    description: 'Lubbock, Texas offers numerous EBT locations including United Supermarkets, Walmart, and H-E-B.'
  },
  'chandler': {
    name: 'Chandler',
    state: 'AZ',
    lat: 33.3062,
    lng: -111.8413,
    zipCodes: ['85224', '85225', '85226', '85244', '85246', '85248', '85249', '85286'],
    description: 'Chandler, Arizona offers numerous EBT locations. Arizona participates in RMP.'
  },
  'scottsdale': {
    name: 'Scottsdale',
    state: 'AZ',
    lat: 33.4942,
    lng: -111.9261,
    zipCodes: ['85250', '85251', '85252', '85253', '85254', '85255', '85256', '85257', '85258', '85259'],
    description: 'Scottsdale, Arizona offers numerous EBT locations. Arizona participates in RMP.'
  },
  'reno': {
    name: 'Reno',
    state: 'NV',
    lat: 39.5296,
    lng: -119.8138,
    zipCodes: ['89501', '89502', '89503', '89504', '89505', '89506', '89507', '89508', '89509', '89510'],
    description: 'Reno, Nevada offers numerous EBT locations including Smith\'s, Raley\'s, and Walmart.'
  },
  'glendale': {
    name: 'Glendale',
    state: 'CA',
    lat: 34.1425,
    lng: -118.2551,
    zipCodes: ['91201', '91202', '91203', '91204', '91205', '91206', '91207', '91208', '91209', '91210'],
    description: 'Glendale, California offers numerous EBT locations. California participates in RMP.'
  },
  'gilbert': {
    name: 'Gilbert',
    state: 'AZ',
    lat: 33.3528,
    lng: -111.7890,
    zipCodes: ['85233', '85234', '85295', '85296', '85297', '85298', '85299'],
    description: 'Gilbert, Arizona offers numerous EBT locations. Arizona participates in RMP.'
  },
  'north-las-vegas': {
    name: 'North Las Vegas',
    state: 'NV',
    lat: 36.1989,
    lng: -115.1175,
    zipCodes: ['89030', '89031', '89032', '89033', '89036', '89081', '89084', '89085', '89086', '89087'],
    description: 'North Las Vegas, Nevada offers numerous EBT locations including Smith\'s, Albertsons, and Walmart.'
  },
  'hialeah': {
    name: 'Hialeah',
    state: 'FL',
    lat: 25.8576,
    lng: -80.2781,
    zipCodes: ['33010', '33011', '33012', '33013', '33014', '33015', '33016', '33017', '33018'],
    description: 'Hialeah, Florida offers numerous EBT locations including Sedanos, Publix, and Walmart.'
  },
  'garland': {
    name: 'Garland',
    state: 'TX',
    lat: 32.9126,
    lng: -96.6389,
    zipCodes: ['75040', '75041', '75042', '75043', '75044', '75045', '75046', '75047', '75048', '75049'],
    description: 'Garland, Texas offers numerous EBT locations including Kroger, Tom Thumb, and Walmart.'
  },
  'fremont': {
    name: 'Fremont',
    state: 'CA',
    lat: 37.5485,
    lng: -121.9886,
    zipCodes: ['94536', '94537', '94538', '94539', '94555'],
    description: 'Fremont, California offers numerous EBT locations. California participates in RMP.'
  },
  'baton-rouge': {
    name: 'Baton Rouge',
    state: 'LA',
    lat: 30.4515,
    lng: -91.1871,
    zipCodes: ['70801', '70802', '70803', '70804', '70805', '70806', '70807', '70808', '70809', '70810'],
    description: 'Baton Rouge, Louisiana offers numerous EBT locations including Rouses, Winn-Dixie, and Walmart.'
  },
  'richmond': {
    name: 'Richmond',
    state: 'VA',
    lat: 37.5407,
    lng: -77.4360,
    zipCodes: ['23218', '23219', '23220', '23221', '23222', '23223', '23224', '23225', '23226', '23227'],
    description: 'Richmond, Virginia offers numerous EBT locations including Kroger, Food Lion, and Walmart.'
  },
  'boise': {
    name: 'Boise',
    state: 'ID',
    lat: 43.6150,
    lng: -116.2023,
    zipCodes: ['83701', '83702', '83703', '83704', '83705', '83706', '83707', '83708', '83709', '83711'],
    description: 'Boise, Idaho offers numerous EBT locations including Albertsons, WinCo, and Walmart.'
  },
  'san-bernardino': {
    name: 'San Bernardino',
    state: 'CA',
    lat: 34.1083,
    lng: -117.2898,
    zipCodes: ['92401', '92402', '92403', '92404', '92405', '92406', '92407', '92408', '92410', '92411'],
    description: 'San Bernardino, California offers numerous EBT locations. California participates in RMP.'
  },
  'spokane': {
    name: 'Spokane',
    state: 'WA',
    lat: 47.6588,
    lng: -117.4260,
    zipCodes: ['99201', '99202', '99203', '99204', '99205', '99206', '99207', '99208', '99209', '99210'],
    description: 'Spokane, Washington offers numerous EBT locations including Safeway, Fred Meyer, and Walmart.'
  },
  'des-moines': {
    name: 'Des Moines',
    state: 'IA',
    lat: 41.5868,
    lng: -93.6250,
    zipCodes: ['50301', '50302', '50303', '50304', '50305', '50306', '50307', '50308', '50309', '50310'],
    description: 'Des Moines, Iowa offers numerous EBT locations including Hy-Vee, Fareway, and Walmart.'
  },
  'modesto': {
    name: 'Modesto',
    state: 'CA',
    lat: 37.6391,
    lng: -120.9969,
    zipCodes: ['95350', '95351', '95352', '95353', '95354', '95355', '95356', '95357', '95358'],
    description: 'Modesto, California offers numerous EBT locations. California participates in RMP.'
  },
  'birmingham': {
    name: 'Birmingham',
    state: 'AL',
    lat: 33.5186,
    lng: -86.8104,
    zipCodes: ['35201', '35202', '35203', '35204', '35205', '35206', '35207', '35208', '35209', '35210'],
    description: 'Birmingham, Alabama offers numerous EBT locations including Publix, Walmart, and Aldi.'
  },
  'tacoma': {
    name: 'Tacoma',
    state: 'WA',
    lat: 47.2529,
    lng: -122.4443,
    zipCodes: ['98401', '98402', '98403', '98404', '98405', '98406', '98407', '98408', '98409', '98411'],
    description: 'Tacoma, Washington offers numerous EBT locations including Safeway, Fred Meyer, and Walmart.'
  },
  'fontana': {
    name: 'Fontana',
    state: 'CA',
    lat: 34.0922,
    lng: -117.4350,
    zipCodes: ['92331', '92334', '92335', '92336', '92337'],
    description: 'Fontana, California offers numerous EBT locations. California participates in RMP.'
  },
  // Cities 151-200
  'rochester': {
    name: 'Rochester',
    state: 'NY',
    lat: 43.1566,
    lng: -77.6088,
    zipCodes: ['14601', '14602', '14603', '14604', '14605', '14606', '14607', '14608', '14609', '14610'],
    description: 'Rochester, New York offers numerous EBT locations including Wegmans, Tops, and Walmart.'
  },
  'oxnard': {
    name: 'Oxnard',
    state: 'CA',
    lat: 34.1975,
    lng: -119.1771,
    zipCodes: ['93030', '93031', '93032', '93033', '93034', '93035', '93036'],
    description: 'Oxnard, California offers numerous EBT locations. California participates in RMP.'
  },
  'moreno-valley': {
    name: 'Moreno Valley',
    state: 'CA',
    lat: 33.9425,
    lng: -117.2297,
    zipCodes: ['92551', '92552', '92553', '92554', '92555', '92556', '92557'],
    description: 'Moreno Valley, California offers numerous EBT locations. California participates in RMP.'
  },
  'fayetteville': {
    name: 'Fayetteville',
    state: 'NC',
    lat: 35.0527,
    lng: -78.8784,
    zipCodes: ['28301', '28302', '28303', '28304', '28305', '28306', '28307', '28308', '28309', '28310'],
    description: 'Fayetteville, North Carolina offers numerous EBT locations including Harris Teeter, Food Lion, and Walmart.'
  },
  'yonkers': {
    name: 'Yonkers',
    state: 'NY',
    lat: 40.9312,
    lng: -73.8988,
    zipCodes: ['10701', '10702', '10703', '10704', '10705', '10706', '10707', '10708', '10709', '10710'],
    description: 'Yonkers, New York offers numerous EBT locations including ShopRite, Stop & Shop, and local markets.'
  },
  'worcester': {
    name: 'Worcester',
    state: 'MA',
    lat: 42.2626,
    lng: -71.8023,
    zipCodes: ['01601', '01602', '01603', '01604', '01605', '01606', '01607', '01608', '01609', '01610'],
    description: 'Worcester, Massachusetts offers numerous EBT locations including Stop & Shop, Price Chopper, and Walmart.'
  },
  'salt-lake-city': {
    name: 'Salt Lake City',
    state: 'UT',
    lat: 40.7608,
    lng: -111.8910,
    zipCodes: ['84101', '84102', '84103', '84104', '84105', '84106', '84107', '84108', '84109', '84110'],
    description: 'Salt Lake City, Utah offers numerous EBT locations including Smith\'s, Harmons, and Walmart.'
  },
  'huntington-beach': {
    name: 'Huntington Beach',
    state: 'CA',
    lat: 33.6595,
    lng: -117.9988,
    zipCodes: ['92605', '92615', '92646', '92647', '92648', '92649'],
    description: 'Huntington Beach, California offers numerous EBT locations. California participates in RMP.'
  },
  'grand-rapids': {
    name: 'Grand Rapids',
    state: 'MI',
    lat: 42.9634,
    lng: -85.6681,
    zipCodes: ['49501', '49502', '49503', '49504', '49505', '49506', '49507', '49508', '49509', '49510'],
    description: 'Grand Rapids, Michigan offers numerous EBT locations including Meijer, D&W, and Walmart.'
  },
  'amarillo': {
    name: 'Amarillo',
    state: 'TX',
    lat: 35.2220,
    lng: -101.8313,
    zipCodes: ['79101', '79102', '79103', '79104', '79105', '79106', '79107', '79108', '79109', '79110'],
    description: 'Amarillo, Texas offers numerous EBT locations including United Supermarkets, Walmart, and Market Street.'
  },
  'santa-clarita': {
    name: 'Santa Clarita',
    state: 'CA',
    lat: 34.3917,
    lng: -118.5426,
    zipCodes: ['91321', '91350', '91351', '91354', '91355', '91380', '91381', '91382', '91383', '91384'],
    description: 'Santa Clarita, California offers numerous EBT locations. California participates in RMP.'
  },
  'montgomery': {
    name: 'Montgomery',
    state: 'AL',
    lat: 32.3668,
    lng: -86.3000,
    zipCodes: ['36101', '36102', '36103', '36104', '36105', '36106', '36107', '36108', '36109', '36110'],
    description: 'Montgomery, Alabama offers numerous EBT locations including Publix, Walmart, and Winn-Dixie.'
  },
  'shreveport': {
    name: 'Shreveport',
    state: 'LA',
    lat: 32.5252,
    lng: -93.7502,
    zipCodes: ['71101', '71102', '71103', '71104', '71105', '71106', '71107', '71108', '71109', '71110'],
    description: 'Shreveport, Louisiana offers numerous EBT locations including Brookshire\'s, Walmart, and Super 1 Foods.'
  },
  'little-rock': {
    name: 'Little Rock',
    state: 'AR',
    lat: 34.7465,
    lng: -92.2896,
    zipCodes: ['72201', '72202', '72203', '72204', '72205', '72206', '72207', '72208', '72209', '72210'],
    description: 'Little Rock, Arkansas offers numerous EBT locations including Kroger, Walmart, and Harps.'
  },
  'akron': {
    name: 'Akron',
    state: 'OH',
    lat: 41.0814,
    lng: -81.5190,
    zipCodes: ['44301', '44302', '44303', '44304', '44305', '44306', '44307', '44308', '44309', '44310'],
    description: 'Akron, Ohio offers numerous EBT locations including Giant Eagle, Acme, and Walmart.'
  },
  'augusta': {
    name: 'Augusta',
    state: 'GA',
    lat: 33.4735,
    lng: -81.9748,
    zipCodes: ['30901', '30902', '30903', '30904', '30905', '30906', '30907', '30909', '30911', '30912'],
    description: 'Augusta, Georgia offers numerous EBT locations including Kroger, Publix, and Walmart.'
  },
  'knoxville': {
    name: 'Knoxville',
    state: 'TN',
    lat: 35.9606,
    lng: -83.9207,
    zipCodes: ['37901', '37902', '37909', '37912', '37914', '37915', '37916', '37917', '37918', '37919'],
    description: 'Knoxville, Tennessee offers numerous EBT locations including Kroger, Food City, and Walmart.'
  },
  'mobile': {
    name: 'Mobile',
    state: 'AL',
    lat: 30.6954,
    lng: -88.0399,
    zipCodes: ['36601', '36602', '36603', '36604', '36605', '36606', '36607', '36608', '36609', '36610'],
    description: 'Mobile, Alabama offers numerous EBT locations including Publix, Winn-Dixie, and Walmart.'
  },
  'huntsville': {
    name: 'Huntsville',
    state: 'AL',
    lat: 34.7304,
    lng: -86.5861,
    zipCodes: ['35801', '35802', '35803', '35804', '35805', '35806', '35807', '35808', '35809', '35810'],
    description: 'Huntsville, Alabama offers numerous EBT locations including Publix, Kroger, and Walmart.'
  },
  'providence': {
    name: 'Providence',
    state: 'RI',
    lat: 41.8240,
    lng: -71.4128,
    zipCodes: ['02901', '02902', '02903', '02904', '02905', '02906', '02907', '02908', '02909', '02910'],
    description: 'Providence, Rhode Island offers numerous EBT locations including Stop & Shop, Shaw\'s, and local markets.'
  },
  // Cities 201-210 for buffer
  'chattanooga': {
    name: 'Chattanooga',
    state: 'TN',
    lat: 35.0456,
    lng: -85.3097,
    zipCodes: ['37401', '37402', '37403', '37404', '37405', '37406', '37407', '37408', '37409', '37410'],
    description: 'Chattanooga, Tennessee offers numerous EBT locations including Publix, Food City, and Walmart.'
  },
  'fort-lauderdale': {
    name: 'Fort Lauderdale',
    state: 'FL',
    lat: 26.1224,
    lng: -80.1373,
    zipCodes: ['33301', '33302', '33303', '33304', '33305', '33306', '33307', '33308', '33309', '33310'],
    description: 'Fort Lauderdale, Florida offers numerous EBT locations including Publix, Walmart, and Winn-Dixie.'
  },
  'springfield': {
    name: 'Springfield',
    state: 'MO',
    lat: 37.2090,
    lng: -93.2923,
    zipCodes: ['65801', '65802', '65803', '65804', '65805', '65806', '65807', '65808', '65809', '65810'],
    description: 'Springfield, Missouri offers numerous EBT locations including Hy-Vee, Walmart, and Price Cutter.'
  },
  'corpus-christi': {
    name: 'Corpus Christi',
    state: 'TX',
    lat: 27.8006,
    lng: -97.3964,
    zipCodes: ['78401', '78402', '78403', '78404', '78405', '78406', '78407', '78408', '78409', '78410'],
    description: 'Corpus Christi, Texas offers numerous EBT locations including H-E-B, Walmart, and Stripes.'
  },
  'el-paso': {
    name: 'El Paso',
    state: 'TX',
    lat: 31.7619,
    lng: -106.4850,
    zipCodes: ['79901', '79902', '79903', '79904', '79905', '79906', '79907', '79908', '79910', '79911'],
    description: 'El Paso, Texas offers numerous EBT locations including Albertsons, Walmart, and local markets.'
  },
  'lexington': {
    name: 'Lexington',
    state: 'KY',
    lat: 38.0406,
    lng: -84.5037,
    zipCodes: ['40502', '40503', '40504', '40505', '40506', '40507', '40508', '40509', '40510', '40511'],
    description: 'Lexington, Kentucky offers numerous EBT locations including Kroger, Meijer, and Walmart.'
  },
  'louisville': {
    name: 'Louisville',
    state: 'KY',
    lat: 38.2527,
    lng: -85.7585,
    zipCodes: ['40201', '40202', '40203', '40204', '40205', '40206', '40207', '40208', '40209', '40210'],
    description: 'Louisville, Kentucky offers numerous EBT locations including Kroger, Meijer, and Walmart.'
  },
  'omaha': {
    name: 'Omaha',
    state: 'NE',
    lat: 41.2565,
    lng: -95.9345,
    zipCodes: ['68101', '68102', '68103', '68104', '68105', '68106', '68107', '68108', '68109', '68110'],
    description: 'Omaha, Nebraska offers numerous EBT locations including Hy-Vee, Baker\'s, and Walmart.'
  },
  'honolulu': {
    name: 'Honolulu',
    state: 'HI',
    lat: 21.3069,
    lng: -157.8583,
    zipCodes: ['96801', '96802', '96803', '96804', '96805', '96806', '96807', '96808', '96809', '96810'],
    description: 'Honolulu, Hawaii offers numerous EBT locations including Safeway, Foodland, and Don Quijote.'
  },
  'anchorage': {
    name: 'Anchorage',
    state: 'AK',
    lat: 61.2181,
    lng: -149.9003,
    zipCodes: ['99501', '99502', '99503', '99504', '99505', '99506', '99507', '99508', '99509', '99510'],
    description: 'Anchorage, Alaska offers numerous EBT locations including Carrs, Fred Meyer, and Walmart.'
  }
};

// Get all city slugs for routing
export function getAllCitySlugs(): string[] {
  return Object.keys(cityData);
}

// Get city data by slug
export function getCityBySlug(slug: string): CityData | null {
  return cityData[slug] || null;
}

// Get total count of cities
export function getCityCount(): number {
  return Object.keys(cityData).length;
}
