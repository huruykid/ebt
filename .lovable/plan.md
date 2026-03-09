

## Location Persistence and "Use My Location" Placement

### The Problem

1. **Location resets on every refresh**: The `useGeolocation` hook stores GPS coordinates only in React state (`useState`). On refresh, state resets to the initial IP-based fallback. There is no persistence of the user's explicit GPS permission grant.

2. **"Use my location" button placement**: Currently it sits in the hero section below the ZIP search bar alongside "Balance" and "Calculator" buttons. It competes for attention and disappears once a search is active (`!isSearchActive` guard). It could be more discoverable.

### Plan

#### 1. Persist browser GPS coordinates in `sessionStorage`

In `src/hooks/useGeolocation.ts`:
- After a successful `requestBrowserLocation` call, save `{ latitude, longitude }` to `sessionStorage` under a key like `ebt-browser-location`.
- On hook initialization, check `sessionStorage` first. If valid coordinates exist, use them immediately as `createBrowserLocationResult` instead of waiting for IP geolocation — set `browserRequestedRef.current = true` so IP data doesn't overwrite.
- Use `sessionStorage` (not `localStorage`) so it clears when the browser tab closes, which is appropriate for location data privacy.

#### 2. Move "Use my location" into the search bar area

In `src/components/ZipCodeSearch.tsx` and `src/components/home/HeroSearch.tsx`:
- Add a small location icon button **inside** the ZIP search input (left side or as a secondary action) so it's always visible and integrated with the search flow.
- Alternatively, place it as a subtle link directly below the search bar (always visible, not gated by `!isSearchActive`).
- Remove it from the hero action buttons row on mobile. Keep "Balance" and "Calculator" as secondary actions.
- On desktop, integrate it as an "or use current location" text link below the search bar.

The approach: Add an `onLocationRequest` prop to `ZipCodeSearch`, then render a small `Navigation` icon button on the right side of the input (before the Search button), or a text link below. This keeps the location action contextually tied to "where do you want to search?"

#### 3. Files to modify

- **`src/hooks/useGeolocation.ts`** — Add sessionStorage read on init, write after GPS success
- **`src/components/ZipCodeSearch.tsx`** — Add optional location button integrated into the search UI
- **`src/components/home/HeroSearch.tsx`** — Remove standalone "Use my location" button from the action row, pass location handler to ZipCodeSearch instead
- **`src/components/ExploreTrending.tsx`** — Pass `requestBrowserLocation` through to ZipCodeSearch via HeroSearch

### Technical Details

- `sessionStorage` key: `ebt-browser-location`
- Stored format: `JSON.stringify({ latitude, longitude, timestamp })`
- Expiry: Optional 30-minute staleness check on the timestamp to re-prompt if the session is very old
- The `ExactLocationPrompt` banner in ExploreTrending already handles the "approximate vs exact" nudge and will continue to work — it just won't appear as often since GPS coords persist

