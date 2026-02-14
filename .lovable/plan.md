
# Codebase Audit Remediation Plan

This plan addresses all 11 issues from your audit, grouped by priority for efficient implementation.

---

## Phase 1: High Priority

### 1. Remove All Console Logging (193 statements across 19+ source files)

Create a lightweight production-safe logger utility at `src/utils/logger.ts` that only outputs in development mode. Then strip all `console.log` statements from source files, keeping only `console.error` and `console.warn` for genuine error handling.

**Files to modify:** ~19 files in `src/` including:
- `src/utils/searchQueryBuilder.ts` (12+ console.logs)
- `src/contexts/IPGeolocationContext.tsx` (3 console.logs)
- `src/hooks/useOverpassData.ts` (4 console.logs)
- `src/hooks/useGooglePlaces.ts` (8+ console.logs)
- `src/hooks/useLocationSearch.ts`, `useStoreSearchQuery.ts`, `useZipCodeSearch.ts`, etc.
- `src/components/store-detail/modals/AddPhoneModal.tsx`
- All other files with console.log statements

**New file:** `src/utils/logger.ts` -- a conditional logger that is silent in production.

---

## Phase 2: Medium Priority

### 2. Remove Unused Dependencies

Remove from `package.json`:
- `react-leaflet` (^4.2.1) -- replaced by plain Leaflet
- `@react-leaflet/core` (^2.1.0) -- no longer imported
- `mapbox-gl` (^3.17.0) -- zero imports in codebase

Move to `devDependencies`:
- `vitest` (^4.0.16) -- test runner, not needed in production

### 3. Fix TypeScript `as any` Casts

Define proper interfaces for Google Places data structures in `src/hooks/useStoredGooglePlaces.ts` and `src/hooks/useEnhancedStoreData.ts`. Replace all `as any` casts with typed assertions using the interfaces already defined in `useGooglePlaces.ts` (e.g., `GooglePlacesBusiness`).

### 4. Consolidate Category-to-Store-Type Mapping

In `src/utils/searchQueryBuilder.ts`, the category-to-store-type mapping is defined in three places:
- `getCategoryStoreTypes()` (lines 262-270)
- Inline arrays in `buildLocationAwareQuery()` (lines 216-243)
- `.or()` filter strings in `buildBaseQuery()` (lines 315-331)

Consolidate into a single `CATEGORY_CONFIG` map that all three code paths reference.

### 5. Move Hardcoded Values to Config/Env

- **Google Analytics ID**: Already in a constant (`GA_MEASUREMENT_ID`) but should read from `import.meta.env.VITE_GA_MEASUREMENT_ID` with the current value as fallback.
- **DEV_BYPASS_GEO_BLOCK**: Change from hardcoded `false` to `import.meta.env.VITE_DEV_BYPASS_GEO_BLOCK === 'true'`.
- **City word list**: Move from inline array in `searchQueryBuilder.ts` (line 138) to a shared constant imported from `src/constants/cityData.ts` (which already exists).
- **IPGeolocation fallback**: Change `city: 'United States'` to `city: ''` (empty string) since it is not a city.

### 6. Fix Inconsistent Query Limits

In `searchQueryBuilder.ts`, the `smart_store_search` RPC uses `result_limit: 200` but the fallback `buildBaseQuery` uses `.limit(2000)`. Align the fallback to also use 200, or make both configurable from a shared constant.

---

## Phase 3: Low Priority

### 7. Remove Legacy City Routes

Remove the 12 hardcoded city routes from `App.tsx` (lines 118-129). The dynamic `/city/:citySlug` route already handles these. If SEO redirects are needed, they can be handled in `CityPage` component itself (which already has redirect logic per the route comments).

### 8. Memoize IPGeolocationContext Value

In `src/contexts/IPGeolocationContext.tsx`, wrap the provider value in `useMemo` to prevent unnecessary re-renders of all context consumers:

```typescript
const value = useMemo(() => ({ data, loading, error }), [data, loading, error]);
```

### 9. Fix DOM Manipulation in Index.tsx

Replace `document.createElement('script')` / `document.head.appendChild()` in `Index.tsx` (lines 93-102) with the existing `SEOHead` component's `structuredData` prop or a dedicated `BreadcrumbSchema` component (which already exists at `src/components/BreadcrumbSchema.tsx`).

### 10. Bundle Map Marker Icons Locally

Move marker icon assets from CDN URLs (unpkg.com, raw.githubusercontent.com) into `public/` directory and reference them with local paths. This eliminates external CDN dependency for core map functionality.

### 11. Sanitize Map Popup HTML

In `StoreMapView.tsx`, escape store names and addresses before inserting into template literal HTML to prevent potential XSS. Use a simple escape function or leverage the already-installed `dompurify` package.

---

## Technical Summary

| # | Issue | Files Changed | Risk |
|---|-------|--------------|------|
| 1 | Console logging | ~19 files + 1 new | Low |
| 2 | Unused deps | package.json | Low |
| 3 | TypeScript any casts | 2 files | Low |
| 4 | Category mapping duplication | 1 file | Low |
| 5 | Hardcoded config values | 4 files | Low |
| 6 | Query limit mismatch | 1 file | Low |
| 7 | Legacy city routes | 1 file | Low |
| 8 | Context memoization | 1 file | Low |
| 9 | DOM manipulation | 1 file | Low |
| 10 | CDN marker icons | 1 file + assets | Low |
| 11 | Popup XSS sanitization | 1 file | Low |

Total estimated changes: ~25 files modified, 1 new utility file created. All changes are low-risk refactors with no feature behavior changes.
