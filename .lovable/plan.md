

# Fix Generic "Loading stores..." Message Across All Loading States

## Problem
Every `<LoadingSpinner />` usage defaults to "Loading stores..." even when loading blogs, reviews, favorites, or lazy-loaded pages.

## Solution
Pass contextually appropriate `message` props to each `<LoadingSpinner />` instance.

## Changes

### 1. `src/App.tsx` (line 58) -- PageLoader for lazy-loaded routes
Change to: `<LoadingSpinner message="Loading..." />`

### 2. `src/components/profile/UserReviews.tsx` (line 106)
Change to: `<LoadingSpinner message="Loading reviews..." />`

### 3. `src/components/reviews/ReviewList.tsx` (line 41)
Change to: `<LoadingSpinner message="Loading reviews..." />`

### 4. `src/pages/Favorites.tsx` (line 27)
Change to: `<LoadingSpinner message="Loading favorites..." />`

### 5. `src/components/store-search/SmartSearchResults.tsx` (line 35)
Keep as-is (this one actually loads stores).

### 6. `src/components/store-search/SearchResults.tsx`
Keep as-is (loads stores).

### 7. `src/components/ExploreTrending.tsx` (lines 164, 169, 230, 235)
Keep as-is (loads stores).

### 8. `src/pages/StoreDetail.tsx` (line 58)
Change to: `<LoadingSpinner message="Loading store details..." />`

## Summary
4 files modified, ~1 line each. No structural changes.
