---
name: track-price
description: Add a product URL to the price tracker and set an optional CHF alert threshold
argument-hint: "<url> [--threshold <CHF>] [--category electronics|clothing|footwear|general]"
allowed-tools: Read Write Bash Agent
---

Add a product to the Atlas price tracker.

## Parse Arguments

From `$ARGUMENTS`, extract:
- `url` — one or more URLs (space-separated or `--url` flags)
- `--threshold <n>` — optional CHF alert threshold
- `--category <c>` — optional customs category (default: general)
- `--weight <kg>` — optional weight in kg

If no URL is provided, ask: "Please provide the product URL(s) to track."

## Execute

1. Verify the price tracker is installed:
   ```bash
   ls tools/price-tracker/node_modules 2>/dev/null || (cd tools/price-tracker && npm install)
   ```

2. Run the add-product command:
   ```bash
   node tools/price-tracker/index.js add-product --url "<url>" [--threshold <n>] [--category <c>] [--weight <kg>]
   ```

3. Read back the result from `data/prices/products.json` and display:
   - Product name and id
   - Each store: URL, current price in original currency and CHF
   - Landed cost breakdown for CH (product + shipping + customs)
   - Landed cost for DE address option
   - Alert threshold (if set)

4. If any store returned `extraction_failed`, dispatch the `price-tracker` agent
   to attempt manual extraction via WebFetch.

5. Confirm: "Product added. Run `/check-deals` anytime or schedule
   `tools/scripts/check-prices.sh` in Windows Task Scheduler."
