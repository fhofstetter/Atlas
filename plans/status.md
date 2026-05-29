# Ecosystem Status

_Update this file as work progresses. One source of truth for where everything stands._

Last updated: 2026-05-29

---

## At a Glance

| Repo | Phase | Status | Port |
|------|-------|--------|------|
| [atlas-core](todos/atlas-core.md) | Complete | Running — healthy, slimmed | 3456 |
| [atlas-fit](todos/atlas-fit.md) | Phase 1–3 done | Running — healthy | 3457 |
| [atlas-trading](todos/atlas-trading.md) | Early stage | trade-bot exists (testnet only) | 3458 |
| [devops-platform](todos/devops-platform.md) | Scaffold | No live projects yet | — |

### Migration progress

```
Step 1  [x] Extract atlas-fit                    ← DONE 2026-05-29
Step 2  [x] Wire atlas-fit widget into dashboard  ← DONE 2026-05-29
Step 3  [x] Build atlas-trading                   ← DONE 2026-05-29
Step 4  [x] Wire atlas-trading into dashboard     ← DONE 2026-05-29
Step 5  [x] Harden devops-platform scaffold       ← DONE 2026-05-29
Step 6  [x] Retire extracted code from atlas-core ← DONE 2026-05-29
```

---

## Repo detail

### atlas-core
Path: `c:/Data/Projects/code/Atlas`  
Stack: Node.js + Express + EJS + Docker + Prometheus/Grafana  
Health: `http://localhost:3456/api/health`

### atlas-fit
Path: `c:/Data/Projects/code/atlas-fit` _(to be created)_  
Stack: Node.js + Express + Docker — PWA

### atlas-trading
Path: `c:/Data/Projects/code/atlas-trading` _(to be created, absorbs trade-bot)_  
Stack: Python + FastAPI + Docker

### devops-platform
Path: `c:/Data/Projects/code/DevOpsRepo`  
Stack: .NET (src/) + Python ML (ml/) — platform templates, no live service
