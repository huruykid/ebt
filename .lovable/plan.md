

# Fix: Stores Not Rendering (Field Name Mismatch)

## Root Cause

The `get_nearby_stores` database RPC returns **lowercase** field names:
```
store_name, store_street_address, city, state, zip_code, store_type, latitude, longitude, distance_miles
```

But `UnifiedStoreCard` and `formatStoreAddress` expect **Pascal case** field names:
```
Store_Name, Store_Street_Address, City, State, Zip_Code, Store_Type, Latitude, Longitude
```

In `useStoreSearchQuery.ts`, the location-based search path (lines 67-73) just spreads the raw RPC result without mapping fields to the expected format. The non-location path (lines 94-123) correctly maps lowercase to Pascal case, but that code path is skipped when location data is present.

This means every location-based search produces store objects where `Store_Name`, `City`, `Store_Street_Address`, etc. are all `undefined` -- resulting in blank cards.

## Fix

**File: `src/hooks/useStoreSearchQuery.ts` (lines 67-73)**

Add the same field mapping that already exists in the non-location path. Convert the RPC's lowercase field names to the Pascal case format that all UI components expect:

```
store_name       -> Store_Name
store_street_address -> Store_Street_Address
city             -> City
state            -> State
zip_code         -> Zip_Code
store_type       -> Store_Type
latitude         -> Latitude
longitude        -> Longitude
distance_miles   -> distance
```

The mapping will also preserve any additional fields from the spread (like `google_rating`, `google_opening_hours`, etc.) since those already use lowercase and are accessed as lowercase in the card component.

## Why This Wasn't Caught Earlier

- The e2e test in the preview used the same code, but the preview build may have been stale or caching masked the issue.
- The non-location search path had correct mapping, so searches without geolocation worked fine.
- The published site always does location-based search (via IP geolocation), which hits the broken path.

## Scope

- **1 file changed**: `src/hooks/useStoreSearchQuery.ts`
- **No database changes needed**
- **No new dependencies**

