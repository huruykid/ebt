
# Brand Logo Display for National Chains

## Overview

This plan adds official brand logos for well-known national stores (e.g., Walmart, McDonald's, Taco Bell, Target) as the primary image on store cards and detail pages. When a recognized brand is detected, its logo will be displayed prominently instead of a generic placeholder image.

---

## Current State Analysis

The codebase has **three photo display components** that need to be updated:

| Component | Location | Usage |
|-----------|----------|-------|
| `StorePhotoDisplay` | `src/components/store/StorePhoto.tsx` | UnifiedStoreCard, EnhancedStoreCard |
| `StorePhoto` | `src/components/StorePhoto.tsx` | Fallback in UnifiedStoreCard |
| `StorePhotos` | `src/components/store-detail/StorePhotos.tsx` | Store detail page hero |

Currently, these components use:
1. Google Places photos (when available)
2. Unsplash stock photos matched by store name/type (fallback)

---

## Implementation Approach

### Use CDN-Hosted Brand Logos

Rather than storing logos locally (which would require licensing agreements), use a reliable CDN service that provides brand logos. Options include:

- **Clearbit Logo API** (free, widely used): `https://logo.clearbit.com/:domain`
- **Brand Fetch API** (requires API key)
- **Simple Icons** (for tech brands, limited retail)

**Recommended**: Use Clearbit Logo API with a local fallback mapping of known brand domains.

---

## Phase 1: Create Brand Logo Utility

### New File: `src/utils/brandLogos.ts`

Create a centralized utility that:
1. Maps store names to their official domains
2. Generates logo URLs via Clearbit
3. Provides fallback handling

```text
Brand Mapping (examples):
- "walmart" → walmart.com → logo.clearbit.com/walmart.com
- "mcdonald's" → mcdonalds.com
- "taco bell" → tacobell.com
- "target" → target.com
- "cvs" → cvs.com
- "walgreens" → walgreens.com
- "7-eleven" → 7-eleven.com
- "starbucks" → starbucks.com
- "dunkin" → dunkindonuts.com
- "burger king" → bk.com
- "kfc" → kfc.com
- "subway" → subway.com
- "chipotle" → chipotle.com
- "domino's" → dominos.com
- "pizza hut" → pizzahut.com
- "costco" → costco.com
- "kroger" → kroger.com
- "safeway" → safeway.com
- "albertsons" → albertsons.com
- "publix" → publix.com
- "aldi" → aldi.us
- "trader joe's" → traderjoes.com
- "whole foods" → wholefoodsmarket.com
- "dollar general" → dollargeneral.com
- "dollar tree" → dollartree.com
- "family dollar" → familydollar.com
```

**Utility Functions:**
```text
- getBrandLogo(storeName: string): { logoUrl: string; brandName: string } | null
- isKnownBrand(storeName: string): boolean
- getBrandDomain(storeName: string): string | null
```

---

## Phase 2: Create Brand Logo Component

### New File: `src/components/store/BrandLogo.tsx`

A reusable component that displays brand logos with:
- Clean white background for logo visibility
- Fallback to existing behavior if logo fails to load
- Consistent sizing for cards vs. detail pages

**Props:**
```text
interface BrandLogoProps {
  storeName: string | null;
  storeType?: string | null;
  variant: 'card' | 'detail' | 'hero';
  className?: string;
  fallbackElement?: React.ReactNode;
}
```

**Behavior:**
- `card` variant: 96x96px or 128x128px logo centered
- `detail` variant: Larger logo for detail page header
- `hero` variant: Large centered logo for StorePhotos hero section

---

## Phase 3: Update Store Photo Components

### 3.1 Update `StorePhotoDisplay` (store/StorePhoto.tsx)

**Current logic:**
1. Try Google Photos → show image
2. Fallback → MapPin icon placeholder

**New logic:**
1. Check if brand logo available → show `BrandLogo`
2. Try Google Photos → show image
3. Fallback → MapPin icon placeholder

### 3.2 Update `StorePhoto` (StorePhoto.tsx)

**Current logic:**
1. Match store name to Unsplash photo
2. Display with overlay

**New logic:**
1. Check if brand logo available → show `BrandLogo`
2. Fallback to Unsplash-based image

### 3.3 Update `StorePhotos` (store-detail/StorePhotos.tsx)

**Current logic:**
1. Show Google photos carousel
2. Fallback to Unsplash background

**New logic:**
1. If no Google/user photos AND is known brand → display hero with brand logo
2. Keep existing photo carousel behavior when photos exist
3. Fallback to Unsplash for unknown stores without photos

---

## Phase 4: Update UnifiedStoreCard Integration

### File: `src/components/UnifiedStoreCard.tsx`

Update the photo section to prioritize brand logos:

```text
Current (lines 82-96):
- enhanced && photos → StorePhotoDisplay
- else → StorePhoto (Unsplash fallback)

New:
- isKnownBrand(store.Store_Name) && !hasGooglePhotos → BrandLogo
- enhanced && photos → StorePhotoDisplay  
- else → StorePhoto (Unsplash fallback)
```

---

## Visual Design

### Store Card Layout (with brand logo)
```text
┌─────────────────────────────────────────────┐
│ ┌─────────┐  Store Name          ★ 4.2     │
│ │         │  Grocery Store • EBT  Verified │
│ │ [LOGO]  │  📍 123 Main St • 2.3 mi       │
│ │         │  ────────────────────────────  │
│ └─────────┘  [📞 Call] [🧭 Directions] [❤️] │
└─────────────────────────────────────────────┘
```

### Store Detail Hero (with brand logo)
```text
┌────────────────────────────────────────────────────────┐
│                                                        │
│              ┌─────────────────────────┐               │
│              │                         │               │
│              │      [BRAND LOGO]       │               │
│              │                         │               │
│              └─────────────────────────┘               │
│                                                        │
│                   Walmart Supercenter                  │
│                                                        │
│            [Add Photos]  [Share]                       │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

## File Changes Summary

| Action | File | Description |
|--------|------|-------------|
| Create | `src/utils/brandLogos.ts` | Brand name → logo URL mapping utility |
| Create | `src/components/store/BrandLogo.tsx` | Reusable brand logo display component |
| Update | `src/components/store/StorePhoto.tsx` | Prioritize brand logo in `StorePhotoDisplay` |
| Update | `src/components/StorePhoto.tsx` | Add brand logo check before Unsplash fallback |
| Update | `src/components/store-detail/StorePhotos.tsx` | Show brand logo in hero when no photos |
| Update | `src/components/UnifiedStoreCard.tsx` | Integrate brand logo priority |
| Update | `src/components/store/index.ts` | Export new `BrandLogo` component |

---

## Technical Considerations

### Logo Loading Strategy
- Use `onError` handler to gracefully fall back if Clearbit logo unavailable
- Cache logo availability check in component state
- Preload logos for visible stores if performance needed

### Brand Matching Logic
- Case-insensitive matching
- Handle variations: "McDonald's", "McDonalds", "MCDONALD'S"
- Match partial names: "Walmart Supercenter" → "walmart"
- Priority order: exact match → starts with → contains

### Logo Presentation
- White/light background container for dark logos
- Consistent padding (12-16px)
- Maintain aspect ratio, contain within bounds
- Subtle border/shadow for visual definition

---

## Testing Considerations

After implementation:
1. Search for "Walmart" → verify logo displays on cards
2. Open a McDonald's store detail → verify hero shows logo
3. Test unknown store → verify fallback to Unsplash works
4. Test store with Google photos → verify photos still prioritized
5. Test on mobile viewport for sizing
