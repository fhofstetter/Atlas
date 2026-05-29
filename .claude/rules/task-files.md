---
paths:
  - "tasks/**/*.md"
---

# Task File Rules

- Every task file must have all frontmatter fields from `tasks/_schema.md`.
- `id` must match the filename (e.g. `task_20260428_001.md` → `id: task_20260428_001`).
- `status` must match the subdirectory: `queue`, `active`, `completed`, or `failed`.
- `created_at` and `updated_at` must be UTC ISO 8601 (e.g. `2026-04-28T20:00:00Z`).
- `priority` must be one of: `low`, `medium`, `high`, `critical`.
- `agent` must match an agent slug defined in `.claude/agents/`.
- `output_path` must point inside `output/`.
