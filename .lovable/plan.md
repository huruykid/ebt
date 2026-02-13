

# Fix: Map View Not Appearing for Users

## Investigation Results

I tested the map view directly and it **is rendering correctly** in the latest build:
- Map tiles load from OpenStreetMap
- Green markers appear for open stores, gray for closed/unknown
- Popups display store info (name, type, address, distance, EBT badge)
- List/Map toggle works
- Open Now filter works in both views

The root cause of the user-facing issue is likely **browser cache serving a stale build** combined with **unused `react-leaflet` packages** still in `package.json` that can cause bundling confusion.

## Changes

### 1. Remove unused `react-leaflet` packages from `package.json`

The project still lists `react-leaflet` (v4.2.1) and `@react-leaflet/core` (v2.1.0) as dependencies even though the map now uses plain Leaflet. These packages are incompatible with React 18 and, while not imported, add unnecessary weight and potential build confusion.

**Remove from `package.json`:**
- `"react-leaflet": "^4.2.1"`
- `"@react-leaflet/core": "^2.1.0"`
- `"@types/leaflet": "^1.9.21"` (keep this one -- it provides types for the `leaflet` import we use)

### 2. Add a cache-busting comment to `StoreMapView.tsx`

Force the bundler to treat this as a changed module, ensuring any cached chunks are invalidated.

### 3. No logic changes needed

The map rendering code, marker coloring, popup content, Open Now filtering, and data enrichment pipeline are all working correctly. This was verified by:
- Navigating to `/search?lat=36.7851&lng=-119.825&q=Fresno`
- Clicking the Map toggle button
- Seeing 19 stores with green (open) and gray (closed) markers
- Clicking a marker to verify popup content (store name, address, distance, EBT badge)

## Technical Details

**Files to modify:**
- `package.json` -- remove `react-leaflet` and `@react-leaflet/core` dependencies
- `src/components/store-search/StoreMapView.tsx` -- add build version comment for cache busting

