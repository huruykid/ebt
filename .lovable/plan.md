

# Add EBT and RMP Badges to Store Cards

## Overview

Add two small inline badges to the `UnifiedStoreCard`: a green "EBT" badge (always shown, since every store in the database accepts EBT) and an amber "RMP" badge (shown only when the store's `Incentive_Program` field contains "rmp" or "restaurant meals program").

## Changes

### 1. `src/components/UnifiedStoreCard.tsx`

Add badges to the rating/status row (line ~73, after the existing store type and open/closed indicators):

- **EBT badge**: A small green pill (`bg-emerald-100 text-emerald-700 border border-emerald-200`) displaying "EBT". Always visible.
- **RMP badge**: A small amber pill (`bg-amber-100 text-amber-700 border border-amber-200`) displaying "RMP". Only rendered when `store.Incentive_Program` matches the RMP pattern.

Use the existing `isRmpEnrolled` utility from `@/lib/core/store-utils` (already exported via `@/utils/storeUtils`) for the RMP check.

### Visual placement

```text
[Logo]  Store Name
        *4.2 (120) . Supermarket . Open . [EBT] [RMP]*
        123 Main St, City, ST              2.3 mi
```

The badges sit inline in the metadata row as small rounded pills, consistent with the existing `StoreTypeBadge` styling pattern but smaller (text-[10px], px-1.5 py-0.5).

### Files modified: 1

- `src/components/UnifiedStoreCard.tsx` -- import `isRmpEnrolled` and add two badge spans in the rating row

