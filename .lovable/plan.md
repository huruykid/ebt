

# Add "Use Exact Location" Button

## What and Why

When the home page loads, stores are shown based on **approximate IP geolocation** (can be off by several miles). There's currently no way for the user to refine this to GPS-precise results without leaving the page. Adding a small, non-intrusive button lets users opt into precise location when they want better results.

## Design

- A compact inline prompt appears **above the store list** when the location source is `ip` or `fallback` (not `browser`)
- Shows something like: "Showing stores near [City] -- Use exact location" with a small location icon
- Tapping it calls `requestBrowserLocation()` (triggers the browser GPS permission prompt)
- Once GPS resolves, the button disappears since the source becomes `browser`
- On desktop, same behavior but styled as a subtle banner

## Technical Changes

### File: `src/components/ExploreTrending.tsx`

1. Destructure `source` from the `useGeolocation()` hook (it's already returned as part of `GeolocationResult`)
2. Add a small inline component (or JSX block) that renders when `source !== 'browser'` and `latitude/longitude` exist:
   - Text: "Showing approximate results -- Use exact location"
   - Button calls `requestBrowserLocation()`
3. Place it just above `<StoreListSimple>` in both mobile and desktop layouts
4. After the user grants GPS, `source` changes to `'browser'`, and the prompt auto-hides

### Summary

- 1 file modified
- ~15 lines added
- No new dependencies
