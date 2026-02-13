

# Fix: "Use Current Location" and Store Categories

## Problem 1: "Use Current Location" Does Nothing

The geolocation hook (`useGeolocation`) loads IP-based coordinates on startup, so `latitude` and `longitude` are always populated. The "Use My Location" and "Use current location" buttons check if lat/lng exist, and since they always do (from IP), the buttons never request actual browser GPS permission.

**Root cause locations:**
- `SearchContainer.tsx` line 142-156: `handleUseCurrentLocation` just re-uses existing IP coordinates
- `ExploreTrending.tsx` line 39-48: `handleCurrentLocationSearch` only calls `requestBrowserLocation()` when lat/lng are null (never happens)

**Fix:**
- In `SearchContainer.tsx`: Add `requestBrowserLocation` from `useGeolocation()` and call it inside `handleUseCurrentLocation` so clicking the button triggers actual browser GPS
- In `ExploreTrending.tsx`: Always call `requestBrowserLocation()` when the button is clicked, regardless of existing IP coordinates

---

## Problem 2: Store Categories Are Ignored

In `searchQueryBuilder.ts`, when location coordinates exist, the function enters the first `if (locationSearch)` block (line 57). If there's no search text, it calls `get_nearby_stores` with `store_types: null` (line 96-102) and returns -- completely ignoring the `activeCategory` parameter. The category-aware code at lines 209-252 is unreachable dead code.

**Fix in `searchQueryBuilder.ts`:**
- In the first `locationSearch` block (line 96-102), build a `store_types` array based on `activeCategory` (same logic currently at lines 213-242) and pass it to `get_nearby_stores` instead of `null`
- For categories that rely on `namePatterns` (bakery, delivery), pass `store_types: null` but then apply client-side name filtering in `useStoreSearchQuery.ts`

---

## Technical Details

### File 1: `src/utils/searchQueryBuilder.ts`

Add a helper function that maps `activeCategory` to store type filters:

```
function getCategoryStoreTypes(activeCategory: string): string[] | null {
  switch (activeCategory) {
    case 'grocery': return ['Supermarket', 'Grocery Store', 'Supercenter'];
    case 'convenience': return ['Convenience Store'];
    case 'hotmeals': return ['Restaurant Meals Program', 'Restaurant'];
    case 'farmersmarket': return ['Farmers Market', 'Farm Market'];
    default: return null;
  }
}
```

Update lines 96-102 to use this helper:

```
const storeTypes = getCategoryStoreTypes(activeCategory);
return supabase.rpc('get_nearby_stores', {
  user_lat: locationSearch.lat,
  user_lng: locationSearch.lng,
  radius_miles: radius,
  store_types: storeTypes,
  result_limit: 200
});
```

### File 2: `src/hooks/useStoreSearchQuery.ts`

After field mapping (around line 91), add name-pattern-based filtering for categories like bakery and delivery that don't map to database `Store_Type` values:

```
if (selectedNamePatterns.length > 0 && results.length > 0) {
  results = results.filter(store => {
    const name = (store.Store_Name || '').toLowerCase();
    const type = (store.Store_Type || '').toLowerCase();
    return selectedNamePatterns.some(p => 
      name.includes(p.toLowerCase()) || type.includes(p.toLowerCase())
    );
  });
}
```

### File 3: `src/components/store-search/SearchContainer.tsx`

Destructure `requestBrowserLocation` from `useGeolocation()` and call it inside `handleUseCurrentLocation`:

```
const { latitude, longitude, loading: geoLoading, requestBrowserLocation } = useGeolocation();

const handleUseCurrentLocation = useCallback(() => {
  // Always request browser GPS for precise location
  requestBrowserLocation();
  setLocationInput('');
  setSelectedZip('');
  clearLocationSelection();
  // ...rest of existing logic
}, [...]);
```

### File 4: `src/components/ExploreTrending.tsx`

Update `handleCurrentLocationSearch` to always request browser location:

```
const handleCurrentLocationSearch = () => {
  requestBrowserLocation();  // Always request GPS
  handleClearSearch();
  setTimeout(() => {
    resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 100);
};
```

---

## Scope

- 4 files modified
- No database changes
- No new dependencies

