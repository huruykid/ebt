

# Add RMP Advocacy Section for Non-Participating States

## Overview
For states that don't participate in the Restaurant Meals Program (RMP), replace the empty space with an advocacy call-to-action. Users will see who to contact and get a pre-filled email template they can send with one click.

## Approach
Since individual state SNAP agency email addresses change frequently and are hard to maintain, the design will:
1. Link users to the official USDA SNAP State Directory (https://www.fns.usda.gov/snap/state-directory) to find their state's contact
2. Provide a pre-filled `mailto:` link with subject and body so users just paste in the email address and hit send
3. Also include a "Copy template" button for flexibility

## UI Design
For non-RMP states, a styled banner will appear in the same location as the green RMP info box, with:
- A clear message: "{State} does not yet participate in the Restaurant Meals Program"
- Brief explanation of what RMP is and who benefits
- A "Find Your State SNAP Office" link to the USDA directory
- A "Send Email to Your Rep" button that opens a `mailto:` with a pre-filled template
- A "Copy Email Template" fallback button

## Changes

### 1. `src/pages/StatePage.tsx`
- Replace the conditional `{state.rmpParticipating && (...)}` block (lines 124-133) with a conditional that shows **either** the existing green RMP banner **or** a new amber/orange advocacy banner for non-RMP states
- The advocacy banner includes:
  - Icon and heading explaining RMP is not available
  - Link to USDA SNAP State Directory
  - `mailto:` button with pre-filled subject: "Request for Restaurant Meals Program (RMP) in {State}" and body with a polite template letter
  - Copy template button using `navigator.clipboard`

### 2. No other files need changes
The state data already has `rmpParticipating` boolean. No new dependencies needed.

## Technical Details

### Email Template Content
```
Subject: Request for Restaurant Meals Program (RMP) Participation in {State}

Body:
Dear {State} SNAP Program Administrator,

I am writing to request that {State} consider participating in the USDA Restaurant Meals Program (RMP). 

RMP allows eligible SNAP recipients -- including elderly, disabled, and homeless individuals -- to use their EBT benefits to purchase hot prepared meals at participating restaurants. Currently, only 8 states participate in this program.

Many {State} residents who qualify for SNAP benefits face barriers to preparing meals at home and would greatly benefit from RMP access. I urge you to explore bringing this program to our state.

Thank you for your consideration.

A Concerned {State} Resident
```

### mailto Link
```typescript
const subject = encodeURIComponent(`Request for Restaurant Meals Program (RMP) Participation in ${state.name}`);
const body = encodeURIComponent(`Dear ${state.name} SNAP Program Administrator,...`);
const mailtoLink = `mailto:?subject=${subject}&body=${body}`;
```

The `mailto:` uses an empty `to:` field so the user pastes in the correct address from the USDA directory. The copy button copies just the template text to clipboard.

### StatePage.tsx Change (lines 124-133)
Replace the RMP-only conditional with:
```tsx
{state.rmpParticipating ? (
  // existing green RMP banner
) : (
  // new amber advocacy banner with email template
)}
```

