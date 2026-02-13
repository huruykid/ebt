

# Enhanced Search Filters: Categories, Open Now, and Delivery

## Goal
Make the /search page filter-first so users can find the **right** EBT store for their needs -- not just any store. Categories and the "Open Now" toggle should be visible **before** searching, and two new categories (Bakery, Delivery) need to be added.

---

## What Changes

### 1. Add Missing Categories to CategoryTabs
Add **Bakery** and **Delivery** as new category tabs:
- **Bakery** (icon: bread emoji): matches `Store_Name ILIKE '%bakery%'` or `'%bake%'` -- 1,571 stores in the database
- **Delivery** (icon: truck emoji): matches stores known to offer delivery (Walmart, Instacart partners, etc.) via name patterns. This will filter for large chains that commonly offer SNAP Online delivery (Walmart, Amazon Fresh, Safeway, etc.)

Reorder tabs to match the requested priority:
1. Trending
2. Hot Food / Fast Food (rename from "Hot Meals (RMP)")  
3. Grocery Stores
4. Bakery
5. Farmer's Markets
6. Delivery
7. Corner Stores
8. Open Now (keep as separate toggle, not a tab)

### 2. Show Categories Before Search Results
Move the `CategoryTabs` component into `SearchContainer` so it appears **above the search form** or immediately below it, visible at all times -- not only after results load.

### 3. Promote "Open Now" Toggle
Move the `OpenNowFilter` toggle out of the results header and place it alongside the category tabs area so users can set it **before** searching.

### 4. Rename "Hot Meals (RMP)" to "Fast Food"
The current label "Hot Meals (RMP)" is confusing for users. Rename to "Fast Food" (or "Hot Food") to match the user's mental model. Keep the same underlying store type filters.

---

## Technical Details

### Files Modified

**`src/components/CategoryTabs.tsx`**
- Add `bakery` category: `{ id: 'bakery', name: 'Bakery', icon: 'bakery-emoji', storeTypes: [], namePatterns: ['Bakery', 'Bake', 'Bread', 'Pastry', 'Cake'] }`
- Add `delivery` category: `{ id: 'delivery', name: 'Delivery', icon: 'truck-emoji', namePatterns: ['Walmart', 'Amazon Fresh', 'Safeway', 'Kroger', 'Instacart', 'Whole Foods', 'Target'] }` -- these are SNAP Online Purchasing Program retailers
- Rename `hotmeals` display name from "Hot Meals (RMP)" to "Fast Food"
- Reorder the categories array

**`src/components/store-search/SearchContainer.tsx`**
- Import `CategoryTabs` and `OpenNowFilter`
- Render `CategoryTabs` below the search card (always visible)
- Render `OpenNowFilter` toggle next to or below category tabs
- Pass `openNowFilter` state down to `CategorySearchResults` / `SearchResults`

**`src/components/store-search/CategorySearchResults.tsx`**
- Remove the duplicate `CategoryTabs` rendering (it now lives in SearchContainer)
- Accept and pass through `openNowFilter` props

**`src/constants/searchConstants.ts`**
- Add `bakery` and `delivery` entries to `CATEGORY_RADIUS` with appropriate defaults (bakery: 15 miles, delivery: 50 miles since delivery has wider reach)

### No Database Changes Required
All filtering is done via existing `Store_Type` and `Store_Name` columns using the existing `smart_store_search` and `get_nearby_stores` RPC functions.

