
# Add Benefits Calculator to Desktop Header Navigation

## Changes

Two files need small updates:

### 1. `src/components/HeaderNavigation.tsx`
- Add `benefits-calculator` to `getActiveItem()` path detection
- Add `{ id: 'benefits-calculator', label: 'Calculator' }` to the `navItems` array (placed after "SNAP Tips" and before "Profile")

### 2. `src/App.tsx`
- Add `'benefits-calculator': '/benefits-calculator'` to the `routes` map inside `handleNavigate` (line 66-73)

No other files need changes. The route itself (`/benefits-calculator`) and the `BenefitsCalculator` page already exist.

## Technical Details

**HeaderNavigation.tsx -- `getActiveItem()`:** Add:
```typescript
if (path === '/benefits-calculator') return 'benefits-calculator';
```

**HeaderNavigation.tsx -- `navItems`:** Add before Profile:
```typescript
{ id: 'benefits-calculator', label: 'Calculator' },
```

**App.tsx -- `routes` map:** Add:
```typescript
'benefits-calculator': '/benefits-calculator',
```
