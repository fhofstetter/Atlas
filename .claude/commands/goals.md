---
name: goals
description: View, add, update, or mark progress on personal goals stored in data/organizer/goals.json
argument-hint: "[list|add|done <id>|update <id>|milestone done <goal-id> <ms-id>]"
allowed-tools: Read, Write, Bash
---

Manage personal goals stored in `data/organizer/goals.json`.

## Argument Parsing

- No argument or `list` — show all active goals as a table
- `add` — interactively create a new goal (ask for title, description, horizon, target date, first milestone)
- `done <id>` — mark goal as completed
- `update <id>` — update next_action or progress_pct
- `milestone done <goal-id> <ms-id>` — tick a milestone; recalculate progress_pct

## Schema for a new goal entry

```json
{
  "id": "goal_YYYYMMDD_NNN",
  "title": "",
  "description": "",
  "category": "",
  "horizon": "short-term|medium-term|long-term",
  "target_date": "YYYY-MM-DD or null",
  "status": "active",
  "progress_pct": 0,
  "milestones": [],
  "next_action": "",
  "created_at": "",
  "updated_at": "",
  "notes": ""
}
```

## Rules

- Never delete goals — set status to "abandoned" if the user wants to drop one
- Always update `updated_at` on any write
- After every write, read the file back to verify valid JSON
- Display list as a markdown table: ID | Title | Horizon | Progress | Next Action | Target Date
