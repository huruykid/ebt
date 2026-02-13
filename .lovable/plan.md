

# Fix Search Page Padding and Styling Issues

## Root Cause
Several CSS classes used throughout the search page (`card-gradient`, `rounded-spotify-lg`, `rounded-spotify-xl`) are **not defined anywhere** in the project's CSS or Tailwind config. This means the category filters wrapper, results summary card, and error/empty states have no background, no border-radius, and no visual distinction -- making the layout look broken and "disjointed."

## Changes

### 1. Replace phantom CSS classes in `SearchResults.tsx`
- Replace `card-gradient rounded-spotify-lg` with real Tailwind classes: `bg-card rounded-lg`
- Replace `card-gradient rounded-spotify-xl` with `bg-card rounded-xl`
- Reduce vertical gap between sections: `space-y-6` to `space-y-4`
- Reduce grid gap between store cards: `gap-6` to `gap-4`
- Remove `BudgetWarningBanner` from the results (it adds clutter and is not actionable by users)

### 2. Replace phantom CSS classes in `SearchContainer.tsx`
- Replace `card-gradient rounded-xl` wrapper around CategoryTabs with `bg-card rounded-lg`
- Tighten spacing: reduce `mt-4 mb-2` to `mt-3 mb-3` around category section
- Reduce `mt-6` before results to `mt-4`

### 3. Fix CategoryTabs background for dark/light mode
- Replace hardcoded `bg-gray-50` on the nav element with `bg-muted` so it adapts to the theme
- This prevents the white-on-white appearance on the light background

### 4. Fix SmartSearchResults phantom classes
- Same `card-gradient rounded-spotify-*` replacements
- Fix the broken grid: `md:grid-cols-2 lg:grid-cols-1` to `grid-cols-1`

### What This Fixes
- Category tabs section will have a visible card background and proper border radius
- Results summary will be properly styled with card background
- Consistent spacing between elements (no big gaps)
- Store cards display in a clean single-column layout
- Theme-aware backgrounds throughout

### Technical Details

**`src/components/store-search/SearchResults.tsx`**
- Line 106: `space-y-6` to `space-y-4`
- Line 111: `card-gradient rounded-spotify-lg` to `bg-card rounded-lg`
- Line 169: `gap-6` to `gap-4`
- Lines 68, 78: Replace `card-gradient rounded-spotify-xl` with `bg-card rounded-xl`
- Lines 107-108: Remove BudgetWarningBanner import and usage

**`src/components/store-search/SearchContainer.tsx`**
- Line 239: `card-gradient rounded-xl` to `bg-card rounded-lg`
- Line 238: `mt-4 mb-2` to `mt-3 mb-3`
- Line 270: `mt-6` to `mt-4`

**`src/components/CategoryTabs.tsx`**
- Line 177: `bg-gray-50` to `bg-muted`

**`src/components/store-search/SmartSearchResults.tsx`**
- Lines 43, 53, 70: Replace `card-gradient rounded-spotify-*` with real Tailwind classes
- Line 86: Fix grid to `grid-cols-1`

