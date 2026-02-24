

## Fix Desktop Ranking Penalty

The desktop experience currently ranks at position 24 vs mobile at 8.6. After auditing the codebase and taking screenshots, here are the root causes and fixes:

### Problems Identified

1. **Narrow content width on desktop** -- The homepage desktop layout constrains everything to `max-w-3xl` (768px) on a 1920px screen, wasting 60% of the viewport. Google sees this as a poor desktop experience (essentially a mobile layout centered on a wide screen).

2. **Single-column store cards on desktop** -- Store results use `grid-cols-1` on all viewports. Desktop users see one narrow card per row with massive empty space on both sides.

3. **Layout Shift (CLS) from Header images** -- The `Header.tsx` component loads two logo images from an external CDN (`cdn.builder.io`) with no explicit `width`/`height` attributes, causing layout shifts as they load.

4. **Layout Shift from conditional UI elements** -- The "approximate location" prompt, search active state, and category scroll indicators render conditionally, pushing content down and causing CLS.

5. **No `font-display: swap`** -- Google Fonts loaded without `&display=swap` can block text rendering on slower desktop connections.

6. **Desktop hero section underutilizes space** -- The hero uses `max-w-2xl` (672px) for the search area, making the desktop feel cramped and unpolished.

### Changes

**1. Widen desktop content areas**

- `ExploreTrending.tsx`: Change desktop store results from `max-w-3xl` to `max-w-5xl`
- `ExploreTrending.tsx`: Change desktop hero wrapper from `max-w-2xl` to `max-w-3xl`
- Use 2-column grid for store cards on desktop (`grid-cols-1 md:grid-cols-2`)

**2. Fix CLS from Header images**

- `Header.tsx`: Add explicit `width` and `height` attributes to both logo `<img>` tags
- Add `fetchpriority="high"` to the primary logo since it's above the fold

**3. Fix CLS from conditional elements**

- `ExploreTrending.tsx`: Reserve space for the "approximate location" prompt using `min-h` so content doesn't jump when it appears/disappears
- `CategoryTabs.tsx`: Use `opacity-0` instead of conditional rendering for scroll indicators to prevent layout shifts

**4. Fix font loading**

- `index.css`: Add `&display=swap` to the Google Fonts import URL to prevent invisible text flash on desktop

**5. Optimize desktop hero**

- `HeroSearch.tsx`: Widen the desktop search input area from `max-w-md` to `max-w-lg`
- Add the "Calculator" quick action to desktop (currently mobile-only) for feature parity

### Technical Details

Files to modify:
- `src/index.css` -- Add `&display=swap` to font import
- `src/components/Header.tsx` -- Add width/height to images
- `src/components/ExploreTrending.tsx` -- Widen desktop layout, 2-col grid
- `src/components/home/HeroSearch.tsx` -- Widen search, add Calculator button
- `src/components/CategoryTabs.tsx` -- Fix CLS from scroll indicators

No new dependencies needed. All changes are CSS/layout adjustments and HTML attribute additions.

