---
name: check-deals
description: Check all tracked products (or a specific one) for price drops, threshold breaches, and cross-store deals
argument-hint: "[product-name-or-id]"
allowed-tools: Read Write Bash Agent
---

Check for price deals on tracked products.

## Parse Arguments

If `$ARGUMENTS` is non-empty, treat it as a product name or id to check a
single product. Otherwise check all products.

## Execute

1. Verify setup:
   ```bash
   ls tools/price-tracker/node_modules 2>/dev/null || (cd tools/price-tracker && npm install)
   ls data/prices/products.json 2>/dev/null || echo "No products tracked yet."
   ```

2. Run the check:
   ```bash
   # Single product
   node tools/price-tracker/index.js check-one "$ARGUMENTS"

   # All products
   node tools/price-tracker/index.js check-all
   ```

3. Read `logs/alerts.md` and `data/prices/alerts.json` for alerts fired this run.

4. Display a deal summary table:

   | Product | Store | Price CHF | Landed CH | Landed DE | Deal Type | Detail |
   |---------|-------|-----------|-----------|-----------|-----------|--------|

5. If no deals found: "No deals detected. All prices are within normal range."

6. If deals found:
   - Highlight threshold alerts (most important)
   - Show cross-store deals
   - Show below-average deals
   - Recommend whether CH or DE shipping is cheaper for each deal

## Notes

- Exchange rates are cached for 1 hour; stale rates are flagged.
- Extraction failures are reported but do not stop the run.
- Alert history is in `data/prices/alerts.json`.
