// SNAP Benefits Data for FY2025 (October 1, 2024 - September 30, 2025)
// Source: USDA Food and Nutrition Service
// https://fns-prod.azureedge.us/sites/default/files/media/file/FY2025-Maximum-Allotments-Deductions.pdf
// https://fns-prod.azureedge.us/sites/default/files/media/file/FY2025-Income-Eligibility-Standards.pdf

export const SNAP_FY_YEAR = '2025';
export const SNAP_EFFECTIVE_DATE = 'October 1, 2024';
export const SNAP_END_DATE = 'September 30, 2025';

// Gross monthly income limits (130% of Federal Poverty Level)
// For 48 contiguous states + DC
export const GROSS_INCOME_LIMITS: Record<number, number> = {
  1: 1632,
  2: 2215,
  3: 2798,
  4: 3381,
  5: 3964,
  6: 4547,
  7: 5130,
  8: 5713,
  // Each additional person add $583
};

// Net monthly income limits (100% of Federal Poverty Level)
export const NET_INCOME_LIMITS: Record<number, number> = {
  1: 1255,
  2: 1704,
  3: 2152,
  4: 2600,
  5: 3048,
  6: 3496,
  7: 3944,
  8: 4392,
  // Each additional person add $448
};

// Maximum monthly SNAP allotments by household size
export const MAX_ALLOTMENTS: Record<number, number> = {
  1: 292,
  2: 536,
  3: 768,
  4: 975,
  5: 1158,
  6: 1390,
  7: 1536,
  8: 1756,
  // Each additional person add $220
};

// Standard deduction by household size
export const STANDARD_DEDUCTIONS: Record<number, number> = {
  1: 198,
  2: 198,
  3: 198,
  4: 208,
  5: 244,
  6: 279,
  // 7+ is also 279
};

// For household sizes > 8
export const ADDITIONAL_PERSON_GROSS = 583;
export const ADDITIONAL_PERSON_NET = 448;
export const ADDITIONAL_PERSON_ALLOTMENT = 220;

// State application links
export const STATE_APPLICATION_LINKS: Record<string, { name: string; url: string }> = {
  AL: { name: 'Alabama', url: 'https://www.compass.state.pa.us/Compass.Web/Public/CMPHome' },
  AK: { name: 'Alaska', url: 'https://myalaska.dhss.alaska.gov/' },
  AZ: { name: 'Arizona', url: 'https://healthearizonaplus.gov/' },
  AR: { name: 'Arkansas', url: 'https://access.arkansas.gov/' },
  CA: { name: 'California', url: 'https://benefitscal.com/' },
  CO: { name: 'Colorado', url: 'https://peak.ok.gov/' },
  CT: { name: 'Connecticut', url: 'https://connect.ct.gov/' },
  DE: { name: 'Delaware', url: 'https://assist.dhss.delaware.gov/' },
  DC: { name: 'District of Columbia', url: 'https://dcbenefits.dhs.dc.gov/' },
  FL: { name: 'Florida', url: 'https://www.myflorida.com/accessflorida/' },
  GA: { name: 'Georgia', url: 'https://gateway.ga.gov/' },
  HI: { name: 'Hawaii', url: 'https://humanservices.hawaii.gov/bessd/snap/' },
  ID: { name: 'Idaho', url: 'https://healthandwelfare.idaho.gov/' },
  IL: { name: 'Illinois', url: 'https://abe.illinois.gov/' },
  IN: { name: 'Indiana', url: 'https://fssabenefits.in.gov/' },
  IA: { name: 'Iowa', url: 'https://dhsservices.iowa.gov/' },
  KS: { name: 'Kansas', url: 'https://cssp.kees.ks.gov/' },
  KY: { name: 'Kentucky', url: 'https://kynect.ky.gov/' },
  LA: { name: 'Louisiana', url: 'https://cafe-cp.la.gov/' },
  ME: { name: 'Maine', url: 'https://www1.maine.gov/benefits/account/login.html' },
  MD: { name: 'Maryland', url: 'https://mydhrbenefits.dhr.state.md.us/' },
  MA: { name: 'Massachusetts', url: 'https://dtaconnect.eohhs.mass.gov/' },
  MI: { name: 'Michigan', url: 'https://newmibridges.michigan.gov/' },
  MN: { name: 'Minnesota', url: 'https://applymn.dhs.mn.gov/' },
  MS: { name: 'Mississippi', url: 'https://www.mdhs.ms.gov/economic-assistance/snap/' },
  MO: { name: 'Missouri', url: 'https://mydss.mo.gov/' },
  MT: { name: 'Montana', url: 'https://apply.mt.gov/' },
  NE: { name: 'Nebraska', url: 'https://dhhs-access-neb.ne.gov/' },
  NV: { name: 'Nevada', url: 'https://dwss.nv.gov/' },
  NH: { name: 'New Hampshire', url: 'https://nheasy.nh.gov/' },
  NJ: { name: 'New Jersey', url: 'https://mynjhelps.gov/' },
  NM: { name: 'New Mexico', url: 'https://www.yes.state.nm.us/' },
  NY: { name: 'New York', url: 'https://mybenefits.ny.gov/' },
  NC: { name: 'North Carolina', url: 'https://epass.nc.gov/' },
  ND: { name: 'North Dakota', url: 'https://apps.nd.gov/dhs/eapp/' },
  OH: { name: 'Ohio', url: 'https://benefits.ohio.gov/' },
  OK: { name: 'Oklahoma', url: 'https://okdhslive.org/' },
  OR: { name: 'Oregon', url: 'https://one.oregon.gov/' },
  PA: { name: 'Pennsylvania', url: 'https://www.compass.state.pa.us/' },
  RI: { name: 'Rhode Island', url: 'https://healthyrhode.ri.gov/' },
  SC: { name: 'South Carolina', url: 'https://dss.sc.gov/assistance-programs/snap/' },
  SD: { name: 'South Dakota', url: 'https://dss.sd.gov/economicassistance/snap/' },
  TN: { name: 'Tennessee', url: 'https://fabenefits.tn.gov/' },
  TX: { name: 'Texas', url: 'https://www.yourtexasbenefits.com/' },
  UT: { name: 'Utah', url: 'https://jobs.utah.gov/mycase/' },
  VT: { name: 'Vermont', url: 'https://dcf.vermont.gov/benefits' },
  VA: { name: 'Virginia', url: 'https://commonhelp.virginia.gov/' },
  WA: { name: 'Washington', url: 'https://www.washingtonconnection.org/' },
  WV: { name: 'West Virginia', url: 'https://dhhr.wv.gov/bcf/Services/familyassistance/Pages/SNAP.aspx' },
  WI: { name: 'Wisconsin', url: 'https://access.wisconsin.gov/' },
  WY: { name: 'Wyoming', url: 'https://dfsapply.wyo.gov/' },
};

// Helper functions
export function getGrossIncomeLimit(householdSize: number): number {
  if (householdSize <= 8) {
    return GROSS_INCOME_LIMITS[householdSize];
  }
  return GROSS_INCOME_LIMITS[8] + (householdSize - 8) * ADDITIONAL_PERSON_GROSS;
}

export function getNetIncomeLimit(householdSize: number): number {
  if (householdSize <= 8) {
    return NET_INCOME_LIMITS[householdSize];
  }
  return NET_INCOME_LIMITS[8] + (householdSize - 8) * ADDITIONAL_PERSON_NET;
}

export function getMaxAllotment(householdSize: number): number {
  if (householdSize <= 8) {
    return MAX_ALLOTMENTS[householdSize];
  }
  return MAX_ALLOTMENTS[8] + (householdSize - 8) * ADDITIONAL_PERSON_ALLOTMENT;
}

export function getStandardDeduction(householdSize: number): number {
  if (householdSize <= 3) {
    return STANDARD_DEDUCTIONS[1];
  }
  if (householdSize <= 6) {
    return STANDARD_DEDUCTIONS[householdSize];
  }
  return STANDARD_DEDUCTIONS[6];
}

// Calculate estimated benefit
// Simplified formula: Benefit = Max Allotment - (30% of Net Income)
// Net Income = Gross Income - Standard Deduction (simplified)
export function calculateEstimatedBenefit(
  householdSize: number,
  grossMonthlyIncome: number
): {
  isEligible: boolean;
  estimatedBenefit: number;
  maxBenefit: number;
  grossIncomeLimit: number;
  netIncomeLimit: number;
  reason?: string;
} {
  const grossLimit = getGrossIncomeLimit(householdSize);
  const netLimit = getNetIncomeLimit(householdSize);
  const maxAllotment = getMaxAllotment(householdSize);
  const standardDeduction = getStandardDeduction(householdSize);

  // Check gross income limit first
  if (grossMonthlyIncome > grossLimit) {
    return {
      isEligible: false,
      estimatedBenefit: 0,
      maxBenefit: maxAllotment,
      grossIncomeLimit: grossLimit,
      netIncomeLimit: netLimit,
      reason: `Your gross income exceeds the limit of $${grossLimit.toLocaleString()} for a household of ${householdSize}.`,
    };
  }

  // Calculate net income (simplified - just subtract standard deduction)
  const netIncome = Math.max(0, grossMonthlyIncome - standardDeduction);

  // Check net income limit
  if (netIncome > netLimit) {
    return {
      isEligible: false,
      estimatedBenefit: 0,
      maxBenefit: maxAllotment,
      grossIncomeLimit: grossLimit,
      netIncomeLimit: netLimit,
      reason: `Your estimated net income exceeds the limit of $${netLimit.toLocaleString()} for a household of ${householdSize}.`,
    };
  }

  // Calculate benefit: Max Allotment - 30% of net income
  const benefit30Percent = netIncome * 0.3;
  const estimatedBenefit = Math.max(0, Math.round(maxAllotment - benefit30Percent));

  // Minimum benefit for 1-2 person households is $23
  const minimumBenefit = householdSize <= 2 ? 23 : 0;
  const finalBenefit = Math.max(minimumBenefit, estimatedBenefit);

  return {
    isEligible: true,
    estimatedBenefit: finalBenefit,
    maxBenefit: maxAllotment,
    grossIncomeLimit: grossLimit,
    netIncomeLimit: netLimit,
  };
}
