---
id: task_20260504_psql_migration
title: "PostgreSQL setup and JSON data migration"
description: |
  Introduce PostgreSQL as the persistent data store for Atlas, replacing direct JSON
  file reads in the Node.js/Express server. The work covers schema design, Docker
  service addition, migration scripts to import all existing JSON data, and server-layer
  updates so every API route reads from the DB instead of the filesystem. JSON files
  under data/ are retained as export/fallback format — they must not be deleted.

  Scope:
  1. Schema design — define all tables with appropriate types, constraints, and indexes.
  2. Docker — add a `postgres` service to docker-compose.yml (and an optional `pgadmin`
     or `adminer` service for local inspection).
  3. Migration scripts — one script per data domain that reads the JSON file and upserts
     rows into the target table(s). Scripts must be idempotent.
  4. Server update — replace `readJSON()` calls in the Express routes with DB queries.
     Use a connection pool (pg / node-postgres). Wrap in a lightweight data-access layer
     so the JSON fallback path remains exercisable.
  5. Verification — confirm row counts match source JSON record counts; run existing
     API integration tests.
status: queue
priority: medium
agent: orchestrator
workflow: ""
created_at: "2026-05-03T22:56:29Z"
updated_at: "2026-05-03T22:56:29Z"
depends_on: []
inputs:
  data_files:
    - path: data/organizer/user-todos.json
      target_table: todos
    - path: data/organizer/goals.json
      target_tables: [goals, milestones]
    - path: data/organizer/chores.json
      target_table: chores
    - path: data/organizer/calendar-events.json
      target_table: calendar_events
      note: "61 events — shooting schedule, training sessions, holidays"
    - path: data/organizer/shooting-schedule.json
      target_table: shooting_sessions
    - path: data/organizer/user-locations.json
      target_table: locations
    - path: data/health/fitness-log.json
      target_table: workouts
    - path: data/health/sleep-log.json
      target_table: sleep_entries
    - path: data/health/training-plan.json
      target_tables: [training_plans, training_sessions]
      note: "Nested JSON — plan metadata in training_plans, individual sessions in training_sessions"
    - path: data/budget/transactions.json
      target_table: transactions
    - path: data/budget/accounts.json
      target_table: accounts
    - path: data/budget/savings-goals.json
      target_table: savings_goals
    - path: data/prices/products.json
      target_tables: [products, price_history]
  server_entry: server.js
  compose_file: docker-compose.yml
  json_files_policy: "Retain as export/fallback — do not delete"
  privacy_note: >
    health/ and budget/ data files are marked LOCAL ONLY in CLAUDE.md.
    No data must be sent to any external service. DB must be local (Docker only).
output_path: output/task_20260504_psql_migration_result.md
---

## Notes

### Recommended sub-task order (for orchestrator)

1. **Researcher** — audit all JSON files to document current shapes; identify foreign-key
   relationships (e.g. goals → milestones, products → price_history, plans → sessions).
2. **Planner** — produce a dependency-ordered YAML plan and wait for user approval before
   any code changes.
3. **Coder** — add the `postgres` service to `docker-compose.yml`; add an `init.sql`
   (or migration runner) with `CREATE TABLE IF NOT EXISTS` statements for all tables.
4. **Coder** — write migration scripts under `tools/scripts/migrate/` (one file per
   domain). Each script: read JSON → validate → upsert to DB. Must be idempotent.
5. **Coder** — introduce `tools/db.js` (pg connection pool + query helpers); update
   Express routes to use it; preserve a `JSON_FALLBACK=true` env-var escape hatch.
6. **Tester** — verify row counts match source record counts; run existing API tests.
7. **Reviewer** — read-only review of schema design and migration scripts before any
   data is written in a production context.

### Constraints

- Use `node-postgres` (`pg`) — already the Atlas stack's standard Node DB client.
- Postgres version: 16 (LTS).
- Container name: `atlas-postgres`; internal port 5432; do NOT expose to host unless
  explicitly requested.
- Connection string via environment variable `DATABASE_URL` in `.env` (never hardcoded).
- Health check: `pg_isready -U atlas` must pass before webapp starts (use `depends_on`
  with `condition: service_healthy` in compose).
- All Postgres commands must use the WSL prefix per `docker.md` rules:
  `wsl -d Ubuntu-22.04 -- docker compose ...`
- Schema changes after initial creation must use numbered migration files, not ALTER
  TABLE ad-hoc commands.

### Schema notes

- `training_plan.json` is complex nested JSON — the orchestrator should have the
  researcher fully document its structure before the coder attempts table design.
- `calendar_events` and `shooting_sessions` may overlap; check for deduplication
  opportunity before creating separate tables.
- `price_history` entries should reference `products` via a foreign key; preserve
  scrape timestamps.

### Definition of done

- All 13 JSON sources are fully loaded into their target tables with matching row counts.
- `GET /api/todos`, `/api/goals`, `/api/budget`, `/api/health/*`, and `/api/prices`
  all return data sourced from the DB (confirmed via log or trace).
- JSON files under `data/` are unchanged and still readable as fallback.
- `npm test` (or equivalent) passes with no regressions.
- Result summary written to `output/task_20260504_psql_migration_result.md`.
