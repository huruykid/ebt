
# User-Friendly Experience Improvements Plan

This plan focuses on making the EBT Finder site more intuitive and engaging by hiding missing data gracefully, adding quick action buttons, showing data quality indicators, and improving first-time user experience.

---

## Overview

Based on the current codebase analysis:
- Only ~10% of stores have complete Google Places data (hours, phone, photos)
- Community features (reviews, price reports) have minimal usage
- Store cards show "not available" placeholders that create visual noise
- No onboarding exists for new users to understand available features

This plan addresses these issues through 5 focused improvements.

---

## Phase 1: Clean Up Store Cards (Quick Wins)

### 1.1 Hide Empty Data Instead of "Not Available"

**Current Problem:**  
`StoreContactInfo.tsx` always shows phone and hours rows, displaying "Phone not available" and "Hours not available" text that clutters the UI.

**Solution:**  
Only render rows when data exists. Replace missing data prompts with subtle contribution CTAs.

**Files to Modify:**
- `src/components/store/StoreContactInfo.tsx`

**Changes:**
```text
Before:
- Always shows: Phone icon + "Phone not available"
- Always shows: Clock icon + "Hours not available"

After:
- Only show phone row if phone exists
- Only show hours row if hours data exists
- Add optional "Help improve this listing" link at bottom
```

### 1.2 Add Data Completeness Indicator

**New Component:** `DataQualityBadge`

Show users which stores have verified/complete information at a glance.

**Files to Create:**
- `src/components/store/DataQualityBadge.tsx`

**Logic:**
```text
Calculate completeness score:
- Has Google rating: +25%
- Has phone number: +25%
- Has opening hours: +25%
- Has photos: +25%

Display:
- 75-100%: "Verified" badge (green)
- 50-74%: "Basic Info" badge (yellow)
- <50%: No badge (or subtle "Limited info" text)
```

**Files to Modify:**
- `src/components/UnifiedStoreCard.tsx` - Add badge near store name

---

## Phase 2: Quick Action Buttons on Store Cards

### 2.1 Add One-Tap Call & Directions Buttons

**Current Problem:**  
Users must navigate to the store detail page to call or get directions.

**Solution:**  
Add compact action buttons directly on the store card for stores with phone numbers.

**Files to Modify:**
- `src/components/UnifiedStoreCard.tsx`
- `src/components/store/StoreContactInfo.tsx`

**New Layout:**
```text
┌─────────────────────────────────────────┐
│ [Photo] │ Store Name          ★ 4.2    │
│         │ Grocery Store • EBT           │
│         │ 📍 123 Main St • 2.3 mi       │
│         │ ───────────────────────       │
│         │ [📞 Call] [🧭 Directions] [❤️]│
└─────────────────────────────────────────┘
```

**Implementation:**
- `Call` button: Only show if `google_formatted_phone_number` exists
- `Directions` button: Always show (uses address)
- Keep existing Favorite and Share buttons

---

## Phase 3: Enhanced Search Filters

### 3.1 Add "Has Complete Info" Filters

**Current Problem:**  
Users can't filter to find stores with verified hours, phone numbers, or reviews.

**Solution:**  
Add filter toggles for data completeness.

**Files to Modify:**
- `src/components/StoreFilters.tsx`

**New Filters:**
```text
☐ Has Phone Number
☐ Has Store Hours  
☐ Has Reviews/Ratings
☐ Has Photos
```

**Database Query Changes:**
Update the `smart_store_search` RPC or add client-side filtering for:
- `google_formatted_phone_number IS NOT NULL`
- `google_opening_hours IS NOT NULL`
- `google_rating IS NOT NULL`
- `google_photos IS NOT NULL`

---

## Phase 4: First-Time User Onboarding

### 4.1 Create Getting Started Checklist

**Current Problem:**  
New users don't know about community features like reviews, price reports, or saved lists.

**Solution:**  
Add an onboarding checklist that appears for new logged-in users.

**Files to Create:**
- `src/components/onboarding/GettingStartedChecklist.tsx`
- `src/hooks/useOnboardingProgress.ts`

**Checklist Items:**
```text
Getting Started with EBT Finder:
✓ Create an account
☐ Save your first store to favorites
☐ Leave a review for a store you've visited
☐ Report a price to help the community
☐ Follow a store for updates
```

**Storage:**
- Track progress in `localStorage` (no database needed)
- Show checklist in `PersonalizedDashboard.tsx` for users with incomplete progress
- Dismiss after all items complete or user clicks "Skip"

### 4.2 Add Contribution Points Awareness

**Current Problem:**  
Users don't realize they can earn points for contributions.

**Solution:**  
Add subtle point prompts near contribution actions.

**Files to Modify:**
- `src/components/reviews/ReviewForm.tsx` - Add "+15 points" hint
- `src/components/prices/PriceReportForm.tsx` - Add "+5 points" hint
- `src/components/store-detail/modals/AddPhotoModal.tsx` - Add "+10 points" hint

**Example:**
```text
"Leave a Review" button → "Leave a Review (+15 pts)"
```

---

## Phase 5: Store Detail Page Improvements

### 5.1 Reorganize Missing Data CTAs

**Current State:**  
`StoreHeader.tsx` already has `AddPhoneModal` and `AddHoursModal` but they're subtle.

**Solution:**  
Make contribution CTAs more prominent for stores with missing data.

**Files to Modify:**
- `src/components/store-detail/StoreHeader.tsx`

**New Section (when data is missing):**
```text
┌─────────────────────────────────────────┐
│ 📝 Help Complete This Listing           │
│                                         │
│ [Add Phone Number]  [Add Store Hours]   │
│                                         │
│ Earn points for every contribution!     │
└─────────────────────────────────────────┘
```

### 5.2 Show "Verified by Google" Badge

For stores with Google Places data, show a trust indicator.

**Files to Modify:**
- `src/components/store-detail/EnhancedGooglePlacesInfo.tsx`

**Add Badge:**
```text
"✓ Verified by Google" (with last updated date if available)
```

---

## Implementation Summary

| Phase | Component | Priority | Effort |
|-------|-----------|----------|--------|
| 1.1 | Hide empty data rows | High | Small |
| 1.2 | Data quality badge | Medium | Small |
| 2.1 | Quick action buttons | High | Medium |
| 3.1 | Complete info filters | Medium | Medium |
| 4.1 | Onboarding checklist | High | Medium |
| 4.2 | Point prompts | Low | Small |
| 5.1 | Contribution CTAs | Medium | Small |
| 5.2 | Verified badge | Low | Small |

---

## Technical Notes

**No Database Changes Required:**  
All improvements use existing data from `snap_stores` table.

**Backward Compatibility:**  
- `UnifiedStoreCard` changes are additive
- Filter additions don't affect existing search logic
- Onboarding uses localStorage, no user table changes

**Performance:**  
- Data quality calculation is client-side (minimal overhead)
- No additional API calls needed

