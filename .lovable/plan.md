
# Fix Disjointed Search Page Layout

## Problem
The `/search` route renders `EnhancedSearch.tsx`, which uses two completely different UIs:
- **Mobile**: `MobileSearchInterface` with a confusing bottom-sheet overlay pattern, no category tabs, no Open Now filter
- **Desktop/Tablet**: `EnhancedSearchBar` with vertically stacked buttons, no categories

Meanwhile, `SearchContainer` (which has the newly added category tabs, Open Now toggle, Bakery/Delivery filters) is **not connected to the `/search` route at all** -- it sits unused in `StoreSearch.tsx`.

## Solution
Replace the `EnhancedSearch` page with a unified layout that uses `SearchContainer` for all screen sizes. This gives every user the same clean, consistent experience with category filtering built in.

### Changes

**`src/pages/EnhancedSearch.tsx`** -- Complete rewrite
- Remove the `isMobile` branching that splits into two different UIs
- Remove imports of `MobileSearchInterface`, `EnhancedSearchBar`, `EnhancedSearchResults`
- Import and render `SearchContainer` (from `store-search/SearchContainer`) for all viewports
- Keep the SEO head and breadcrumbs (breadcrumbs hidden on mobile via responsive class)
- Parse URL `lat`/`lng` params (like `StoreSearch.tsx` does) so deep links work

**`src/components/store-search/SearchContainer.tsx`** -- Mobile spacing fixes
- Reduce top padding on mobile: `py-8` to `py-4 md:py-8`
- Reduce heading size on mobile: `text-3xl` to `text-2xl md:text-3xl`
- Reduce bottom margin on heading block: `mb-8` to `mb-4 md:mb-8`
- Reduce card padding on mobile: `p-6` to `p-4 md:p-6`
- Make the search card margin tighter: `mb-6` to `mb-4 md:mb-6`
- Remove `min-h-screen` wrapper (the page component handles that)
- Tighten category tabs section spacing on mobile

**`src/components/store-search/SearchResults.tsx`** -- Grid fix
- Change `md:grid-cols-2 lg:grid-cols-1` (broken -- goes 1 col then 2 then back to 1) to just single column `grid-cols-1` for consistent card layout

### What This Achieves
- Single, consistent search UI across mobile, tablet, and desktop
- Category tabs (Fast Food, Grocery, Bakery, Farmer's Market, Delivery, Corner Stores) visible on all devices
- Open Now toggle always accessible
- No more bottom-sheet overlay on mobile
- Proper responsive spacing so nothing feels "disjointed"
- Store name + location two-field search form on all breakpoints

### Technical Details
- `MobileSearchInterface` component is no longer imported (can be cleaned up later)
- `EnhancedSearchBar` and `EnhancedSearchResults` are no longer used on this page
- The `SearchContainer` already handles geolocation, geocoding, category filtering, and Open Now -- no new logic needed
