

## Comprehensive Performance, Accessibility & Best Practices Overhaul

This is a large set of changes across 9 areas. Here is the implementation plan organized by priority.

---

### Prompt 1: Fix og-image.png preload (quick win)

**Problem:** `index.html` line 92 has `<link rel="preload" href="/og-image.png" as="image" />` which forces the browser to download the 860KB image on every page load. The og-image is only needed by social crawlers reading `<meta>` tags -- never by the browser.

**Fix:**
- **`index.html`**: Remove line 92 (`<link rel="preload" href="/og-image.png" as="image" />`). The `<meta property="og:image">` tags remain -- those are only read by crawlers, not downloaded by browsers.

*Note: Image compression to WebP and CDN cache headers cannot be configured from application code on Lovable's hosting. The preload removal alone eliminates the 860KB download for real users.*

---

### Prompt 2: Fix render-blocking CSS & self-host Inter font

**Problems:**
1. `src/index.css` line 1 has `@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap")` which is render-blocking (adds ~450ms).
2. `SearchEngineOptimizer.tsx` references `/fonts/inter-var.woff2` which returns 404 (the directory doesn't exist).
3. `index.html` has preconnects to `fonts.googleapis.com` and `fonts.gstatic.com` that would become unnecessary.

**Fix:**
- **`src/index.css`**: Remove the Google Fonts `@import` on line 1. Add `@font-face` declarations for Inter using the system font stack as fallback with `font-display: swap`. Use the Google Fonts CDN URL directly in the `@font-face src` (this avoids the render-blocking stylesheet while still using Google's CDN for the actual woff2 file -- a known optimization pattern).
- **`src/components/SearchEngineOptimizer.tsx`**: Remove the `optimizeCoreWebVitals` function entirely (lines 58-89). It tries to preload a nonexistent font file and adds redundant preconnects already in `index.html` / `SEO.tsx`.
- **`index.html`**: Remove preconnects for `fonts.googleapis.com` and `fonts.gstatic.com` (lines 25-26) since we'll reference the font file directly in CSS. Remove the broken `<link rel="preload" href="/src/index.css" as="style">` on line 31 (Vite transforms CSS paths at build time, so this preload targets a dev-only path).

---

### Prompt 3: Fix CLS (0.429 -> target < 0.1)

**Problems:**
1. `SnapTipsSection` (the "Maximize Your SNAP Benefits" card) has no minimum height, causing a 0.341 layout shift when it renders.
2. Bottom navigation wrapper in `App.tsx` lacks reserved space.
3. Store cards grid has no skeleton placeholder.

**Fix:**
- **`src/components/home/SnapTipsSection.tsx`**: Add `min-h-[420px] md:min-h-[350px]` to the outer `<section>` element to reserve space.
- **`src/App.tsx`**: The main content area already has `pb-28 md:pb-0` (line 93) which reserves bottom nav space. Verify the bottom nav wrapper height matches. The bottom nav div (line 131) has extra padding. Ensure the `pb-28` is sufficient by changing to `pb-32` to account for the safe-area padding.
- **`src/components/ExploreTrending.tsx`**: Add a skeleton placeholder for the store cards grid while `nearbyLoading` is true -- use a fixed-height container (`min-h-[400px]`) around the loading state.

---

### Prompt 4: Defer AdSense & Google Tag Manager

**Problems:**
1. `index.html` line 65: AdSense `<script async>` loads immediately (~265KB).
2. `GoogleAnalytics.tsx` appends GTM script immediately on mount.

**Fix:**
- **`index.html`**: Remove the AdSense script tag entirely (lines 64-66). It will be loaded dynamically instead.
- **`src/components/GoogleAnalytics.tsx`**: Wrap both the GTM and AdSense script loading in a deferred loader that waits for either `requestIdleCallback` or a 3-second timeout (whichever comes first). Load AdSense here too, since it's the centralized script-loading component.

---

### Prompt 5: Code-split & reduce unused JS

**Current state:** Routes are already lazy-loaded via `React.lazy()` in `App.tsx`. Supabase is already in its own chunk via `vite.config.ts` `manualChunks`. The main remaining opportunity is ensuring the `icons` chunk is tree-shaken.

**Fix:**
- **`vite.config.ts`**: Remove `icons: ['lucide-react']` from `manualChunks`. Lucide-react already tree-shakes individual icons, but forcing it into one chunk defeats that. Let Vite's default chunking handle it per-route.
- No other changes needed -- the existing lazy-loading and chunking strategy is already good.

---

### Prompt 6: Reduce unused CSS

**Current state:** Tailwind config `content` array (lines 5-10 in `tailwind.config.ts`) already points to `./src/**/*.{ts,tsx}`. The unused CSS is likely from component styles loaded globally that are only used on specific routes.

**Fix:** No code changes needed. Tailwind's purge is already correctly configured. The 82% unused CSS reported by Lighthouse is measured against the *home page* -- those classes are used on other routes. CSS code-splitting per route is not supported by Vite's CSS pipeline without significant architectural changes. The 16.5KB total CSS size is already small.

---

### Prompt 7: Fix Accessibility

**7a. ARIA roles on CategoryTabs:**
- **`src/components/CategoryTabs.tsx`**: Change `role="button"` and `aria-pressed` (line 196-197) to `role="tab"` and `aria-selected={isActive}`. The parent `<nav>` already has `role="tablist"`.

**7b. Viewport meta tag:**
- **`index.html`**: Change line 7 from `width=device-width, initial-scale=1.0, viewport-fit=cover, user-scalable=no` to `width=device-width, initial-scale=1.0, viewport-fit=cover`. Remove `user-scalable=no`.

**7c. Color contrast (text-primary on light bg):**
- **`src/index.css`**: Darken `--primary` from `217 91% 60%` to `217 91% 45%` for better contrast ratio against white backgrounds. This is the blue used for links.

**7d. Heading hierarchy (add h2 before store cards):**
- **`src/components/ExploreTrending.tsx`**: Add an `<h2>` heading like "Nearby EBT Stores" above the store cards grid in both mobile and desktop layouts.

**7e. Skip link target:**
- **`src/App.tsx`**: Add `id="main-content"` to the main content `<div>` (line 93).

---

### Prompt 8: Fix 404 font error & add CSP

**8a. Font 404:**
- Already handled in Prompt 2 (removing the `/fonts/inter-var.woff2` preload reference from `SearchEngineOptimizer.tsx`).

**8b. Content Security Policy:**
- **`index.html`**: Add a `<meta http-equiv="Content-Security-Policy">` tag with a policy allowing self, Google Ads, GTM, GA, Supabase, and inline styles/scripts.

---

### Prompt 9: Clean up unused preconnects

- **`index.html`**: Remove `<link rel="preconnect" href="https://maps.googleapis.com">` (line 28) -- maps are lazy-loaded.
- **`index.html`**: Keep Supabase preconnect (line 27) -- it's needed for initial data fetch.
- **`src/components/SEO.tsx`**: Remove the `addResourceHint` calls for `fonts.googleapis.com` and `fonts.gstatic.com` (lines 72-73) since we're self-hosting the font reference in CSS.
- **`src/components/SearchEngineOptimizer.tsx`**: The `optimizeCoreWebVitals` function that adds preconnects for `fonts.googleapis.com`, `fonts.gstatic.com`, and `www.googletagmanager.com` is removed entirely (covered in Prompt 2).

---

### Summary of All File Changes

| File | Changes |
|------|---------|
| `index.html` | Remove og-image preload, remove Google Fonts preconnects, remove maps preconnect, remove broken CSS preload, remove AdSense script, remove `user-scalable=no`, add CSP meta tag |
| `src/index.css` | Replace Google Fonts `@import` with inline `@font-face` declaration; darken `--primary` for contrast |
| `src/components/SearchEngineOptimizer.tsx` | Remove `optimizeCoreWebVitals` function entirely |
| `src/components/GoogleAnalytics.tsx` | Defer GTM loading with `requestIdleCallback`/3s timeout; add deferred AdSense loading |
| `src/components/home/SnapTipsSection.tsx` | Add `min-h` to prevent CLS |
| `src/components/ExploreTrending.tsx` | Add `<h2>` heading above store cards; add min-height to loading containers |
| `src/components/CategoryTabs.tsx` | Fix ARIA: `role="tab"` + `aria-selected` |
| `src/App.tsx` | Add `id="main-content"` to content div; adjust bottom padding |
| `src/components/SEO.tsx` | Remove redundant font preconnects |
| `vite.config.ts` | Remove `icons` from `manualChunks` |

