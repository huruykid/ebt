

## Padding Audit & Fixes

After visually inspecting all pages on both mobile (390px) and desktop (1920px), here is a summary of findings and recommended fixes.

### Pages That Look Good (No Changes Needed)
- **Home (`/`)**: Good padding on both mobile (`px-3`/`px-4`) and desktop (`px-6`). Well balanced.
- **Blog (`/blog`)**: Clean `container mx-auto px-4 py-8 max-w-4xl`. Looks great.
- **SNAP Tips (`/snap-tips`)**: Uses `container mx-auto px-4 py-6 max-w-4xl`. Consistent.
- **Benefits Calculator (`/benefits-calculator`)**: Uses `container mx-auto px-4 py-8 max-w-4xl`. Clean layout.

- **Blog Post (`/blog/:slug`)**: Uses `container mx-auto px-4`. Looks good.
- **Enhanced Search (`/search`)**: Uses `container mx-auto px-4 py-6`. Clean.

### Pages With Padding Inconsistencies

1A. Store Detail (/store/:id): Uses max-w-7xl mx-auto px-4 sm:px-6 lg:px-8. Responsive and well-spaced.

1. **Profile (`/profile`)** - Uses `bg-neutral-100` (hardcoded gray) instead of `bg-background`. The padding `p-4` is fine but doesn't match the theme system used everywhere else.

2. **Favorites (`/favorites`)** - Same issue: `bg-neutral-100` instead of `bg-background`. Also uses `max-w-4xl` which may be too narrow for a 3-column grid on desktop.

3. **Mission (`/mission`)** - Uses `p-6` directly on the content container, which is consistent but the `max-w-4xl` container uses `p-6` instead of the `px-4 py-6` or `px-4 py-8` pattern used by other pages. Minor inconsistency.

4. **Support (`/support`)** - Uses `p-6` on `<main>`. Same pattern as Mission. Consistent between the two but differs from Blog/SnapTips which use `container mx-auto px-4 py-8`.

5. **Privacy Policy (`/privacy-policy`)** - Uses `p-6` on `<main>`. Same as Support. Consistent between static pages.

### Recommended Changes

The inconsistencies are minor. The two most impactful fixes are:

| Page | Current | Proposed Fix |
|------|---------|-------------|
| Profile (auth screen) | `bg-neutral-100 p-4` | `bg-background p-4` |
| Profile (logged in) | `bg-neutral-100 p-4` | `bg-background p-4` |
| Favorites | `bg-neutral-100`, `max-w-4xl p-4` | `bg-background`, `max-w-6xl p-4` |
| Mission | `max-w-4xl mx-auto p-6` | `max-w-4xl mx-auto px-4 py-8` |
| Support | `max-w-4xl mx-auto p-6` | `max-w-4xl mx-auto px-4 py-8` |
| Privacy Policy | `max-w-4xl mx-auto p-6` | `max-w-4xl mx-auto px-4 py-8` |

### Technical Details

**Files to modify:**

1. **`src/pages/Profile.tsx`**
   - Line 87: Change `bg-neutral-100` to `bg-background` (auth interface)
   - Line 196: Change `bg-neutral-100` to `bg-background` (loading state)
   - Line 256: Change `bg-neutral-100` to `bg-background` (profile page)

2. **`src/pages/Favorites.tsx`**
   - Line 13: Change `bg-neutral-100` to `bg-background`
   - Line 14: Change `max-w-4xl` to `max-w-6xl` for better use of desktop space with 3-column grid

3. **`src/pages/Mission.tsx`**
   - Line 152: Change `p-6` to `px-4 py-8` on the content container

4. **`src/pages/Support.tsx`**
   - Line 47: Change `p-6` to `px-4 py-8` on `<main>`

5. **`src/pages/PrivacyPolicy.tsx`**
   - Line 22: Change `p-6` to `px-4 py-8` on `<main>`

These are small tweaks that align all pages to the same padding pattern (`px-4 py-8` with `container` or `max-w` + `mx-auto`) and use the theme-aware `bg-background` instead of hardcoded grays.

