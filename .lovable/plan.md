
## Fix Corner Stores Tab Cut Off on Desktop

### Problem
The category nav bar has 7 tabs with `min-w-max` and generous desktop spacing (`md:gap-6`, `md:min-w-[80px]`, `md:px-4`). This makes the total width exceed the container, cutting off "Corner Stores" on desktop. The scroll buttons are hidden on desktop (`md:hidden`), so users can't reach it.

### Fix
Reduce the desktop gap and padding slightly so all 7 tabs fit within the container:

**File: `src/components/CategoryTabs.tsx`**

- Change `md:gap-6` to `md:gap-3` on the `<nav>` element (line 179) -- this alone saves ~60px across 6 gaps
- Change `md:min-w-[80px]` to `md:min-w-[72px]` on each tab button (line 191) -- saves ~56px across 7 tabs
- Change `md:px-4` to `md:px-3` on each tab button (line 191) -- saves ~14px across 7 tabs

Together these save ~130px, enough to fit all 7 tabs comfortably on desktop without affecting mobile (which uses the smaller values already).

### No other files affected
This is a CSS-only change in one file.
