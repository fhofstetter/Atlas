# Atlas Development Workflow

## Core principle

**GitHub Issues are the single source of truth for all work.** Nothing gets built without an issue. Issues enforce intent (why), acceptance criteria (done means done), and traceability (git history links back to issues).

The `plans/todos/*.md` files are input — they feed issue creation. Issues drive execution.

---

## Issue lifecycle

```
IDEA → ISSUE (with AC) → TRIAGE → [DESIGN if M+] → BRANCH → IMPLEMENT → CI → PR → REVIEW → MERGE → CLOSE
```

1. **Idea** — anyone can capture an idea in any format
2. **Issue** — formalise it: one-liner title, acceptance criteria, labels, milestone
3. **Triage** — assign priority + size at weekly triage; move to Ready when unblocked
4. **Design** (M, L, XL only) — add a comment to the issue with the approach before touching code; get a reply before branching
5. **Branch** — `feat/42-exercise-library-sync` (type/issue-number-slug)
6. **Implement** — follow plan-methodology.md; commit with Conventional Commits
7. **CI** — lint + docker build must be green before review is requested
8. **PR** — title mirrors issue title; body uses PR template; links issue with `Closes #42`
9. **Review** — required for M+; optional (but encouraged) for XS/S
10. **Merge** — squash merge for S and below; merge commit for M+ (preserves branch history)
11. **Close** — issue auto-closes on merge via `Closes #N` in PR body

---

## Label taxonomy

Every issue gets exactly one label from each of: **Type**, **Priority**, **Size**. Domain is optional but strongly encouraged.

### Type
| Label | Colour | Meaning |
|---|---|---|
| `feat` | `#0075ca` | New capability |
| `fix` | `#d73a4a` | Bug or regression |
| `chore` | `#e4e669` | Housekeeping, deps, config |
| `refactor` | `#7057ff` | Code change with no behaviour change |
| `docs` | `#0052cc` | Documentation only |
| `security` | `#b60205` | Security fix or hardening |
| `research` | `#c5def5` | Investigation, spike, proof-of-concept |

### Priority
| Label | Colour | Meaning |
|---|---|---|
| `P0: critical` | `#b60205` | Production broken or data at risk — fix now |
| `P1: high` | `#d93f0b` | Blocks a milestone or another issue |
| `P2: medium` | `#e99695` | Valuable but not blocking |
| `P3: low` | `#f9d0c4` | Nice-to-have, revisit later |

### Size (complexity, not time)
| Label | Colour | Meaning |
|---|---|---|
| `size: XS` | `#ffffff` | Trivial — one file, under 20 lines |
| `size: S` | `#d4c5f9` | Small — well-understood, 1–3 files |
| `size: M` | `#a8a9db` | Medium — 4+ files or new behaviour |
| `size: L` | `#5319e7` | Large — new feature, needs design comment |
| `size: XL` | `#1d076e` | Extra large — cross-cutting or new service |

### Domain (pick the primary)
| Label | Colour |
|---|---|
| `domain: training` | `#10b981` |
| `domain: trading` | `#8b5cf6` |
| `domain: dashboard` | `#3b82f6` |
| `domain: budget` | `#f59e0b` |
| `domain: prices` | `#6366f1` |
| `domain: infra` | `#6b7280` |
| `domain: agents` | `#ec4899` |
| `domain: devops` | `#374151` |

---

## Branch naming

```
<type>/<issue-number>-<short-slug>

feat/42-exercise-library-sync
fix/17-calendar-fallback
chore/55-clean-duplicate-price-tracker
refactor/61-extract-scraper-package
```

Rule: always include the issue number. It creates a permanent breadcrumb.

---

## Commit convention

[Conventional Commits v1.0.0](https://www.conventionalcommits.org/en/v1.0.0/)

```
feat(atlas-fit): add PWA service worker for offline support (#42)
fix(calendar): fall back to empty events when atlas-fit is unreachable (#17)
chore(deps): bump express from 4.21.1 to 4.21.2
refactor(prices): extract scraper to packages/scraper/
```

Breaking changes: add `!` after type (`feat!:`) or a `BREAKING CHANGE:` footer.

---

## Pull request process

**Title** — mirrors the issue title exactly (or close to it).  
**Body** — fill in the PR template: what, why, how to test, screenshots for UI changes, checklist.  
**Link** — `Closes #42` in the body auto-closes the issue on merge.  
**CI must be green** before requesting review.  
**Review required** for M, L, XL. Self-merge allowed for XS, S after CI passes.

---

## CI gates (GitHub Actions)

Every repo runs CI on push and on pull_request targeting master.

| Repo | Gates |
|---|---|
| Atlas | ESLint on `tools/atlas-webapp/` |
| atlas-fit | ESLint + Docker build |
| atlas-trading | Ruff lint + Docker build |
| devops-platform | pre-commit (existing) |

A PR cannot be merged if CI is red. No `--no-verify` overrides.

---

## Milestones

Milestones group issues into meaningful releases. Every issue must be on a milestone.

| Milestone | Focus | Repos |
|---|---|---|
| `v0.1 — Foundation` | Ecosystem split, git, GitHub setup | all *(closed)* |
| `v0.2 — Trading MVP` | Binance live, portfolio view, stocks decision | atlas-trading, Atlas |
| `v0.3 — Fit PWA` | Service worker, mobile-responsive, icons, exercise library complete | atlas-fit |
| `v0.4 — CI/CD` | GitHub Actions wired, branch protection, Dependabot | all |
| `v0.5 — Dashboard v2` | Widget config UI, Glance-inspired layout, real-time refresh | Atlas |
| `backlog` | Unscheduled — captured, not yet prioritised | any |

---

## GitHub Project board

**Name:** Atlas Ecosystem  
**URL:** https://github.com/users/fhofstetter/projects/ *(see project created)*  
**Scope:** Cross-repo — all issues from Atlas, atlas-fit, atlas-trading, devops-platform  

Columns:
```
Backlog → Ready → In Progress → In Review → Done
```

- **Backlog** — captured, not yet triaged or unscheduled
- **Ready** — triaged, labelled, unblocked, can be picked up
- **In Progress** — branch exists, work is active
- **In Review** — PR open
- **Done** — merged and closed

---

## Triage cadence

**Weekly (Friday):** Review new issues in Backlog. Assign priority + size. Move unblocked P1/P2 to Ready.  
**Ad hoc:** P0 issues are triaged immediately.  
**Monthly:** Review milestone progress. Rescope if needed.

---

## What NOT to do

- Do not push directly to master for anything larger than a typo fix
- Do not create branches without an issue
- Do not merge a red CI PR
- Do not close issues manually — use `Closes #N` in the PR body
- Do not let issues sit in Backlog without a milestone for more than two weeks
