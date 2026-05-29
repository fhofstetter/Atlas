# Plan Methodology

Always write and present a plan before implementing. Wait for explicit user approval before starting.
The methodology scales with task complexity — match the rigor to the risk.

## Task tiers

| Tier | Criteria | Method |
|------|----------|--------|
| **Micro** | Single file, ≤ 10 lines, fully reversible | Just do it, describe in one sentence |
| **Small** | 1–3 files, well-understood change | State the approach in the reply, then execute |
| **Medium** | 4+ files, new feature, data migration, new agent | Write a plan (bulleted steps) in the reply, wait for approval |
| **Large** | Cross-cutting refactor, new service, breaking change | Write a full plan file in `/plans/`, present to user, wait for approval |

## Plan contents (Medium and up)

1. **Why** — the problem or goal this solves
2. **What changes** — files created/modified/deleted, with brief reasoning
3. **Order of operations** — dependency-ordered step list
4. **How to verify** — what to check/run to confirm it worked
5. **Risks** — what could break and how to detect it

## Execution rules

- Implement exactly one logical step at a time — confirm it works before moving forward
- Run lint and/or tests after every code change when a test suite exists
- If a step fails, fix it before moving to the next — never skip ahead
- Mark each todo item completed immediately after finishing it, not in batches
- When a step reveals new unknowns, pause and update the plan

## Per-domain defaults

| Domain | Default tier | Notes |
|--------|-------------|-------|
| Webapp views (.ejs) | Small | Low risk — rendering only |
| Server routes (server.js) | Small–Medium | Check for breaking route changes |
| Data files (*.json) | Small | Verify schema matches before writing |
| Agent definitions (.md) | Small | Check slug is unique |
| docker-compose.yml | Medium | Volume/env changes affect all services |
| Dockerfile | Medium | Test build before declaring done |
| Monitoring config (Prometheus/Grafana) | Medium | Verify scrape targets after change |
| CLAUDE.md / rules / memory | Small | These are Atlas's operating instructions |
| Security-sensitive code | Large | Always route through security-auditor |
