---
name: price-report
description: Generate a full markdown report of all tracked products with price history, trends, and recommendations
argument-hint: "[--output <path>]"
allowed-tools: Read Write Bash Agent
---

Generate a comprehensive price tracking report.

## Parse Arguments

Optional `--output <path>` to specify where to save the report.
Default output: `output/price-report_<timestamp>.md`.

## Execute

1. Verify setup and list products:
   ```bash
   node tools/price-tracker/index.js list --json
   ```

2. For each product, read its history file:
   ```bash
   cat data/prices/history/<product-id>.json
   ```

3. Run a fresh check if any product was last checked more than 6 hours ago:
   ```bash
   node tools/price-tracker/index.js check-all
   ```

4. Generate the report with this structure:

```markdown
# Price Tracker Report — <date>

## Summary
- Products tracked: N
- Deals active: N
- Alerts fired (last 30d): N

## Products

### <Product Name>
- **Category**: electronics
- **Alert threshold**: CHF 200

| Store | Price | CHF | Landed CH | Landed DE | 30d Avg | Trend |
|-------|-------|-----|-----------|-----------|---------|-------|
| amazon.de | EUR 189 | CHF 175 | CHF 201 | CHF 183 | CHF 210 | -5% |

**Recommendation**: Buy from <store> shipping to <CH|DE> for lowest landed cost of CHF X.
```

5. Write the report to the output path.
6. Display the report inline and confirm the file path.
7. Offer to run `/check-deals` for live deal detection.
