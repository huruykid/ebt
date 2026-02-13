

# Replace Clearbit Logo API (Discontinued)

## Problem

The Clearbit Logo API (`logo.clearbit.com`) was officially shut down in December 2025. All brand logos throughout the app -- on store cards, store detail pages, and search results -- are currently broken and falling back to generic store icons.

## Solution

Switch to **Google's Favicon API** (`google.com/s2/favicons`) as the logo source. It's free, requires no API key, and supports sizes up to 128px. While favicons are smaller than dedicated logo images, they provide recognizable brand icons for national chains, which is far better than the current broken state.

The existing brand-to-domain mapping in `brandLogos.ts` stays exactly the same -- only the URL generation function changes.

## What Changes

### 1. `src/utils/brandLogos.ts` -- Swap the URL generator

Replace the `getClearbitLogoUrl` function:

```text
Before: https://logo.clearbit.com/walmart.com?size=128
After:  https://www.google.com/s2/favicons?domain=walmart.com&sz=128
```

- Update `getClearbitLogoUrl` (rename to `getLogoUrl`) to use Google's favicon endpoint
- For high-res (detail/hero pages), use `sz=128` (max supported)
- For card views, use `sz=64`
- The full brand domain mapping (100+ brands) is untouched

### 2. `src/components/store/BrandLogo.tsx` -- No changes needed

The component already handles errors with `onError` fallback. The new URLs will just work.

### 3. `src/components/UnifiedStoreCard.tsx` -- No changes needed

Same pattern -- already handles `logoError` state.

### 4. `src/components/store-detail/StorePhotos.tsx` -- No changes needed

Already has `logoError` fallback logic.

## Technical Details

- **Files modified**: 1 (`src/utils/brandLogos.ts`)
- **No new dependencies**
- **No API key required** -- Google's favicon API is free and unauthenticated
- **Limitation**: Favicons max out at 128px, so they'll be smaller than the old Clearbit logos. For hero sections this may look slightly less polished, but it's functional.
- **Future upgrade path**: If higher-quality logos are needed later, Logo.dev (the official Clearbit successor) can be integrated with an API key stored as a Supabase secret.

