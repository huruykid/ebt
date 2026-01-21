# EBT Finder QA Test Plan

## Overview

This document outlines the structured QA test plan for EBT Finder, covering all core features, user roles, device compatibility, and edge cases.

**Application URL:** https://ebtfinder.lovable.app  
**Last Updated:** January 2026

---

## Table of Contents

1. [Test Environment Setup](#1-test-environment-setup)
2. [Core Feature Tests](#2-core-feature-tests)
3. [Role-Based Tests](#3-role-based-tests)
4. [Device & Responsive Tests](#4-device--responsive-tests)
5. [Edge Case Tests](#5-edge-case-tests)
6. [Performance Tests](#6-performance-tests)
7. [Accessibility Tests](#7-accessibility-tests)
8. [Security Tests](#8-security-tests)

---

## 1. Test Environment Setup

### Prerequisites
- [ ] Access to test accounts (regular user, admin)
- [ ] Multiple devices or browser dev tools for responsive testing
- [ ] Location services enabled/disabled scenarios
- [ ] Network throttling tools for slow connection testing

### Test Accounts
| Role | Purpose |
|------|---------|
| Anonymous | Unauthenticated user experience |
| Authenticated User | Standard user with login |
| Admin | Full admin access for blog/store management |

---

## 2. Core Feature Tests

### 2.1 Store Discovery (Homepage)

| Test ID | Test Case | Steps | Expected Result | Status |
|---------|-----------|-------|-----------------|--------|
| SD-001 | Location permission prompt | 1. Visit homepage as new user | Location permission prompt appears | ⬜ |
| SD-002 | Grant location access | 1. Click "Allow" on location prompt | Nearby stores load based on GPS location | ⬜ |
| SD-003 | Deny location access | 1. Click "Deny" on location prompt | Shows alternative search options (zip code) | ⬜ |
| SD-004 | Nearby stores display | 1. With location enabled, view homepage | Stores sorted by distance, showing name, type, distance | ⬜ |
| SD-005 | Store card information | 1. View any store card | Shows: name, type, address, distance, rating (if available) | ⬜ |
| SD-006 | "Open Now" filter | 1. Toggle "Open Now" filter | Only currently open stores displayed | ⬜ |
| SD-007 | Radius filter | 1. Change radius dropdown | Stores update to match selected radius | ⬜ |
| SD-008 | Category tabs | 1. Click category tabs (All, Grocery, Farmers Markets, etc.) | Stores filter by selected category | ⬜ |
| SD-009 | Infinite scroll | 1. Scroll to bottom of store list | More stores load automatically | ⬜ |
| SD-010 | Store card click | 1. Click on any store card | Navigate to store detail page | ⬜ |

### 2.2 Store Search

| Test ID | Test Case | Steps | Expected Result | Status |
|---------|-----------|-------|-----------------|--------|
| SS-001 | Search by store name | 1. Enter store name in search | Matching stores appear in results | ⬜ |
| SS-002 | Search by city | 1. Enter city name | Stores in that city displayed | ⬜ |
| SS-003 | Search by zip code | 1. Enter 5-digit zip | Stores in that zip code displayed | ⬜ |
| SS-004 | Search by state | 1. Enter state name or abbreviation | Stores in that state displayed | ⬜ |
| SS-005 | Empty search results | 1. Search for nonsense term | "No stores found" message displayed | ⬜ |
| SS-006 | Search suggestions | 1. Start typing in search | Autocomplete suggestions appear | ⬜ |
| SS-007 | Clear search | 1. Enter search, click clear button | Search clears, returns to default view | ⬜ |
| SS-008 | Search + category filter | 1. Search for city, select category | Results filtered by both search and category | ⬜ |

### 2.3 Store Detail Page

| Test ID | Test Case | Steps | Expected Result | Status |
|---------|-----------|-------|-----------------|--------|
| STD-001 | Store header info | 1. Navigate to store detail | Shows name, type, incentive badge (if applicable) | ⬜ |
| STD-002 | Address display | 1. View address section | Full address with "Get Directions" link | ⬜ |
| STD-003 | Get Directions link | 1. Click "Get Directions" | Opens Google Maps with directions | ⬜ |
| STD-004 | Phone number display | 1. View phone section (if available) | Clickable phone link | ⬜ |
| STD-005 | Store hours display | 1. View hours section | Shows operating hours, highlights current day | ⬜ |
| STD-006 | Google rating display | 1. View rating section | Shows Google rating and review count | ⬜ |
| STD-007 | Store photos | 1. View photos section | Google photos displayed in gallery | ⬜ |
| STD-008 | Photo modal | 1. Click on a photo | Opens full-size photo modal | ⬜ |
| STD-009 | Map display | 1. View map section | Interactive map with store marker | ⬜ |
| STD-010 | Share store | 1. Click share button | Share options appear (copy link, social) | ⬜ |
| STD-011 | Report issue | 1. Click "Report Issue" | Report modal opens | ⬜ |
| STD-012 | Claim business | 1. Click "Claim Business" | Claim modal opens | ⬜ |
| STD-013 | Back navigation | 1. Click back button | Returns to previous page | ⬜ |
| STD-014 | Breadcrumb navigation | 1. View breadcrumbs | Shows: Home > State > City > Store | ⬜ |

### 2.4 Favorites

| Test ID | Test Case | Steps | Expected Result | Status |
|---------|-----------|-------|-----------------|--------|
| FAV-001 | Add favorite (logged in) | 1. Click heart icon on store card | Heart fills, store added to favorites | ⬜ |
| FAV-002 | Add favorite (logged out) | 1. Click heart icon while logged out | Login prompt appears | ⬜ |
| FAV-003 | Remove favorite | 1. Click filled heart icon | Heart unfills, store removed | ⬜ |
| FAV-004 | View favorites page | 1. Navigate to /favorites | List of saved stores displayed | ⬜ |
| FAV-005 | Empty favorites | 1. View favorites with none saved | Empty state message displayed | ⬜ |
| FAV-006 | Favorites persistence | 1. Add favorite, refresh page | Favorite still marked | ⬜ |

### 2.5 Reviews & Comments

| Test ID | Test Case | Steps | Expected Result | Status |
|---------|-----------|-------|-----------------|--------|
| REV-001 | View store reviews | 1. Navigate to store detail | Reviews section displayed | ⬜ |
| REV-002 | Submit review (logged in) | 1. Click "Write Review", submit | Review appears in list | ⬜ |
| REV-003 | Submit review (logged out) | 1. Try to write review | Login prompt appears | ⬜ |
| REV-004 | Star rating selection | 1. Click stars in review form | Stars highlight on selection | ⬜ |
| REV-005 | Review validation | 1. Submit without rating | Validation error shown | ⬜ |
| REV-006 | View community comments | 1. View comments section | Comments list displayed | ⬜ |
| REV-007 | Google reviews display | 1. View Google reviews section | Google reviews with author, date, text | ⬜ |

### 2.6 Blog

| Test ID | Test Case | Steps | Expected Result | Status |
|---------|-----------|-------|-----------------|--------|
| BLG-001 | Blog list page | 1. Navigate to /blog | List of published blog posts | ⬜ |
| BLG-002 | Blog search | 1. Enter search term | Posts filtered by search | ⬜ |
| BLG-003 | Blog post detail | 1. Click on blog post | Full article displayed | ⬜ |
| BLG-004 | Featured image | 1. View blog post | Featured image displayed | ⬜ |
| BLG-005 | Image modal | 1. Click featured image | Full-size modal opens | ⬜ |
| BLG-006 | Table of contents | 1. View article with headings | ToC sidebar displayed (desktop) | ⬜ |
| BLG-007 | Social share | 1. Click share buttons | Share to Twitter/Facebook/copy link | ⬜ |
| BLG-008 | Related posts | 1. View bottom of article | Related posts section displayed | ⬜ |
| BLG-009 | Back to blog | 1. Click "Back to Blog" | Returns to blog list | ⬜ |
| BLG-010 | Blog SEO | 1. Check page source | Meta title, description, OG tags present | ⬜ |

### 2.7 Authentication

| Test ID | Test Case | Steps | Expected Result | Status |
|---------|-----------|-------|-----------------|--------|
| AUTH-001 | Sign up with email | 1. Navigate to /auth, enter email/password | Account created, confirmation email sent | ⬜ |
| AUTH-002 | Sign in with email | 1. Enter valid credentials | Logged in, redirected to home | ⬜ |
| AUTH-003 | Invalid login | 1. Enter wrong password | Error message displayed | ⬜ |
| AUTH-004 | Password reset | 1. Click "Forgot Password" | Reset email sent | ⬜ |
| AUTH-005 | Sign out | 1. Click sign out in menu | Logged out, redirected | ⬜ |
| AUTH-006 | Session persistence | 1. Login, close/reopen browser | Still logged in | ⬜ |
| AUTH-007 | Protected route access | 1. Try /profile while logged out | Redirected to /auth | ⬜ |

### 2.8 User Profile

| Test ID | Test Case | Steps | Expected Result | Status |
|---------|-----------|-------|-----------------|--------|
| PRF-001 | View profile | 1. Navigate to /profile | Profile info displayed | ⬜ |
| PRF-002 | Update display name | 1. Edit name, save | Name updated successfully | ⬜ |
| PRF-003 | View user reviews | 1. View "My Reviews" section | User's reviews listed | ⬜ |
| PRF-004 | Theme toggle | 1. Toggle dark/light mode | Theme changes accordingly | ⬜ |
| PRF-005 | Account settings | 1. View account settings | Email, password change options | ⬜ |

### 2.9 State & City Pages (SEO)

| Test ID | Test Case | Steps | Expected Result | Status |
|---------|-----------|-------|-----------------|--------|
| SEO-001 | State page | 1. Navigate to /state/california | California stores listed | ⬜ |
| SEO-002 | City page | 1. Navigate to /city/los-angeles-ca | Los Angeles stores listed | ⬜ |
| SEO-003 | State page SEO | 1. Check page source | Proper title, meta, schema markup | ⬜ |
| SEO-004 | City page SEO | 1. Check page source | Proper title, meta, schema markup | ⬜ |
| SEO-005 | Breadcrumb schema | 1. Check structured data | BreadcrumbList schema present | ⬜ |

---

## 3. Role-Based Tests

### 3.1 Anonymous User

| Test ID | Test Case | Expected Behavior | Status |
|---------|-----------|-------------------|--------|
| ANON-001 | Browse stores | Can view all stores | ⬜ |
| ANON-002 | Search stores | Can search and filter | ⬜ |
| ANON-003 | View store details | Can view all store info | ⬜ |
| ANON-004 | Add favorite | Prompted to login | ⬜ |
| ANON-005 | Write review | Prompted to login | ⬜ |
| ANON-006 | View blog | Can read all published posts | ⬜ |
| ANON-007 | Access profile | Redirected to login | ⬜ |
| ANON-008 | Access admin | No admin features visible | ⬜ |

### 3.2 Authenticated User

| Test ID | Test Case | Expected Behavior | Status |
|---------|-----------|-------------------|--------|
| USER-001 | All anonymous features | Same access as anonymous | ⬜ |
| USER-002 | Add/remove favorites | Can manage favorites | ⬜ |
| USER-003 | Write reviews | Can submit reviews | ⬜ |
| USER-004 | Edit own reviews | Can edit own reviews | ⬜ |
| USER-005 | Delete own reviews | Can delete own reviews | ⬜ |
| USER-006 | View profile | Can view/edit profile | ⬜ |
| USER-007 | Access admin | No admin features visible | ⬜ |

### 3.3 Admin User

| Test ID | Test Case | Expected Behavior | Status |
|---------|-----------|-------------------|--------|
| ADM-001 | All user features | Same access as authenticated user | ⬜ |
| ADM-002 | Blog management | Can create/edit/delete blog posts | ⬜ |
| ADM-003 | View all reviews | Can see all reviews with user IDs | ⬜ |
| ADM-004 | Manage categories | Can manage blog categories | ⬜ |
| ADM-005 | Seed comments button | Button visible and functional | ⬜ |
| ADM-006 | CSV upload | Can upload store data | ⬜ |

---

## 4. Device & Responsive Tests

### 4.1 Mobile (< 768px)

| Test ID | Test Case | Expected Behavior | Status |
|---------|-----------|-------------------|--------|
| MOB-001 | Bottom navigation | Shows mobile nav bar | ⬜ |
| MOB-002 | Store cards | Single column layout | ⬜ |
| MOB-003 | Search bar | Full width, accessible | ⬜ |
| MOB-004 | Filters | Collapsible/drawer style | ⬜ |
| MOB-005 | Store detail | Stacked layout | ⬜ |
| MOB-006 | Blog ToC | Hidden or collapsible | ⬜ |
| MOB-007 | Touch targets | Minimum 44px tap targets | ⬜ |
| MOB-008 | Scroll performance | Smooth scrolling | ⬜ |

### 4.2 Tablet (768px - 1024px)

| Test ID | Test Case | Expected Behavior | Status |
|---------|-----------|-------------------|--------|
| TAB-001 | Navigation | Hybrid nav approach | ⬜ |
| TAB-002 | Store cards | 2-column grid | ⬜ |
| TAB-003 | Store detail | Balanced layout | ⬜ |
| TAB-004 | Blog layout | Content + sidebar | ⬜ |

### 4.3 Desktop (> 1024px)

| Test ID | Test Case | Expected Behavior | Status |
|---------|-----------|-------------------|--------|
| DSK-001 | Header navigation | Full desktop nav | ⬜ |
| DSK-002 | Store cards | 3+ column grid | ⬜ |
| DSK-003 | Store detail | Side-by-side sections | ⬜ |
| DSK-004 | Blog ToC | Sticky sidebar visible | ⬜ |
| DSK-005 | Hover states | All interactive elements have hover | ⬜ |

### 4.4 Browser Compatibility

| Browser | Version | Status |
|---------|---------|--------|
| Chrome | Latest | ⬜ |
| Firefox | Latest | ⬜ |
| Safari | Latest | ⬜ |
| Edge | Latest | ⬜ |
| Safari iOS | Latest | ⬜ |
| Chrome Android | Latest | ⬜ |

---

## 5. Edge Case Tests

### 5.1 Location Edge Cases

| Test ID | Test Case | Steps | Expected Result | Status |
|---------|-----------|-------|-----------------|--------|
| LOC-001 | No GPS available | Disable location services | Shows zip code search fallback | ⬜ |
| LOC-002 | GPS timeout | Simulate slow GPS | Shows loading, then fallback | ⬜ |
| LOC-003 | International location | Set location outside US | Graceful message, search by zip | ⬜ |
| LOC-004 | Remote location | Set location with no nearby stores | "No stores within X miles" message | ⬜ |
| LOC-005 | Location permission revoked | Revoke permission mid-session | Handles gracefully, offers alternatives | ⬜ |

### 5.2 Network Edge Cases

| Test ID | Test Case | Steps | Expected Result | Status |
|---------|-----------|-------|-----------------|--------|
| NET-001 | Slow connection | Throttle to 3G | Loading states visible, eventually loads | ⬜ |
| NET-002 | Offline mode | Disable network | Offline message displayed | ⬜ |
| NET-003 | API timeout | Simulate timeout | Error message with retry option | ⬜ |
| NET-004 | Reconnection | Go offline then online | App recovers, data refreshes | ⬜ |

### 5.3 Data Edge Cases

| Test ID | Test Case | Steps | Expected Result | Status |
|---------|-----------|-------|-----------------|--------|
| DAT-001 | Store with no hours | View store without hours data | Shows "Hours not available" | ⬜ |
| DAT-002 | Store with no phone | View store without phone | Phone section hidden/placeholder | ⬜ |
| DAT-003 | Store with no photos | View store without photos | Photo section hidden/placeholder | ⬜ |
| DAT-004 | Store with no reviews | View store without reviews | "No reviews yet" message | ⬜ |
| DAT-005 | Very long store name | View store with long name | Text truncates properly | ⬜ |
| DAT-006 | Special characters | Search with special chars | Handles without error | ⬜ |
| DAT-007 | Empty search results | Search for "xyz123abc" | Clean empty state | ⬜ |

### 5.4 Authentication Edge Cases

| Test ID | Test Case | Steps | Expected Result | Status |
|---------|-----------|-------|-----------------|--------|
| AUT-001 | Session expired | Let session expire | Redirected to login gracefully | ⬜ |
| AUT-002 | Concurrent sessions | Login on two devices | Both sessions work | ⬜ |
| AUT-003 | Invalid token | Manually corrupt token | Logged out, can re-login | ⬜ |

---

## 6. Performance Tests

| Test ID | Test Case | Target | Status |
|---------|-----------|--------|--------|
| PRF-001 | Initial page load (LCP) | < 2.5s | ⬜ |
| PRF-002 | First Input Delay (FID) | < 100ms | ⬜ |
| PRF-003 | Cumulative Layout Shift (CLS) | < 0.1 | ⬜ |
| PRF-004 | Time to Interactive (TTI) | < 3.8s | ⬜ |
| PRF-005 | Search response time | < 500ms | ⬜ |
| PRF-006 | Store list scroll | 60 FPS | ⬜ |
| PRF-007 | Image lazy loading | Images load on scroll | ⬜ |
| PRF-008 | Bundle size | < 500KB gzipped | ⬜ |

---

## 7. Accessibility Tests

| Test ID | Test Case | WCAG | Status |
|---------|-----------|------|--------|
| A11Y-001 | Keyboard navigation | 2.1.1 | ⬜ |
| A11Y-002 | Focus indicators visible | 2.4.7 | ⬜ |
| A11Y-003 | Skip to main content | 2.4.1 | ⬜ |
| A11Y-004 | Alt text on images | 1.1.1 | ⬜ |
| A11Y-005 | Color contrast (4.5:1) | 1.4.3 | ⬜ |
| A11Y-006 | Form labels | 1.3.1 | ⬜ |
| A11Y-007 | Error identification | 3.3.1 | ⬜ |
| A11Y-008 | Screen reader compatibility | 4.1.2 | ⬜ |
| A11Y-009 | Touch target size (44px) | 2.5.5 | ⬜ |
| A11Y-010 | Reduced motion support | 2.3.3 | ⬜ |

---

## 8. Security Tests

| Test ID | Test Case | Expected Result | Status |
|---------|-----------|-----------------|--------|
| SEC-001 | XSS in search | Input sanitized, no script execution | ⬜ |
| SEC-002 | XSS in review text | HTML escaped in display | ⬜ |
| SEC-003 | SQL injection | Parameterized queries protect data | ⬜ |
| SEC-004 | Unauthorized API access | RLS policies enforce access control | ⬜ |
| SEC-005 | Rate limiting | Excessive requests blocked | ⬜ |
| SEC-006 | HTTPS enforcement | All traffic over HTTPS | ⬜ |
| SEC-007 | Sensitive data exposure | No PII in client console/network | ⬜ |
| SEC-008 | Admin route protection | Non-admins cannot access admin features | ⬜ |

---

## Test Execution Tracking

### Summary

| Category | Total | Passed | Failed | Blocked | Not Run |
|----------|-------|--------|--------|---------|---------|
| Store Discovery | 10 | - | - | - | 10 |
| Store Search | 8 | - | - | - | 8 |
| Store Detail | 14 | - | - | - | 14 |
| Favorites | 6 | - | - | - | 6 |
| Reviews | 7 | - | - | - | 7 |
| Blog | 10 | - | - | - | 10 |
| Authentication | 7 | - | - | - | 7 |
| Profile | 5 | - | - | - | 5 |
| SEO Pages | 5 | - | - | - | 5 |
| Role-Based | 17 | - | - | - | 17 |
| Device/Responsive | 18 | - | - | - | 18 |
| Edge Cases | 17 | - | - | - | 17 |
| Performance | 8 | - | - | - | 8 |
| Accessibility | 10 | - | - | - | 10 |
| Security | 8 | - | - | - | 8 |
| **TOTAL** | **150** | - | - | - | **150** |

---

## Issue Tracking Template

```markdown
### Issue: [Title]
- **Test ID:** XXX-000
- **Severity:** Critical / High / Medium / Low
- **Steps to Reproduce:**
  1. Step 1
  2. Step 2
- **Expected:** What should happen
- **Actual:** What actually happened
- **Screenshots/Videos:** [Attach]
- **Environment:** Browser, device, OS
```

---

## Sign-Off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| QA Lead | | | |
| Dev Lead | | | |
| Product Owner | | | |
