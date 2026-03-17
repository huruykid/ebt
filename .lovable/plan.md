

## Plan: SEO Optimization for "Huruy Kidanemariam"

### 1. Footer Attribution
**File:** `src/components/SEOFooter.tsx`
Add a line below the copyright text: "Designed and Built by Huruy Kidanemariam" with subtle styling.

### 2. About the Founder Page
**New file:** `src/pages/AboutFounder.tsx`
- Route: `/about-huruy-kidanemariam`
- SEOHead title: "About Huruy Kidanemariam — Founder of EBT Finder"
- H1: "Huruy Kidanemariam"
- Content: brief founder bio, mission statement, link back to homepage
- Person schema markup (JSON-LD) embedded on the page

**File:** `src/App.tsx`
- Lazy-load the new page and add a route for `/about-huruy-kidanemariam`

**File:** `src/components/SEOFooter.tsx`
- Add a link to the founder page in the "About EBT Finder" section

### 3. Organization Schema on Homepage
**File:** `src/pages/Index.tsx`
- Add a `structuredData` prop to SEOHead with a JSON-LD `Organization` object that includes `founder: { "@type": "Person", "name": "Huruy Kidanemariam" }`

### 4. Blog Author Bylines
**File:** `src/pages/BlogPost.tsx`
- Replace `{post.author}` (line 159) with a hardcoded "Huruy Kidanemariam" display, or fallback: `post.author || "Huruy Kidanemariam"`

**File:** `src/components/blog/ArticleSchema.tsx`
- Ensure the author field in the Article schema uses "Huruy Kidanemariam"

### Technical Notes
- All changes use existing patterns (SEOHead, JSON-LD scripts, React Router lazy loading)
- The founder page will include both Person and BreadcrumbList schema markup
- No database changes required

