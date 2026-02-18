
# Fix Bounce Rate: Two-Pronged Attack

## Diagnosis Summary

The analytics show two distinct problems:

**Problem 1 (Bot traffic — ~60% of all bounces):** Chinese bot traffic (749 CN visits vs 461 US visits) hits the page and immediately bounces. The geo-block overlay fires client-side after the page loads, so the bounce is already counted. These sessions average 3–18 seconds and drag the overall bounce rate to 95%+.

**Problem 2 (US user friction — real bounce rate ~40–55%):** US visitors land on a blank homepage with nothing pre-loaded. They see a search box and a "No location prompt" with zero content until they interact. No immediate value = bounce.

## Solution

### Part 1 — Pre-load content on the homepage so US users see value immediately

Currently, non-logged-in desktop users with no location see:
- A search bar
- "Enable location or search by ZIP code" with a blank area below

The fix: Show a **"Popular Cities"** or **"Featured Stores"** grid below the hero immediately on page load, before the user does anything. This gives them something to engage with.

Changes to `src/components/ExploreTrending.tsx`:
- The `NoLocationPrompt` renders when `!latitude && !longitude`. Replace this with a two-column layout: the `NoLocationPrompt` on top + a **pre-loaded featured stores section** below it (fetched without any location).
- Add a new query using `supabase` to fetch 6–12 "featured" stores (e.g., well-known national chains: Walmart, Kroger, Aldi) sorted by store count, or the `PopularCities` component which already exists at `src/components/home/PopularCities.tsx`.

Changes to `src/components/home/HeroSearch.tsx` (desktop):
- Reduce `py-16` to `py-10` on desktop so more content is visible above the fold on shorter screens.

### Part 2 — Add a "popular near you" pre-load using IP-based city

The app already has `useIPGeolocation` which detects the user's approximate city from their IP. This is already cached. When no GPS/ZIP is active, use the IP-detected city to silently pre-load nearby stores without prompting the user — so they immediately see relevant content.

Changes to `src/components/ExploreTrending.tsx`:
- Import `useIPGeolocation` 
- When `!latitude && !longitude`, check if IP geolocation has a `lat`/`lng` (it returns coordinates). Use those to silently fetch nearby stores with a note "Showing stores near {city} — enter your ZIP for precise results"
- This converts the dead "No location" state into an immediately useful page.

### Part 3 — Show the Popular Cities component when no location/search is active

`src/components/home/PopularCities.tsx` already exists but is never shown on the homepage. Render it in the no-location state on both mobile and desktop as a fallback engagement layer.

## Files to Modify

1. **`src/components/ExploreTrending.tsx`**
   - Import `useIPGeolocation`
   - Add IP-based approximate location as fallback coordinates when GPS/ZIP not active
   - Replace blank `NoLocationPrompt`-only state with `NoLocationPrompt` + `PopularCities` below it
   - Reduce desktop hero vertical padding (pass `compact` prop or adjust directly)

2. **`src/components/home/HeroSearch.tsx`**
   - Desktop: change `py-16` → `py-10` to reduce above-fold dead space

3. **`src/components/home/PopularCities.tsx`** (read-only check first to confirm it's self-contained)
   - No changes needed — just wire it into ExploreTrending

## Expected Impact

- Users with no GPS/ZIP see **popular cities grid** immediately instead of a blank prompt → more scrolling, more clicks → lower bounce rate
- Users whose IP resolves to a US city see **pre-loaded nearby stores** automatically → immediate value
- Reducing hero padding means **more content visible above fold** on 768–900px height desktops
- Bot/CN traffic bounce rate cannot be fixed client-side without server-side geo-blocking (that's a Cloudflare/CDN-level fix), but these changes will improve the real US user bounce rate which is the metric that matters for conversions
