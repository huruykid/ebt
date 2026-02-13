

# Add Map View to Store Search Results

## Overview

Add a toggle between List View and Map View on the search results page. The map shows all SNAP-accepting stores as markers on an interactive map powered by **Leaflet + OpenStreetMap** -- completely free, no API key required. Unlike Google Maps or Yelp, every pin on this map is a verified EBT-accepting location.

## User Experience

- A "List | Map" toggle appears in the search results toolbar (next to sort/radius controls)
- Map View shows store markers clustered on an OpenStreetMap base layer
- Clicking a marker shows a compact popup with store name, type, EBT/RMP badges, distance, and a "View Details" link
- The map auto-centers on the user's search location or the bounding box of results
- Switching back to List preserves all filters and sort state

## What Changes

### 1. Install Dependencies

- `leaflet` -- lightweight map library (free, OSM tiles)
- `react-leaflet` -- React bindings for Leaflet
- `@types/leaflet` -- TypeScript types

### 2. New File: `src/components/store-search/StoreMapView.tsx`

A new component that renders:
- A full-width Leaflet map with OpenStreetMap tiles
- Custom markers for each store (green pin for open, gray for closed/unknown)
- Popup on marker click with: store name, store type, EBT badge, RMP badge (if applicable), distance, and a link to the store detail page
- Auto-fits bounds to show all visible stores
- Falls back to user's search location center if no stores

### 3. Modified: `src/components/store-search/SearchResults.tsx`

- Add a List/Map toggle button group in the toolbar row (alongside sort and radius dropdowns)
- Conditionally render either the store card grid or the new `StoreMapView`
- Pass the same filtered store list and location data to both views

### 4. New File: `src/index.css` (addition)

- Import Leaflet's CSS: `@import 'leaflet/dist/leaflet.css';`
- Add a small override to fix Leaflet's default icon path issue in bundled apps

## Technical Details

- **New dependencies**: `leaflet`, `react-leaflet`, `@types/leaflet` (3 packages)
- **Files created**: 1 (`StoreMapView.tsx`)
- **Files modified**: 2 (`SearchResults.tsx`, `index.css`)
- **No API key needed** -- uses free OpenStreetMap tile server
- **Performance**: Leaflet handles hundreds of markers efficiently; for 200+ results the map will remain smooth
- **Mobile-friendly**: Leaflet supports touch/pinch-zoom natively
- **Dark mode**: OSM tiles are light-only, but the UI chrome (toggle, popups) will respect the app's theme
- **Marker icon fix**: Leaflet's default marker icons break in Vite/Webpack builds; we'll configure the icon paths explicitly using Leaflet's `Icon.Default` settings

