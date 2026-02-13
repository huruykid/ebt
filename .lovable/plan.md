

# Fix Store Rendering Issues

## Problems Identified

1. **Store detail page crashes** due to a "Maximum update depth exceeded" error originating from the `ShareStore` dropdown component inside `StoreHeader`. This infinite render loop prevents the page from rendering.

2. **Search result cards appear broken** -- showing empty cards with only "EBT Accepted" badges and no store names or addresses. This appears to be a stale build issue, but worth verifying the components are correct.

## Root Cause

The `ShareStore` component uses a Radix `DropdownMenu` that triggers an infinite state update loop. The console logs confirm this:
```
Maximum update depth exceeded... at ShareStore → StorePhotos → StoreDetailPage
```

## Plan

### Step 1: Fix the ShareStore render loop

Update `src/components/ShareStore.tsx` to prevent the infinite re-render:
- Add `modal={false}` (already present) and wrap the dropdown in a controlled `open`/`onOpenChange` state to stop Radix from triggering repeated state updates.
- Move the `storeUrl` calculation into a `useMemo` to prevent re-computation on every render.
- Ensure `navigator.share` check is done once (not inline in JSX) to avoid conditional rendering instability.

### Step 2: Verify store detail page renders

After the ShareStore fix, confirm the `StoreDetail.tsx` page renders correctly with:
- Store name, rating, address in `StoreHeader`
- Photo hero in `StorePhotos`
- Hours, prices, reviews, and comments sections

### Step 3: Verify search result cards

Confirm the `UnifiedStoreCard` component is rendering store names and addresses correctly on the search page. The current code looks correct (`store.Store_Name`, `formatStoreAddress(store)`) -- the empty cards in the screenshot are likely from the previous stale build.

## Technical Details

**File: `src/components/ShareStore.tsx`**
- Add controlled `open` state with `useState(false)`
- Pass `open` and `onOpenChange` to `DropdownMenu` 
- Memoize `storeUrl` and `shareData` with `useMemo`
- Cache `navigator.share` availability in a constant outside the render

**File: `src/components/store-detail/StoreHeader.tsx`**
- No changes needed -- the component is clean and uses `ShareStore` correctly

**File: `src/components/store-detail/StorePhotos.tsx`**
- No changes needed -- ShareStore was removed from this component in the last refactor

