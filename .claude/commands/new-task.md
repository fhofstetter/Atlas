---
name: new-task
description: Create a new task file in tasks/queue/ and add it to the Atlas work queue
argument-hint: "[title]"
allowed-tools: Read Write Bash
---

Create a new task in the Atlas queue.

Ask me for (in this order, one question at a time if $ARGUMENTS is empty):
1. **Title** — short, action-oriented (e.g. "Research OAuth 2.0 best practices")
2. **Description** — what needs to be done and why
3. **Agent** — which agent should run it: `planner`, `researcher`, `coder`, `reviewer`, or `writer`
4. **Priority** — `low`, `medium`, `high`, or `critical` (default: `medium`)
5. **Depends on** — task ids that must complete first (default: none)

If `$ARGUMENTS` is provided, use it as the title and skip question 1.

Then:
1. Generate a task id: `task_<YYYYMMDD>_<NNN>` using today's date.
2. Write the task file to `tasks/queue/<task-id>.md` using the schema at `tasks/_schema.md`.
3. Set `created_at` and `updated_at` to the current UTC ISO 8601 timestamp.
4. Confirm the file path and task id to the user.
