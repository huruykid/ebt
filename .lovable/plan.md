

## Search Console Issues — Diagnosis and Fix Plan

### The Data at a Glance

Your impressions crashed from ~826/day (Feb 4) to single digits by mid-February. The "Not indexed" count keeps climbing (175 → 1,009). Here's why:

---

### Root Cause Analysis

**CRITICAL BUG: `noindex` is never reset during SPA navigation**

In `SEOHead.tsx` (line 65), when `noindex` is true, the robots meta tag is set to `noindex, nofollow`. But when navigating to a normal page, the tag is **never reset back to `index, follow`**. In a single-page app, the meta tag persists across route changes. This means: if a user (or Googlebot) visits a dead store page → then navigates to the homepage, the homepage **inherits the noindex tag**. This alone could explain the impressions collapse.

**439 "Duplicate without user-selected canonical"**

The `/store/:id/*` wildcard route (App.tsx line 101) means URLs like `/store/abc/extra/path` all render the same page as `/store/abc`. Google sees these as duplicates. Additionally, `index.html` has a hardcoded `<link rel="canonical" href="https://ebtfinder.org/">` that competes with the JS-injected canonical on every page.

**13 Soft 404s**

The `NotFound` page does NOT pass `noindex={true}` to `SEOHead`, so Google may index 404 pages. It also sets a canonical to `/404` which is confusing.

**325 "Crawled - currently not indexed"**

Store detail pages are behind JS rendering with no SSR. Combined with the noindex leak, Google is deprioritizing the entire domain.

---

### Implementation Plan

#### 1. Fix the noindex leak in SEOHead (CRITICAL)

**File:** `src/components/SEOHead.tsx`

Add an `else` branch: when `noindex` is false, explicitly reset the robots meta tag to `index, follow`. Also add cleanup logic in the useEffect return to reset robots when the component unmounts (SPA navigation).

#### 2. Remove the wildcard store route

**File:** `src/App.tsx`

Delete line 101: `<Route path="/store/:id/*" element={<StoreDetail />} />`. Keep only the exact `/store/:id` route. Any `/store/id/extra` URLs will correctly hit the 404 page instead of creating duplicates.

#### 3. Fix the NotFound page

**File:** `src/pages/NotFound.tsx`

- Add `noindex={true}` to the SEOHead component
- Remove the `canonicalUrl="/404"` prop (noindex pages shouldn't declare canonicals)

#### 4. Remove the competing static canonical from index.html

**File:** `index.html`

Remove `<link rel="canonical" href="https://ebtfinder.org/" />` (line 40). The SEOHead component already manages canonical tags dynamically per page. Having a static one in index.html means Google sees two conflicting canonical signals on every page.

#### 5. Add useEffect cleanup to SEOHead

**File:** `src/components/SEOHead.tsx`

Add a cleanup function in the useEffect that resets the robots meta tag when the component unmounts, preventing stale `noindex` from leaking to the next route.

---

### Expected Impact

| Fix | Resolves | Pages affected |
|-----|----------|----------------|
| noindex reset | Impressions crash, crawled-not-indexed | All pages |
| Remove wildcard route | 439 duplicates | Store pages |
| NotFound noindex | Soft 404s | 13+ pages |
| Remove static canonical | Duplicate canonicals | All pages |

After deploying, request re-indexing of the homepage and top city pages in Search Console.

