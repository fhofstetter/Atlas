# atlas-core — TODO

Path: `c:/Data/Projects/code/Atlas`  
See: [ecosystem-architecture.md](../ecosystem-architecture.md) | [status](../status.md)

---

## Dashboard shell (widget system)

- [ ] Define widget config file (`config/dashboard-widgets.json`) — list of external service URLs
- [ ] Add server-side widget fetcher — calls each service's `GET /api/widget/summary` with timeout + graceful fallback
- [ ] Add widget card component to dashboard view — renders title, status dot, lines, action buttons
- [ ] Wire atlas-fit widget when Step 1 is done
- [ ] Wire atlas-trading widget when Step 3 is done

## Scraper — extract to shared package

- [ ] Move `scraper.js` + `utils.js` to `packages/scraper/`
- [ ] Update price-tracker imports to use the package path
- [ ] Document the package API (fetch, parse, rate-limit helpers)

## Extraction prep (before atlas-fit is live)

- [ ] Verify all health/training data paths are env-var driven (not hardcoded) — needed for clean handoff
- [ ] Add `GET /api/widget/summary` stub returning atlas-core's own summary (model for other services)

## Cleanup (after atlas-fit is live — Step 6)

- [ ] Remove `/training` route + training view
- [ ] Remove `/health` route + health view
- [ ] Remove `data/health/` volume mount from docker-compose.yml
- [ ] Remove exercise modal + body-highlighter from public/js/
- [ ] Remove training-related Atlas skills/agents if migrated to atlas-fit

## OSS inspiration — dashboards + price tracker + budget

- [ ] **Study Glance's widget config pattern** (YAML-driven, no-code widget registration) — adopt for atlas-core dashboard so adding a new service doesn't require code changes (ref: Glance GitHub ⭐34.6k, Go)
- [ ] **Study Homarr v2's tRPC + WebSocket real-time widget updates** — worth adopting for live-refreshing dashboard cards without page reload (ref: Homarr v2 GitHub ⭐3.9k, TypeScript)
- [ ] **Add JSON-LD extraction strategy to price scraper** (inspired by PriceGhost's multi-strategy + confidence voting) — makes scraper resilient to DOM changes on CH/EU stores (ref: PriceGhost GitHub ⭐571)
- [ ] **Add AI fallback extraction to price scraper** — when CSS selector + JSON-LD both fail, send page HTML snippet to Claude for price extraction; same pattern PriceGhost uses
- [ ] Review Actual Budget's `loot-core` local-first sync engine if budget ever needs multi-device sync (ref: Actual Budget GitHub ⭐26.7k, TypeScript)
- [ ] Review Firefly III REST API design as reference for atlas-core's own budget API surface (ref: Firefly III GitHub ⭐23.4k)

## Ongoing / housekeeping

- [ ] Resolve WSL restart investigation (39s startup lag — see memory note)
- [ ] Re-enable startup health-check hook once restart issue is fixed
- [ ] Clean up duplicate price-tracker code (`tools/atlas-webapp/price-tracker/` vs root-level)
- [x] Archived `trade-bot-binance-old` → `c:/Data/Projects/code/archive/trade-bot-binance-old` (2026-05-29) — indicators logic may be useful when building atlas-trading; delete after it's been absorbed
