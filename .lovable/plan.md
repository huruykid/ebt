

## Add City-Specific FAQ Schema to City Pages

### Goal
Add targeted, city-localized FAQ content and structured data (FAQPage schema) to each city page, answering the exact high-impression queries from Google Search Console that currently get 0 clicks. This targets featured snippet eligibility for queries like "places that take ebt near me," "what restaurants accept ebt near me," and "ebt food near me."

### What Changes

**1. New component: `src/components/CityFAQSection.tsx`**

A city-aware FAQ section that dynamically injects the city name into each question and answer. It will:
- Accept `cityName` and `stateName` props
- Generate 5-6 FAQs targeting the exact 0-click queries from GSC data
- Render a visible accordion (important for Google to index the content)
- Include `FAQSchema` for structured data markup

Example FAQs (with city name injected):

| Target Query | FAQ Question |
|---|---|
| places that take ebt near me | "What places accept EBT in Los Angeles, CA?" |
| what restaurants accept ebt near me | "What restaurants accept EBT in Los Angeles, CA?" |
| ebt food near me | "Where can I buy food with EBT in Los Angeles, CA?" |
| ebt near me | "How do I find EBT stores near me in Los Angeles, CA?" |
| grocery stores that accept ebt | "Which grocery stores accept EBT in Los Angeles, CA?" |
| farmers market ebt | "Can I use EBT at farmers markets in Los Angeles, CA?" |

Each answer will include the city name, practical guidance, and a natural call to action ("Search above to find...").

**2. Update `src/pages/CityPage.tsx`**

- Import and render `CityFAQSection` instead of the generic `FAQSection`
- Pass `city.name` and `city.state` as props
- The generic FAQSection (which has no schema markup and no city context) will be replaced

### Why This Works

- Google favors FAQ schema for featured snippet boxes on "near me" queries
- City-localized content creates unique, non-duplicate pages (avoids thin content penalties)
- Visible accordion content matches Google's requirement that FAQ schema content be visible on page
- Directly targets the 0-click queries identified in GSC data

### Technical Details

- Reuses the existing `FAQSchema` component for JSON-LD injection
- Uses the same `Accordion` UI components as the current `FAQSection`
- Schema ID uses `#city-faq-schema` to avoid conflicts with the global `#faq-schema`
- No new dependencies required

