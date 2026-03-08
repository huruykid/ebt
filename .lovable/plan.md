

## Fix Duplicate DOM / Schema / Meta Tag Pollution

The audit finding is accurate. There is no visual double-rendering, but there are **significant duplicate meta tags and structured data schemas** being injected into the DOM from 4 different sources simultaneously. This is a real SEO problem -- Google may penalize or ignore duplicate structured data.

### The Duplicates Found

| Element | Source 1 | Source 2 | Source 3 |
|---------|----------|----------|----------|
| Organization schema | `index.html` lines 88-104 | `SEO.tsx` lines 97-110 | — |
| WebSite + SearchAction schema | `index.html` lines 65-85 | `SEO.tsx` lines 113-126 | `SearchEngineOptimizer.tsx` lines 59-81 |
| WebApplication schema | `index.html` lines 65-85 | `Index.tsx` lines 9-46 (via SEOHead) | — |
| FAQ schema | `SEO.tsx` lines 129-160 | `Index.tsx` line 93 (via FAQSchema) | — |
| Meta: robots, theme-color, apple-mobile-web-app-* | `index.html` | `SEO.tsx` | — |
| Meta: author, publisher, copyright | `SEO.tsx` | `SearchEngineOptimizer.tsx` | — |
| hreflang | `index.html` line 38 | `SEO.tsx` lines 163-169 | — |

### Fix Strategy

**Principle:** Static, site-wide markup stays in `index.html`. Page-specific markup stays in per-page components (SEOHead, FAQSchema, etc.). Remove all duplicates from `SEO.tsx` and `SearchEngineOptimizer.tsx`.

### File Changes

**1. `SEO.tsx`** — Remove all duplicate schemas and meta tags. Keep only:
- The skip-link for accessibility
- The `dns-prefetch` for google-analytics (not in index.html)
- Remove: Organization schema, WebSite schema, FAQ schema, all `setMeta` calls (robots, author, publisher, copyright, application-name, theme-color, twitter, mobile-web-app, geo, hreflang) — these are all already in `index.html`

**2. `SearchEngineOptimizer.tsx`** — Remove `addEATSignals` function (duplicates meta tags from index.html). Remove `addSitelinksSearchBox` (third copy of WebSite SearchAction schema). Keep only: `addPrefetchHints` and `optimizeImages`.

**3. `index.html`** — Already has all the static markup. Add missing `</head>` closing tag before `<body>` (currently missing on line 107). No other changes needed since it's already the single source of truth for static schemas.

**4. `Index.tsx`** — Remove the `structuredData` prop from SEOHead (it duplicates the WebApplication schema already in index.html). Keep the FAQSchema component (it's page-specific and the duplicate was in SEO.tsx which we're cleaning up).

