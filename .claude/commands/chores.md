---
name: chores
description: View, add, and mark recurring household chores as done; see what's overdue
argument-hint: "[list|done <id>|add|overdue]"
allowed-tools: Read, Write, Bash
---

Manage recurring chores in `data/organizer/chores.json`.

## Argument Parsing

- No argument or `list` — show all chores as a table
- `done <id>` — mark done and compute next due date
- `add` — create a new chore
- `overdue` — show only overdue chores

## Schema for a new chore

```json
{
  "id": "chore_NNN",
  "title": "",
  "recurrence": "daily|weekly|monthly|once",
  "recurrence_days": [],
  "recurrence_day_of_month": null,
  "last_done": null,
  "next_due": "YYYY-MM-DD",
  "status": "pending",
  "overdue": false,
  "notes": ""
}
```

## done <id> logic

1. Set `last_done` to today (UTC, YYYY-MM-DD)
2. Compute `next_due`:
   - daily: +1 day
   - weekly: +7 days
   - monthly: same day next month
   - once: set status "done", no next_due
3. Set `status: "pending"`, `overdue: false`

## Rules

- Use UTC dates in ISO YYYY-MM-DD format
- Recurrence always computed from `last_done`, not from `next_due`
- Display as table: ID | Title | Recurrence | Last Done | Next Due | Status
