/**
 * Brand logo utility for national chains
 * Uses Google Favicon API to fetch brand icons
 */

// Map of brand name patterns to their official domains
const BRAND_DOMAINS: Record<string, string> = {
  // Supermarkets & Grocery
  'walmart': 'walmart.com',
  'target': 'target.com',
  'costco': 'costco.com',
  'kroger': 'kroger.com',
  'safeway': 'safeway.com',
  'albertsons': 'albertsons.com',
  'publix': 'publix.com',
  'aldi': 'aldi.us',
  'trader joe': 'traderjoes.com',
  'whole foods': 'wholefoodsmarket.com',
  'food lion': 'foodlion.com',
  'giant': 'giantfood.com',
  'stop & shop': 'stopandshop.com',
  'wegmans': 'wegmans.com',
  'h-e-b': 'heb.com',
  'heb': 'heb.com',
  'meijer': 'meijer.com',
  'winco': 'wincofoods.com',
  'food 4 less': 'food4less.com',
  'save-a-lot': 'savealot.com',
  'piggly wiggly': 'pigglywiggly.com',
  'sprouts': 'sprouts.com',
  'natural grocers': 'naturalgrocers.com',
  
  // Ethnic & Specialty Grocery
  'patel brothers': 'patelbros.com',
  'h mart': 'hmart.com',
  'h-mart': 'hmart.com',
  'super h mart': 'hmart.com',
  'bravo supermarket': 'bravosupermarkets.com',
  'compare foods': 'comparefoods.net',
  'seafood city': 'seafoodcity.com',
  'fiesta mart': 'fiestamart.com',
  'fiesta market': 'fiestamart.com',
  'supermercados morelos': 'morelos.com',
  'la michoacana': 'lamichoacanameatmarket.com',
  'food bazaar': 'foodbazaar.com',
  
  // Regional Grocery Chains
  'key food': 'keyfood.com',
  'c-town': 'ctownsupermarkets.com',
  'c town': 'ctownsupermarkets.com',
  'food city': 'foodcity.com',
  'giant eagle': 'gianteagle.com',
  'price chopper': 'pricechopper.com',
  'market basket': 'shopmarketbasket.com',
  'lidl': 'lidl.com',
  
  // Dollar Stores
  'dollar general': 'dollargeneral.com',
  'dollar tree': 'dollartree.com',
  'family dollar': 'familydollar.com',
  'five below': 'fivebelow.com',
  '99 cents': '99only.com',
  
  // Convenience Stores
  '7-eleven': '7-eleven.com',
  '7 eleven': '7-eleven.com',
  'circle k': 'circlek.com',
  'wawa': 'wawa.com',
  'sheetz': 'sheetz.com',
  'speedway': 'speedway.com',
  'racetrac': 'racetrac.com',
  'quiktrip': 'quiktrip.com',
  'casey': 'caseys.com',
  'kwik trip': 'kwiktrip.com',
  'pilot': 'pilotflyingj.com',
  'loves': 'loves.com',
  'cumberland farms': 'cumberlandfarms.com',
  'royal farms': 'royalfarms.com',
  'kangaroo express': 'kangarooexpress.com',
  'ez mart': 'ezmart.com',
  'pantry 1': 'pantry1.com',
  
  // Gas Stations & Fuel
  'chevron': 'chevron.com',
  'shell': 'shell.com',
  'marathon': 'marathon.com',
  'sunoco': 'sunoco.com',
  'citgo': 'citgo.com',
  'exxon': 'exxon.com',
  'bp': 'bp.com',
  'mobil': 'mobil.com',
  'valero': 'valero.com',
  'texaco': 'texaco.com',
  'phillips 66': 'phillips66.com',
  'arco': 'arco.com',
  'ampm': 'ampm.com',
  
  // Pharmacy & Drug Stores
  'cvs': 'cvs.com',
  'walgreens': 'walgreens.com',
  'rite aid': 'riteaid.com',
  
  // Warehouse Clubs
  'sam\'s club': 'samsclub.com',
  'sams club': 'samsclub.com',
  'bj\'s': 'bjs.com',
  'bjs': 'bjs.com',
  
  // Fast Food
  'mcdonald': 'mcdonalds.com',
  'burger king': 'bk.com',
  'wendy': 'wendys.com',
  'taco bell': 'tacobell.com',
  'kfc': 'kfc.com',
  'kentucky fried': 'kfc.com',
  'chick-fil-a': 'chick-fil-a.com',
  'chick fil a': 'chick-fil-a.com',
  'popeyes': 'popeyes.com',
  'subway': 'subway.com',
  'chipotle': 'chipotle.com',
  'arby': 'arbys.com',
  'sonic': 'sonicdrivein.com',
  'jack in the box': 'jackinthebox.com',
  'carl\'s jr': 'carlsjr.com',
  'carls jr': 'carlsjr.com',
  'hardee': 'hardees.com',
  'five guys': 'fiveguys.com',
  'whataburger': 'whataburger.com',
  'in-n-out': 'in-n-out.com',
  'in n out': 'in-n-out.com',
  'raising cane': 'raisingcanes.com',
  'panda express': 'pandaexpress.com',
  'panera': 'panerabread.com',
  
  // Pizza
  'domino': 'dominos.com',
  'pizza hut': 'pizzahut.com',
  'papa john': 'papajohns.com',
  'little caesar': 'littlecaesars.com',
  'papa murphy': 'papamurphys.com',
  'marco\'s pizza': 'marcos.com',
  
  // Coffee & Donuts
  'starbucks': 'starbucks.com',
  'dunkin': 'dunkindonuts.com',
  'tim horton': 'timhortons.com',
  'krispy kreme': 'krispykreme.com',
  
  // Other Restaurants
  'olive garden': 'olivegarden.com',
  'applebee': 'applebees.com',
  'chili\'s': 'chilis.com',
  'chilis': 'chilis.com',
  'denny\'s': 'dennys.com',
  'dennys': 'dennys.com',
  'ihop': 'ihop.com',
  'waffle house': 'wafflehouse.com',
  'cracker barrel': 'crackerbarrel.com',
  'red lobster': 'redlobster.com',
  'longhorn': 'longhornsteakhouse.com',
  'outback': 'outback.com',
  'texas roadhouse': 'texasroadhouse.com',
  'buffalo wild wings': 'buffalowildwings.com',
  'golden corral': 'goldencorral.com',
  
  // Retail
  'home depot': 'homedepot.com',
  'lowe\'s': 'lowes.com',
  'lowes': 'lowes.com',
  'best buy': 'bestbuy.com',
  'staples': 'staples.com',
  'office depot': 'officedepot.com',
  'michaels': 'michaels.com',
  'hobby lobby': 'hobbylobby.com',
  'joann': 'joann.com',
  'bed bath': 'bedbathandbeyond.com',
  'petco': 'petco.com',
  'petsmart': 'petsmart.com',
  'autozone': 'autozone.com',
  'o\'reilly': 'oreillyauto.com',
  'advance auto': 'advanceautoparts.com',
};

// Generate Google Favicon URL
const getLogoUrl = (domain: string, size: number = 128): string => {
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=${size}`;
};

/**
 * Match store name to a known brand domain
 * Uses case-insensitive partial matching
 */
const matchBrandDomain = (storeName: string): { domain: string; brandKey: string } | null => {
  if (!storeName) return null;
  
  const normalizedName = storeName.toLowerCase().trim();
  
  // First try exact match
  for (const [brandKey, domain] of Object.entries(BRAND_DOMAINS)) {
    if (normalizedName === brandKey) {
      return { domain, brandKey };
    }
  }
  
  // Then try starts with
  for (const [brandKey, domain] of Object.entries(BRAND_DOMAINS)) {
    if (normalizedName.startsWith(brandKey)) {
      return { domain, brandKey };
    }
  }
  
  // Finally try contains
  for (const [brandKey, domain] of Object.entries(BRAND_DOMAINS)) {
    if (normalizedName.includes(brandKey)) {
      return { domain, brandKey };
    }
  }
  
  return null;
};

/**
 * Get brand logo info for a store
 * Returns logo URL and brand name if store is a known national chain
 */
export const getBrandLogo = (storeName: string | null): { 
  logoUrl: string; 
  brandName: string;
  domain: string;
} | null => {
  if (!storeName) return null;
  
  const match = matchBrandDomain(storeName);
  if (!match) return null;
  
  return {
    logoUrl: getLogoUrl(match.domain, 64),
    brandName: match.brandKey,
    domain: match.domain,
  };
};

/**
 * Check if a store name matches a known national brand
 */
export const isKnownBrand = (storeName: string | null): boolean => {
  if (!storeName) return false;
  return matchBrandDomain(storeName) !== null;
};

/**
 * Get the brand domain for a store name
 */
export const getBrandDomain = (storeName: string | null): string | null => {
  if (!storeName) return null;
  const match = matchBrandDomain(storeName);
  return match?.domain ?? null;
};

/**
 * Get high-res logo URL for detail pages
 */
export const getBrandLogoHighRes = (storeName: string | null): string | null => {
  if (!storeName) return null;
  const match = matchBrandDomain(storeName);
  if (!match) return null;
  return getLogoUrl(match.domain, 128);
};
