

## General App Improvements Plan

After reviewing the codebase, here are the highest-impact improvements organized by category.

---

### 1. Update outdated "2025" references to "2026"

The SnapTipsSection and related content references "2025" throughout (headlines, schema data). The current date is March 2026.

**Files:** `src/components/home/SnapTipsSection.tsx`, `src/pages/Index.tsx` (FAQ answers if any reference years)

---

### 2. Add skeleton loading states instead of spinners

The home page store list shows a generic `<LoadingSpinner>` while fetching stores. Skeleton cards that match the `UnifiedStoreCard` layout would feel faster and reduce perceived load time.

**File:** `src/components/ExploreTrending.tsx` — Replace `<LoadingSpinner />` with 4-6 skeleton cards (matching the card's logo + title + address layout) in both the nearby and ZIP search loading states.

---

### 3. Fix hardcoded `bg-white` that breaks theme consistency

Several components use `bg-white` instead of `bg-background` or `bg-card`:
- `App.tsx` line 79: `bg-white` on the root div
- `SnapTipsSection.tsx` line 8: `bg-white`
- `SnapTipsSection.tsx` line 10: Card `bg-white`
- `FAQSection.tsx` line 40: `bg-gray-50`
- Bottom nav wrapper in `App.tsx` line 133: `bg-white`

These should use Tailwind theme tokens (`bg-background`, `bg-card`, `bg-muted`) so the design system stays consistent.

**Files:** `src/App.tsx`, `src/components/home/SnapTipsSection.tsx`, `src/components/FAQSection.tsx`

---

### 4. Add a mini static map to the store detail page

The store detail page shows address text and a "Directions" button, but no visual map. Adding a small static map image (or a lazy-loaded Leaflet map) above the content would help users orient themselves immediately.

**File:** `src/pages/StoreDetail.tsx` — Add the existing `StoreMap` component (already exists at `src/components/store-detail/StoreMap.tsx`) between StoreHeader and EnhancedGooglePlacesInfo.

---

### 5. Improve the "no location" empty state

When a user has no location and hasn't searched, the home page shows a plain icon + text + popular cities. This could be more engaging with a brief value proposition and a more prominent location prompt.

**File:** `src/components/ExploreTrending.tsx` — Enhance the `NoLocationPrompt` with a larger, more inviting CTA button for enabling location, and add a subtle illustration or the EBT Finder logo.

---

### 6. Add "View on Map" quick action to store cards

Store cards on the home page show name, rating, address, distance, and favorite. Adding a small map icon that links to `/search?lat=X&lng=Y` (centered on that store) would let users quickly see the store's surroundings.

**File:** `src/components/UnifiedStoreCard.tsx` — This is a lower-priority polish item; can be skipped if the mini map on store detail (item 4) covers the need.

---

### Summary of changes

| Priority | Change | Impact |
|----------|--------|--------|
| High | Update "2025" to "2026" | Content accuracy |
| High | Skeleton loading cards | Perceived performance |
| High | Fix hardcoded `bg-white` | Design consistency |
| Medium | Add map to store detail page | User orientation |
| Medium | Improve no-location empty state | Engagement for new users |
| Low | Map quick action on store cards | Convenience |

