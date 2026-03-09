

## Cleanup: Remove Redundant Location Buttons

### Issues Found

1. **`ExploreTrending.tsx`** passes `onRequestLocation={requestBrowserLocation}` to `HeroSearch`, but `HeroSearch` never uses that prop (it's not destructured). Dead prop.

2. **`NoLocationPrompt`** in `ExploreTrending.tsx` (lines 132-144) still renders a standalone "Use My Location" button. This is redundant now that the location icon is integrated into the `ZipCodeSearch` input. Users with no location see both the search bar's navigation icon AND a big standalone button below.

3. The `ExactLocationPrompt` banner (lines 115-130) is fine — it serves as a contextual nudge for approximate-location users and should stay.

### Changes

1. **`src/components/ExploreTrending.tsx`**
   - Remove `onRequestLocation` prop from both `HeroSearch` calls (mobile + desktop)
   - Update `NoLocationPrompt`: remove the standalone "Use My Location" button. Replace the prompt text to direct users toward the search bar (e.g., "Search by ZIP code or tap the location icon above"). Keep `PopularCities` below it.

2. **No other file changes needed** — `HeroSearch` already doesn't use `onRequestLocation`, and `ZipCodeSearch` already has the integrated location button.

