# devops-platform — TODO

Path: `c:/Data/Projects/code/DevOpsRepo`  
Stack: .NET (src/) + Python (ml/) — platform templates, no live service  
See: [ecosystem-architecture.md](../ecosystem-architecture.md) | [status](../status.md)

---

## Phase 1 — Scaffold templates (priority: do this after atlas-fit lands)

These codify the patterns we discovered building atlas-fit and atlas-trading so every future repo starts right.

- [ ] Node.js service template — Express + Docker + ESLint + health endpoint + widget contract stub
- [ ] Python/FastAPI service template — FastAPI + Docker + health endpoint + widget contract stub
- [ ] Both templates include: `CLAUDE.md`, `.claude/agents/`, `.claude/commands/`, ADR skeleton, `TODO.md`
- [ ] Update `new-service` command to support both `--stack node` and `--stack python`

## Phase 2 — CI/CD (backlog 0003)

- [ ] Decide remote / hosting (backlog 0001) — GitHub private assumed
- [ ] Wire GitHub Actions for Node.js services (lint → test → docker build)
- [ ] Wire GitHub Actions for Python services (lint → test → docker build)
- [ ] Add branch protection rules (backlog 0011)
- [ ] Reusable workflow files that each repo can reference

## Phase 3 — Infrastructure

- [ ] Decide cloud target (backlog 0002)
- [ ] IaC baseline — Terraform or Pulumi (backlog 0004)
- [ ] Container strategy — Docker Compose (local) + cloud target (prod) (backlog 0005)
- [ ] Secrets management — vault or cloud-native (backlog 0006)
- [ ] Environments + promotion flow (backlog 0007)

## Phase 4 — Observability

- [ ] Shared Grafana dashboard definitions (backlog 0008) — import into atlas-core's Grafana
- [ ] Standard Prometheus scrape config for all services
- [ ] Alert rules for service health, error rates, latency

## Phase 5 — Housekeeping

- [ ] Decide Python lockfile tooling: pip-compile vs uv vs poetry (backlog 0013)
- [ ] Dependency update automation — Dependabot or Renovate (backlog 0009)
- [ ] Release + versioning strategy (backlog 0010)
- [ ] License decision (backlog 0012)

## Existing backlog (already tracked in docs/backlog/)

| # | Topic | Status |
|---|-------|--------|
| 0001 | Pick remote & hosting | Open |
| 0002 | Pick cloud target | Open |
| 0003 | Wire CI/CD | Open |
| 0004 | IaC baseline | Open |
| 0005 | Container strategy | Open |
| 0006 | Secrets management | Open |
| 0007 | Environments + promotion | Open |
| 0008 | Observability baseline | Open |
| 0009 | Dependency update automation | Open |
| 0010 | Release + versioning | Open |
| 0011 | Branch protection | Open |
| 0012 | License | Open |
| 0013 | Python lockfile tooling | Open |
| 0014 | Notebook hygiene | Open |
