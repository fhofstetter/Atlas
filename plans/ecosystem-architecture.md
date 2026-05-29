# Ecosystem Architecture

**Status:** Planning  
**Created:** 2026-05-29  
**Goal:** Split the Atlas monolith into focused repos that each do one thing well, stay independently deployable, and slot into the unified dashboard without coupling.

---

## Guiding principle

> Each repo owns its domain end-to-end (data, API, UI). The dashboard is a thin shell that renders panels from those APIs. A new project joins the ecosystem by implementing the standard contract — nothing else needs to change.

---

## Repository Map

```
c:/Data/Projects/code/
├── Atlas/                  → atlas-core   (this repo, slimmed)
├── atlas-fit/              → new
├── atlas-trading/          → new (absorbs trade-bot)
└── DevOpsRepo/             → devops-platform (evolves in place)

archive:
└── trade-bot-binance-old/  → delete or archive
```

---

## Repos

### 1. `atlas-core` ← this repo

**Owns:** AI orchestration, personal assistant, unified dashboard.

| Domain | What's here |
|--------|-------------|
| AI orchestration | Claude Code agents, skills, workflows, task queue, hooks |
| Personal assistant | Organizer (goals, chores, todos), calendar, budget |
| Price tracker | Consumer goods tracking, CH/DE landed cost, alerts |
| Web scraper | Shared scraping library used by price tracker + atlas-trading |
| Dashboard shell | The single webapp — renders its own panels + widget panels from other services |
| Monitoring | Prometheus + Grafana config (stays here; it monitors the whole stack) |

**Stays because:** it's already running, it's the hub, and the dashboard naturally lives next to the orchestration brain.

---

### 2. `atlas-fit` ← new repo

**Owns:** training, health, sleep.

| Domain | What's here |
|--------|-------------|
| Training | Plans, workouts, exercise library, muscle map |
| Health | Sleep log, apnea tracking, body measurements |
| Fitness goals | Targets, progress tracking |
| API | REST endpoints atlas-core queries for dashboard widgets |

**Stack:** Node.js (same as atlas-core, low friction). PWA-first — installable on Android home screen, no app store. Native Android wrapper only if offline/hardware sensors are needed later.

**Extracted from atlas-core:** `data/health/`, `/training` + `/health` routes, exercise modal, body-highlighter JS.

---

### 3. `atlas-trading` ← new repo (absorbs `trade-bot`)

**Owns:** crypto, stocks, news.

| Domain | What's here |
|--------|-------------|
| Crypto | Binance integration (from trade-bot), positions, alerts |
| Stocks | New — price feeds, watchlist, portfolio |
| News | Aggregation feed serving both trading signals and personal assistant briefings |
| API | REST endpoints for dashboard widgets + atlas-core plan-day briefing |

**Stack:** Python (trade-bot is already Python; keep it). Expose a thin REST API (FastAPI) so atlas-core can query it.

**Note:** Stocks and crypto share the same infra (data pipelines, alerting, portfolio view) — they live as `src/crypto/` and `src/stocks/` inside this one repo, not split further.

---

### 4. `devops-platform` ← evolves from `DevOpsRepo`

**Owns:** platform templates, CI/CD, IaC, shared conventions.

| Domain | What's here |
|--------|-------------|
| Scaffold templates | `new-service` command that bootstraps a new repo with Docker, CI/CD, ADRs, lint, tests |
| CI/CD | GitHub Actions workflows (reusable) |
| IaC | Infrastructure as Code (cloud target TBD per backlog) |
| Conventions | ADR process, branch/commit rules, pre-commit hooks |
| Observability | Shared Grafana dashboards, alert rules (referenced by atlas-core's Prometheus) |

**Why it's a platform, not a service:** you don't run it; you pull from it when starting a new repo.

---

## Integration Model

Services talk to each other via **REST over localhost** (same machine, Docker network). No message bus, no shared database, no shared code imports across repos.

```
atlas-core dashboard
    │
    ├── GET /api/widget/summary  ──→  atlas-fit    :3457
    ├── GET /api/widget/summary  ──→  atlas-trading :3458
    └── renders own widgets inline (prices, organizer, budget)
```

### Standard widget contract

Every service that wants a dashboard panel implements one endpoint:

```
GET /api/widget/summary
→ {
    "service": "atlas-fit",
    "title":   "Training",
    "status":  "ok" | "warn" | "error",
    "lines":   ["Today: Upper body", "Week: 3/5 sessions", "Streak: 4 days"],
    "actions": [{ "label": "Log workout", "url": "http://localhost:3457/log" }]
  }
```

The dashboard renders this as a card. Adding a new service = run it + point its URL at the dashboard config. Nothing else changes.

### Event-style data sharing

For richer integration (e.g., plan-day briefing knows today's training session):

- atlas-fit exposes `GET /api/today` — returns today's planned workout
- atlas-trading exposes `GET /api/briefing` — returns overnight market summary
- atlas-core's `plan-day` skill calls both and merges them into the morning brief

No pub/sub needed at this scale.

---

## Data Ownership

Each service owns its data directory. No cross-service file reads.

| Data | Owned by | Path |
|------|----------|------|
| Organizer (goals, chores, todos) | atlas-core | `data/organizer/` |
| Budget | atlas-core | `data/budget/` |
| Prices / shopping | atlas-core | `data/prices/` |
| Calendar cache | atlas-core | `data/organizer/calendar-events.json` |
| Health & training | atlas-fit | `data/health/` |
| Crypto / stocks / news | atlas-trading | `data/trading/` |

When atlas-core needs health data for plan-day it calls the atlas-fit API — not reads the file.

---

## Shared Web Scraper

The scraper (Cheerio + undici) is a utility needed by two domains:

- **atlas-core** — consumer price tracking
- **atlas-trading** — news aggregation

**Decision:** ship it as a small internal npm package at `packages/scraper/` inside atlas-core. atlas-trading imports it via a versioned GitHub package reference or copies the module (fine at this scale — it's ~200 lines). Not a separate repo.

---

## Adding a New Project

1. Run `/new-service` in `devops-platform` → get a scaffolded repo with Docker, lint, tests, ADR skeleton
2. Implement `GET /api/widget/summary` (the standard contract)
3. Add the service URL to `atlas-core`'s dashboard config
4. Done — it appears as a card on the dashboard

---

## Migration Sequence

Extract one domain at a time. Each step is independent — the monolith keeps running throughout.

| Step | What | Why first |
|------|------|-----------|
| 1 | Extract `atlas-fit` | Cleanest cut — no other domain depends on it |
| 2 | Wire atlas-fit API into atlas-core dashboard | Validates the widget contract before we do it again |
| 3 | Evolve `atlas-trading` from `trade-bot` | Adds crypto+stocks+news; trade-bot is already separate |
| 4 | Wire atlas-trading into dashboard + plan-day | Completes the integration loop |
| 5 | Harden `devops-platform` scaffold | Codify the pattern now that we've done it twice |
| 6 | Retire extracted code from atlas-core | Clean up routes, data dirs, views no longer needed |

**What does NOT move:**
- AI orchestration (Claude Code agents/skills/workflows) — stays in atlas-core, it IS atlas
- Dashboard shell — stays in atlas-core
- Price tracker — stays in atlas-core (personal finance, not a separate domain)
- Monitoring stack — stays in atlas-core (monitors the whole ecosystem)

---

## Open Questions

| Question | Default if not decided |
|----------|----------------------|
| Auth across services? | No auth (localhost-only, trusted network). Add token header if exposed externally. |
| atlas-fit: PWA or native Android? | PWA first. Revisit after 3 months of mobile use. |
| atlas-trading stocks: which data provider? | Decide in atlas-trading planning phase. |
| devops-platform cloud target? | Still deferred (see backlog 0002). |
| Port allocation? | atlas-core: 3456, atlas-fit: 3457, atlas-trading: 3458 |
