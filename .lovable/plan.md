

## Expand Brand Logo Coverage

### Current State
- **140+ brands** currently mapped in `brandLogos.ts`
- **~89,100 stores (33.7%)** matched out of 264,290 total
- **~175,000 stores** still showing generic placeholders

### Top Unmatched Brands Found in Database

Here are the most common store names NOT currently matched, grouped by category:

**Gas Station / Fuel Brands (high volume)**
| Brand | Store Count | Domain |
|-------|-----------|--------|
| Chevron (+ Food Mart) | ~177 | chevron.com |
| Shell (+ Food Mart) | ~182 | shell.com |
| Marathon (+ Food Mart/Gas) | ~141 | marathon.com |
| Sunoco (+ Food Mart/A Plus) | ~115 | sunoco.com |
| Citgo (+ Food Mart) | ~94 | citgo.com |
| Exxon (+ Food Mart) | ~66 | exxon.com |
| BP (+ Food Mart) | ~126 | bp.com |
| Mobil (+ Mart) | ~58 | mobil.com |
| Valero (+ Food Mart) | ~48 | valero.com |
| Texaco Food Mart | 56 | texaco.com |
| Phillips 66 | 14 | phillips66.com |
| Arco / AMPM | 25 | arco.com |

**Ethnic & Specialty Grocery Chains**
| Brand | Store Count | Domain |
|-------|-----------|--------|
| Patel Brothers | ~31 | patelbros.com |
| H Mart / Super H Mart | ~22 | hmart.com |
| Bravo Supermarket | ~27 | bravosupermarkets.com |
| Compare Foods | ~16 | comparefoods.net |
| Seafood City Supermarket | 17 | seafoodcity.com |
| Fiesta (Market/Supermarket) | ~11 | fiestamart.com |
| Supermercados Morelos | 4 | morelos.com |
| La Michoacana Meat Market | ~11 | lamichoacanameatmarket.com |
| Food Bazaar | 7 | foodbazaar.com |

**Regional Grocery Chains**
| Brand | Store Count | Domain |
|-------|-----------|--------|
| Key Food | ~14 | keyfood.com |
| C-Town Supermarket | ~6 | ctownsupermarkets.com |
| Food City | 6 | foodcity.com |
| Giant Eagle | ~4 | gianteagle.com |
| Price Chopper | ~4 | pricechopper.com |
| Market Basket | ~6 | shopmarketbasket.com |
| Lidl | ~3 | lidl.com |

**Other Recognizable Chains**
| Brand | Store Count | Domain |
|-------|-----------|--------|
| Kangaroo Express | 15 | kangarooexpress.com |
| Pantry 1 Food Mart | 13 | pantry1.com |
| Ez Mart | 26 | ezmart.com |

### Implementation Plan

**File to modify:** `src/utils/brandLogos.ts`

Add the following new entries to the `BRAND_DOMAINS` mapping, organized into new sections:

1. **Gas Stations & Fuel (12 new brands, ~1,100+ stores)**
   - chevron, shell, marathon, sunoco, citgo, exxon, bp, mobil, valero, texaco, phillips 66, arco/ampm

2. **Ethnic & Specialty Grocery (9 new brands, ~140+ stores)**
   - patel brothers, h mart, bravo supermarket, compare foods, seafood city, fiesta, supermercados morelos, la michoacana, food bazaar

3. **Regional Grocery Chains (7 new brands, ~40+ stores)**
   - key food, c-town, food city, giant eagle, price chopper, market basket, lidl

4. **Other Chains (3 new brands, ~50+ stores)**
   - kangaroo express, ez mart, pantry 1

### Estimated Impact
- **~31 new brand mappings** added
- **~1,300+ additional stores** will display official logos
- Total coverage increases from ~33.7% to ~34.2%
- Gas station brands provide the biggest single improvement

### Technical Details

Each entry follows the existing pattern in `brandLogos.ts`:
```text
'chevron': 'chevron.com',
'shell': 'shell.com',
'marathon': 'marathon.com',
// etc.
```

The partial matching logic already handles variants like "Chevron Food Mart" matching the `chevron` key, so only one entry per brand is needed in most cases. A few brands need multiple keys for alternate spellings (e.g., `'h mart'` and `'h-mart'`).

No other files need changes -- `StorePhoto.tsx` and `BrandLogo.tsx` already use `getBrandLogo()` from this utility.

