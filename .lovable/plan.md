

## Fix: City Page Breadcrumb Shows "City" Instead of State Name

### Problem
The visible breadcrumb on `/city/los-angeles` shows **Home > City > Los Angeles** instead of **Home > California > Los Angeles**. This happens because `BreadcrumbNavigation` is called without custom items, so it auto-generates breadcrumbs from the URL path segments -- turning `/city/los-angeles` into "Home > City > Los Angeles".

The correct breadcrumb data already exists in `CityPage.tsx` (line ~48, `breadcrumbItems`) but is only passed to the hidden `BreadcrumbSchema` component for structured data, not to the visible `BreadcrumbNavigation`.

### Fix

**File: `src/pages/CityPage.tsx` (line 103)**

Pass custom breadcrumb items to the visible navigation component. The formats differ between the two components (`BreadcrumbSchema` uses `{name, url}`, `BreadcrumbNavigation` uses `{label, href}`), so we need to convert:

```text
Before:  <BreadcrumbNavigation />
After:   <BreadcrumbNavigation items={[
           { label: 'Home', href: '/' },
           { label: stateName, href: `/state/${stateSlug}` },
           { label: city.name, href: `/city/${actualCitySlug}` }
         ]} />
```

This is a one-line change. The `stateSlug` and `stateName` variables are already computed earlier in the component (lines ~42-43).

### Result
- Breadcrumb will show: **Home > California > Los Angeles**
- "California" will link to `/state/california`
- Matches the structured data breadcrumb already sent to Google
- No other files need changes

