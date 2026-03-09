

## Add "Use my location" button to the nearby stores header

When stores are shown (from IP or ZIP), add a small location button next to the "Nearby EBT Stores" heading so users can easily refine to GPS precision.

### Change: `src/components/ExploreTrending.tsx`

Update the `<h2>Nearby EBT Stores</h2>` sections (mobile + desktop) to include a store count and a compact "Use my location" button:

```
<div className="flex items-center justify-between">
  <div>
    <h2>Nearby EBT Stores</h2>
    <p className="text-xs text-muted-foreground">
      Found {nearbyStores.length} stores near you
    </p>
  </div>
  <Button variant="outline" size="sm" onClick={requestBrowserLocation}>
    <MapPin /> Use my location
  </Button>
</div>
```

- Show the button when stores are visible (not in ZIP search mode or no-location state)
- If browser GPS is already active (`source === 'browser'`), hide the button to avoid redundancy
- Keep the `ExactLocationPrompt` banner as-is for approximate location users — both serve complementary purposes (banner = contextual info, header button = action)

