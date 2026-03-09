

## Pull-to-Refresh on Search Results

### What
Add a custom `usePullToRefresh` hook that detects touch-based pull-down gestures on mobile and triggers a data refetch, with a visual loading indicator.

### Plan

1. **Create `src/hooks/usePullToRefresh.ts`**
   - Track `touchstart`, `touchmove`, `touchend` events on a container ref
   - Only activate when scrolled to top (`scrollTop === 0`) and pulling down
   - Track pull distance, expose `isPulling`, `pullDistance`, and `isRefreshing` state
   - Call an `onRefresh` callback (async) when pull exceeds threshold (~60px)
   - Show visual feedback during pull and refresh

2. **Create `src/components/PullToRefreshIndicator.tsx`**
   - Simple spinner/arrow indicator that appears at the top of the list
   - Rotates arrow based on pull distance, shows spinner when refreshing
   - Translates down proportional to pull distance

3. **Integrate into `SearchContainer.tsx`**
   - Wrap the results area with a ref for the pull-to-refresh hook
   - Pass a `refetch` function from `useLocationBasedSearch` (need to expose the query's `refetch` from `useStoreSearchQuery` up through the hook chain)
   - Render `PullToRefreshIndicator` above the results
   - Only enable on mobile (use `useIsMobile`)

4. **Expose `refetch` from `useLocationBasedSearch`**
   - `useStoreSearchQuery` already returns a react-query result with `refetch`
   - Pass it through `useLocationBasedSearch` return value

### Technical Details
- Threshold: 60px pull distance to trigger refresh
- Uses `touch-action: pan-y` CSS to avoid conflicts
- Debounce/lock during active refresh to prevent double-triggers
- Only active on mobile viewports via `useIsMobile()`

