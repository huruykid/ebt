

## Improve Google Search Performance -- Implementation Plan

This plan covers 5 areas: navigation prefetching, internal linking depth, content freshness signals, map lazy-loading on scroll, and `last-modified` headers.

---

### 1. Prefetch Hints for Likely Next Navigations

**File: `src/components/SearchEngineOptimizer.tsx`**

Add `<link rel="prefetch">` hints for the most likely next pages based on the current route:
- On `/` (home): prefetch `/search`, `/blog`, `/benefits-calculator`
- On `/city/*`: prefetch `/search`
- On `/state/*`: prefetch `/search`
- On `/search`: prefetch `/` (home)

This uses `document.head.appendChild` inside the existing `useEffect`, matching the current pattern.

---

### 2. Internal Linking: Store Detail -> City & State Pages

**File: `src/components/store-detail/StoreHeader.tsx`**

After the address line, add contextual links:
- Link the city name to `/city/{city-slug}` (if the city exists in `cityData`)
- Link the state name to `/state/{state-slug}` (using `stateData`)

This distributes link equity from the 264K+ store pages to the city and state landing pages.

**File: `src/pages/CityPage.tsx`**

Add a link to the parent state page in the breadcrumb and hero section. Currently the breadcrumb is `Home > City Name`. Change to `Home > State Name > City Name` with the state linking to `/state/{state-slug}`.

---

### 3. Content Freshness Signals via `last-modified` Meta Tag

**File: `src/components/SearchEngineOptimizer.tsx`**

The current `addLastModified` sets `new Date().toISOString()` every render -- this is meaningless to crawlers. Instead:
- Remove the dynamic `last-modified` meta (it changes every page load, which is noise)
- For blog posts, the `BlogPost.tsx` page already has `updated_at` from the database; add a `last-modified` meta tag there using the actual post date

**File: `src/pages/BlogPost.tsx`**

After fetching the blog post, set a `<meta name="last-modified">` tag with the post's `updated_at` value, giving Google a real freshness signal.

---

### 4. Lazy-Load Map on Scroll (Intersection Observer)

**File: `src/components/store-search/SearchResults.tsx` (or wherever StoreMapView is toggled)**

StoreMapView is already behind `React.lazy()` and only renders when the user toggles "Map view". This is already effectively lazy-loaded. No further changes needed here -- the map JS and CSS only load on demand.

For the `StoreMap.tsx` component on the store detail page (which doesn't use Leaflet -- it's a static card with directions), no changes needed either.

**No action required** -- maps are already lazy.

---

### 5. Blog Publishing Consistency Check

The blog scheduler (`snap-blog-scheduler`) runs via `pg_cron` daily at 8 AM UTC. The budget is capped at `$0.15/week`. This is already set up.

**Recommendation (no code change):** Verify via Supabase dashboard that the cron job is active and posts are being generated. This is an operational check, not a code change.

---

### Summary of File Changes

| File | Change |
|------|--------|
| `src/components/SearchEngineOptimizer.tsx` | Add route-based `<link rel="prefetch">` hints; remove misleading `last-modified` meta |
| `src/components/store-detail/StoreHeader.tsx` | Add city/state internal links below the address |
| `src/pages/CityPage.tsx` | Add state link to breadcrumb (Home > State > City) |
| `src/pages/BlogPost.tsx` | Add real `last-modified` meta tag from post's `updated_at` |

### Technical Details

**Prefetch implementation:**
```typescript
const addPrefetchHints = () => {
  const routePrefetchMap: Record<string, string[]> = {
    '/': ['/search', '/blog', '/benefits-calculator'],
    '/search': ['/'],
  };

  // Clean up old prefetch links
  document.querySelectorAll('link[data-prefetch]').forEach(el => el.remove());

  const hints = routePrefetchMap[location.pathname] || [];
  // Also prefetch /search for any /city/* or /state/* page
  if (location.pathname.startsWith('/city/') || location.pathname.startsWith('/state/')) {
    hints.push('/search');
  }

  hints.forEach(href => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = href;
    link.setAttribute('data-prefetch', 'true');
    document.head.appendChild(link);
  });
};
```

**Internal linking in StoreHeader:**
```typescript
import { Link } from 'react-router-dom';
import { cityData } from '@/constants/cityData';
import { stateData } from '@/constants/stateData';

// Inside the address section, convert city/state text to links
const citySlug = store.City?.toLowerCase().replace(/\s+/g, '-');
const stateSlug = Object.keys(stateData).find(
  k => stateData[k].abbr === store.State
);
```

**CityPage breadcrumb enhancement:**
```typescript
// Find the state slug from city's state abbreviation
const stateSlug = Object.keys(stateData).find(
  k => stateData[k].abbr === city.state
);
const stateName = stateSlug ? stateData[stateSlug].name : city.state;

const breadcrumbItems = [
  { name: 'Home', url: '/' },
  { name: stateName, url: `/state/${stateSlug}` },
  { name: city.name, url: `/city/${actualCitySlug}` }
];
```

