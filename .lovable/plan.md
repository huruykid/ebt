

## Fix Benefits Calculator Visibility on Desktop and Mobile Search Input

### Issues Found

1. **Benefits Calculator button not visible on desktop hero**: The code includes the Calculator button in the hero section, but it renders as a subtle `ghost` variant that can be missed. Additionally, the `max-w-2xl` container constrains the three buttons, and the ghost styling makes it nearly invisible.

2. **Mobile search input text cutoff**: The placeholder "Enter ZIP code (e.g., 90210)" is too long for the available space on small screens, getting truncated to "Enter ZIP code (e.".

3. **Corner Stores tab still cut off on desktop**: Only 7 tabs visible through "Delivery" -- "Corner Stores" is hidden.

---

### Plan

#### 1. Fix desktop Calculator button visibility
**File: `src/components/home/HeroSearch.tsx`**

- Change the Calculator button from `ghost` to `outline` variant so it matches the "Use current location" button styling and is clearly visible
- This ensures all three action buttons have consistent, visible styling

#### 2. Fix mobile search placeholder cutoff
**File: `src/components/ZipCodeSearch.tsx`**

- Shorten the placeholder text to `"Enter ZIP code"` -- concise and fits on all screen sizes
- Reduce the input font size on mobile by changing `text-base` to `text-sm` in the input className
- Reduce the Search button padding from `px-8` to `px-5` to give the input field more room

#### 3. Make search more intuitive (bonus improvements)
**File: `src/components/ZipCodeSearch.tsx`**

- Add `inputMode="numeric"` to the input to show the numeric keyboard on mobile devices -- makes it immediately clear users should type numbers
- Add `aria-label="ZIP code"` for accessibility

#### 4. Fix Corner Stores tab on desktop
**File: `src/components/CategoryTabs.tsx`**

- Remove `md:hidden` from the scroll/chevron buttons so desktop users can scroll to see all tabs
- Alternatively, reduce `min-w-max` to allow the nav to wrap or compress

---

### Files Modified
- `src/components/home/HeroSearch.tsx` -- Calculator button styling
- `src/components/ZipCodeSearch.tsx` -- placeholder text, font size, numeric keyboard
- `src/components/CategoryTabs.tsx` -- desktop tab overflow fix
