# atlas-fit — TODO

Path: `c:/Data/Projects/code/atlas-fit`  
Stack: Node.js + Express + Docker — PWA  
Port: 3457  
See: [ecosystem-architecture.md](../ecosystem-architecture.md) | [status](../status.md)

---

## Phase 1 — Scaffold

- [ ] Create repo at `c:/Data/Projects/code/atlas-fit`
- [ ] Init Node.js project (`package.json`, ESM, Express, EJS)
- [ ] Copy Dockerfile pattern from atlas-core
- [ ] Add to `docker-compose.yml` in atlas-core (same stack, same network)
- [ ] Set up ESLint + same code-style rules as atlas-core
- [ ] Basic health endpoint `GET /api/health`

## Phase 2 — Migrate from atlas-core

- [ ] Copy `data/health/` structure + seed files (sleep-log, fitness-log, health-goals, training-plan)
- [ ] Migrate `/training` route + `views/training.ejs`
- [ ] Migrate `/health` route + `views/health.ejs`
- [ ] Migrate `public/js/exercise-modal.js`
- [ ] Migrate `public/js/body-highlighter.browser.js`
- [ ] Migrate `public/js/charts.js` (health/training charts only)
- [ ] Migrate `public/img/exercises/` + `attribution.json`
- [ ] Migrate training-related skills/agents from atlas-core if applicable
- [ ] Confirm all data reads use env-var paths (not hardcoded)

## Phase 3 — API contract

- [ ] `GET /api/widget/summary` — dashboard card (status, today's session, streak)
- [ ] `GET /api/today` — today's planned workout (consumed by atlas-core plan-day)
- [ ] `GET /api/health-summary` — recent sleep + fitness snapshot

## Phase 4 — PWA

- [ ] Add `manifest.json` (name, icons, theme-color, display: standalone)
- [ ] Add service worker — cache app shell for offline use
- [ ] Test "Add to Home Screen" on Android Chrome
- [ ] Ensure all views are mobile-responsive

## Phase 5 — Atlas-core integration

- [ ] Add atlas-fit widget to dashboard config
- [ ] Update plan-day skill to call `GET /api/today`
- [ ] Smoke-test full flow: workout logged in atlas-fit → shows in atlas-core briefing

## Open questions

- [ ] Exercise images — 5 exercises still using placeholder cue cards (tracked: todo_20260504_011). Decide: find proper visuals or keep cue cards permanently?
- [ ] Android native: revisit after 3 months of PWA use

## OSS inspiration — exercise library

- [ ] **Replace hand-maintained exercise library with `yuhonas/free-exercise-db`** — 800+ exercises, CC0 public domain, muscles already as human-readable strings (perfect fit for body-highlighter). Download `dist/exercises.json` once and bundle locally. No API dependency, no attribution required. (wger was evaluated but rejected: volunteer server, no SLA, muscles as integer IDs requiring mapping layer)
- [ ] Write `tools/scripts/sync-exercises.js` — downloads latest `free-exercise-db/dist/exercises.json` from GitHub and writes to `data/health/exercise-library.json`; run manually or monthly
- [ ] Separate exercise library out of `training-plan.json` into standalone `data/health/exercise-library.json` — training plan references exercises by name only
- [ ] Update `server.js` in atlas-fit to read exercise library from separate file, fall back to embedded plan data if file missing
- [ ] Verify muscle string names in `free-exercise-db` match what `body-highlighter.browser.js` expects — write a mapping shim if any names differ
- [ ] Consider wger's Flutter mobile app as reference when building Android wrapper (same domain, open source, ⭐6.2k)
