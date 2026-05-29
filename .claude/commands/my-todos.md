---
name: my-todos
description: Your personal todo list — separate from the Atlas task queue
argument-hint: "[list|add|done <id>|due|tag <tag>|defer <id> <date>]"
allowed-tools: Read, Write, Bash
---

Manage personal todos in `data/organizer/user-todos.json`.

This is YOUR list for personal tasks and errands. It is separate from the Atlas task queue in `tasks/queue/`.

## Argument Parsing

- No argument or `list` — show all open todos sorted by priority (high→medium→low)
- `add` — create a new todo (ask for title, notes, priority, due date, tags)
- `done <id>` — mark complete, set completed_at
- `due` — show todos due within the next 7 days; flag overdue in bold
- `tag <tag>` — filter by tag
- `defer <id> <date>` — set status to "deferred", update due date

## Schema for a new todo

```json
{
  "id": "todo_YYYYMMDD_NNN",
  "title": "",
  "notes": "",
  "priority": "high|medium|low",
  "due": "YYYY-MM-DD or null",
  "status": "open",
  "tags": [],
  "created_at": "",
  "updated_at": "",
  "completed_at": null
}
```

## Rules

- Never delete todos — completed ones stay for history
- Always update `updated_at` on any write
- Validate priority is one of high/medium/low
- Display list as table: ID | Title | Priority | Due | Tags | Status
