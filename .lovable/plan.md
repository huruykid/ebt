

## Store Detail Page Audit & Fixes

### Issues Found

**1. "OpenMaps Card" (OverpassDataCard) -- Remove**
The `OverpassDataCard` component displays raw OpenStreetMap/Overpass API data (phone, website, hours, shop type, brand, address, OSM ID). This data is redundant -- the same info already appears in `StoreHeader` and `EnhancedGooglePlacesInfo`. It also exposes technical details users don't care about (OSM ID, confidence score). Yelp would never show this.

**2. Duplicate "Add to List" Button**
`AddToListButton` is rendered twice in the sidebar column:
- Once at line 177-183 (hidden on mobile, visible on desktop)
- Again at lines 198-204 (also hidden on mobile, visible on desktop)

This creates two identical buttons stacked in the right column on desktop.

**3. Layout: Yelp-Inspired Improvements**
Yelp's store detail pattern is:
- Header card with name, rating, badges, and action buttons (already good)
- Right sidebar with contact/hours info (already good)
- Left/main column with reviews (already good)
- No redundant data cards or raw API dumps

The current layout is close to Yelp but the OverpassDataCard and duplicate button break the clean feel.

### Changes

**File 1: `src/components/store-detail/EnhancedStoreInfo.tsx`**
- Remove the `OverpassDataCard` import and rendering. Since `EnhancedStoreInfo` only renders `OverpassDataCard`, this component becomes empty. We'll render nothing (return null) or remove its usage entirely from `StoreDetail.tsx`.

**File 2: `src/pages/StoreDetail.tsx`**
- Remove `EnhancedStoreInfo` import and usage (line 14, line 211) since it will be empty after removing OverpassDataCard.
- Remove the duplicate `AddToListButton` block (lines 197-204) from the sidebar. Keep only the one at lines 177-183.

**File 3: `src/components/store-detail/cards/OverpassDataCard.tsx`** -- No deletion needed, just removing its usage. It can be cleaned up later if desired.

### Summary of Removals
| Item | Reason |
|------|--------|
| OverpassDataCard rendering | Redundant data, technical/raw feel, not Yelp-like |
| Duplicate AddToListButton | UI bug -- two identical buttons on desktop |
| EnhancedStoreInfo usage | Becomes empty wrapper after OverpassDataCard removal |

### What Stays (Already Yelp-Like)
- StoreHeader with name, rating, badges, Call/Directions buttons
- EnhancedGooglePlacesInfo sidebar with verified contact info, hours, categories
- StoreHoursCard for user-contributed hours
- GoogleReviewsSection and ReviewSection in main column
- StoreComments and StorePricesList
- Responsive padding (`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`) is already correct

