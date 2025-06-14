
// Define exclusion patterns for each category
export const CATEGORY_EXCLUSIONS: Record<string, string[]> = {
  grocery: ['CVS', 'Walgreens', 'Rite Aid', 'Dollar'],
  convenience: ['CVS', 'Walgreens', 'Rite Aid', 'Dollar'],
  dollar: ['CVS', 'Walgreens', 'Rite Aid', 'Pharmacy', 'Drug Store'],
  pharmacy: ['Dollar', 'Market'],
  farmers: ['CVS', 'Walgreens', 'Dollar', 'Whole Foods', 'Super Market', 'Food Market', 'Meat Market', 'Fish Market', 'Flea Market'],
  hotmeals: ['CVS', 'Walgreens', 'Dollar', 'Market']
};

// Default radius settings for categories
export const CATEGORY_RADIUS: Record<string, number> = {
  farmers: 40,
  hotmeals: 25,
  default: 10
};
