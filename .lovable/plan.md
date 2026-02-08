
# Fix Back Button Navigation Plan

This plan addresses the inconsistent and unreliable back button behavior on the Store Detail page and other locations in the app.

---

## Problems Identified

| Issue | Location | Impact |
|-------|----------|--------|
| `navigate(-1)` unreliable | `StoreDetail.tsx` line 151 | Users who land directly on page or after refresh get broken navigation |
| Misleading label | "Back to Search" when user came from Favorites, City page, or Home | Confuses users |
| Inconsistent pattern | Error state uses `/search`, main page uses `navigate(-1)` | Unpredictable behavior |
| No referrer tracking | No way to know where user came from | Cannot provide contextual back navigation |

---

## Solution Overview

Implement a smart back button that:
1. Tracks where the user came from (referrer page)
2. Shows contextual label ("Back to Search", "Back to Favorites", etc.)
3. Falls back to `/search` when referrer is unknown
4. Preserves search state in URL parameters (future enhancement)

---

## Phase 1: Create Referrer Tracking Hook

### New File: `src/hooks/useNavigationReferrer.ts`

Create a hook that stores the referrer page in session storage when navigating to store details.

**Functionality:**
- When user clicks on a store card, store the current path as referrer
- On store detail page, read the referrer to determine back destination
- Clear referrer after use to prevent stale data

**Tracked Referrer Types:**
- `/search` or `/search?...` - "Back to Search"
- `/favorites` - "Back to Favorites"
- `/` (home page) - "Back to Home"
- `/city/...` - "Back to [City Name]"
- `/state/...` - "Back to [State Name]"
- Unknown/direct - "Back to Search" (default)

---

## Phase 2: Update Store Detail Page

### File: `src/pages/StoreDetail.tsx`

**Changes:**

1. Import and use the new referrer hook
2. Replace `navigate(-1)` with smart navigation:

```text
Before (line 151):
onClick={() => navigate(-1)}

After:
onClick={() => navigate(referrerPath)}
```

3. Update button label dynamically:

```text
Before:
"Back to Search"

After:
"{referrerLabel}" (e.g., "Back to Favorites", "Back to Home")
```

4. Make error state consistent with main button behavior

---

## Phase 3: Update Store Card Components

### Files to Modify:
- `src/components/UnifiedStoreCard.tsx`
- `src/components/EnhancedStoreCard.tsx`
- `src/components/home/FeaturedStores.tsx`

**Changes:**

When a store card is clicked (navigating to store detail), save the current page as the referrer:

```text
onClick={() => {
  saveReferrer(location.pathname + location.search);
  navigate(`/store/${store.id}`);
}}
```

---

## Phase 4: Add Fallback for Direct Links

### File: `src/pages/StoreDetail.tsx`

When no referrer is found (user landed directly on page):
- Default to `/search` as back destination
- Show "Back to Search" label
- Optionally show a different visual indicator that this is a fallback

---

## Implementation Details

### Session Storage Key
```text
Key: "ebt_nav_referrer"
Value: { path: "/search?zip=90210", label: "Search Results" }
```

### Referrer Label Mapping
```text
/ → "Home"
/search → "Search Results"
/favorites → "Favorites"
/city/los-angeles → "Los Angeles Stores"
/state/california → "California Stores"
/blog → "Blog"
```

---

## File Changes Summary

| Action | File | Description |
|--------|------|-------------|
| Create | `src/hooks/useNavigationReferrer.ts` | New hook for tracking page referrer |
| Update | `src/pages/StoreDetail.tsx` | Use smart back navigation instead of `navigate(-1)` |
| Update | `src/components/UnifiedStoreCard.tsx` | Save referrer before navigating to store |
| Update | `src/components/EnhancedStoreCard.tsx` | Save referrer before navigating to store |
| Update | `src/components/home/FeaturedStores.tsx` | Save referrer for nearby stores section |

---

## Future Enhancement: URL-Based Search State

For the search state persistence issue mentioned in the context, a follow-up enhancement would persist search parameters in the URL:

```text
/search?zip=90210&radius=10&openNow=true
```

This allows:
- Back button naturally preserves search state
- Shareable search URLs
- Browser history works correctly

This is noted for a future implementation as it requires changes to the search components.

---

## Testing Checklist

After implementation:
1. Navigate from Search to Store Detail then back - verify returns to search
2. Navigate from Favorites to Store Detail then back - verify returns to favorites
3. Navigate from Home nearby stores to Store Detail then back - verify returns to home
4. Open store detail directly via URL - verify back goes to /search with "Back to Search" label
5. Navigate from City page to Store Detail then back - verify returns to city page
6. Test mobile and desktop viewports
