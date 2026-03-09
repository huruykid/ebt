

## Fix Soft 404 and Not Found 404 issues from Search Console

### Problem Analysis

**Soft 404 (14 pages)** — Three categories:

1. **Legacy city routes** (`/columbus`, `/fresno`, `/san-francisco`, `/austin`, `/jacksonville`, `/fort-worth`): These cities exist in `cityData` and `<Navigate>` redirects them client-side to `/city/...`. But Googlebot sees the initial empty SPA shell before the JS redirect fires, classifying it as a soft 404.

2. **`/index.html`**: Direct access to the HTML file — Google crawls it as a separate URL from `/`, sees duplicate thin content.

3. **`/chicago-ebt`**: Not in `cityData` (the slug is `chicago`), so it falls through to the not-found page. Same for two-segment store paths like `/store/175-clinton-llc/metro-acres-market` which don't match `/store/:id`.

**Not found 404 (12 pages)** — Store slugs with periods (`/store/mr.-carrot`, `/store/c.t.-seafood-marts-corp`, etc.): These match the `/store/:id` route, but the stores don't exist in the database. The page returns a 200 with a minimal "Store Not Found" message — no SEOHead, no proper 404 signaling.

### Plan

#### 1. Fix store not-found pages (StoreDetail.tsx)
When a store isn't found, add `<SEOHead>` with a proper 404 title and a `noindex` meta tag so Google stops indexing these dead pages. Also add a `<meta name="robots" content="noindex">` tag.

#### 2. Add catch-all route for two-segment store paths (App.tsx)
Add `/store/:id/*` route pointing to `StoreDetail` so paths like `/store/175-clinton-llc/metro-acres-market` are caught and handled (the query will fail gracefully, showing the not-found state from fix #1).

#### 3. Add `/index.html` redirect (App.tsx)
Add a route for `/index.html` that redirects to `/` with `<Navigate to="/" replace />`.

#### 4. Add `chicago-ebt` alias to cityData (cityData.ts)
Add a `'chicago-ebt'` entry that aliases to the existing Chicago data, so the legacy URL resolves and redirects properly to `/city/chicago-ebt` (or better, redirect it to `/city/chicago`).

#### 5. Improve legacy city redirect SEO signal
The current client-side `<Navigate replace>` doesn't produce a server-side 301. While we can't control server headers from a SPA, we can add a `<meta http-equiv="refresh" content="0; url=/city/slug">` as a fallback signal for crawlers that don't execute JS. This will be added in `CityPage.tsx` before the `<Navigate>` return.

### Files to change
- `src/pages/StoreDetail.tsx` — Add SEOHead + noindex meta to not-found state
- `src/App.tsx` — Add `/index.html` redirect route and `/store/:id/*` catch-all
- `src/constants/cityData.ts` — Add `chicago-ebt` → Chicago alias
- `src/pages/CityPage.tsx` — Add meta refresh fallback for legacy redirects

