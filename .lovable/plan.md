

# Fix Category Indicator Dots and Improve Mobile UX

## Problem

The scroll indicator dots below the category tabs are broken. The logic tries to match `activeCategory` against each index but produces incorrect results -- only the first dot or the active category's dot lights up, and it doesn't reflect scroll position at all.

## Recommended Approach: Remove Dots, Auto-Scroll Active Tab Into View

Scroll indicator dots are the wrong pattern here. They suggest pagination (like a carousel), but this is a horizontally scrollable tab bar. The best UX (used by Airbnb, DoorDash, etc.) is:

1. **Remove the dots entirely** -- they add visual clutter and don't help navigation
2. **Auto-scroll the active tab into view** when a category is selected, so the user always sees their selection centered
3. **Keep the fade gradients and chevron arrows** as scroll affordances

This is simpler, more intuitive, and eliminates the broken dot state.

## Technical Changes

### File: `src/components/CategoryTabs.tsx`

1. **Delete the dots section** (the "Small scroll indicator dots for mobile" block, approximately lines 214-227)

2. **Add auto-scroll on category change**: When `activeCategory` changes, find the active button element and call `scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })` on it. This can be done with a `useEffect` watching `activeCategory`, using a data attribute like `data-category-id` on each button to locate it.

3. **Add refs**: Add `data-category-id={category.id}` to each category button element, then in the effect, query the scroll container for the matching element and scroll it into view.

### Summary

- 1 file modified (`CategoryTabs.tsx`)
- Remove ~15 lines (dots), add ~10 lines (auto-scroll effect)
- No new dependencies
