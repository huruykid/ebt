

## Fix: "Indexed, though blocked by robots.txt" for /phoenix and /houston

### Problem
The `robots.txt` file explicitly blocks `/phoenix` and `/houston` with `Disallow` rules (lines 20, 23), but Google has already indexed these URLs. This creates a conflict — Google indexed them but robots.txt says don't crawl, resulting in the warning.

Since these legacy URLs already have client-side redirects to `/city/phoenix` and `/city/houston`, the correct fix is to **remove the Disallow rules** for all legacy city URLs from `robots.txt`. The redirects already handle sending users and crawlers to the canonical `/city/` URLs, and blocking them in robots.txt actually *prevents* Google from seeing the redirect.

### Plan

**File: `public/robots.txt`**
- Remove the entire "Block legacy city URLs" section (lines 15-27) containing all 12 `Disallow` entries for legacy city slugs
- The client-side redirects + canonical tags already handle deduplication properly

This is a one-file, simple change.

