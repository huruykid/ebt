
// Define exclusion patterns for each category
export const CATEGORY_EXCLUSIONS: Record<string, string[]> = {
  grocery: ['CVS', 'Walgreens', 'Rite Aid', 'Dollar'],
  convenience: ['CVS', 'Walgreens', 'Rite Aid', 'Dollar'],
  hotmeals: ['CVS', 'Walgreens', 'Dollar', 'Market']
};

// Default radius settings for categories
export const CATEGORY_RADIUS: Record<string, number> = {
  hotmeals: 25,
  default: 10
};
