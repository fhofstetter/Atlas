---
name: plan-day
description: Generate your morning briefing — calendar, inbox highlights, chores, todos, goals, and health summary
argument-hint: "[--date YYYY-MM-DD]"
allowed-tools: Read, Write, Bash, Agent
effort: high
---

Generate the daily organizer briefing by delegating to specialist agents and reading local data.

## Steps

1. Parse `$ARGUMENTS` for `--date YYYY-MM-DD`. Default: run `date -u +%Y-%m-%d` for today.

2. Delegate to `organizer-agent` with the target date. The organizer-agent will:
   - Call `email-agent` for inbox summary
   - Call `calendar-agent` for today's events
   - Read `data/organizer/goals.json` for active goal next-actions
   - Read `data/organizer/chores.json` for overdue/due-today chores
   - Read `data/organizer/user-todos.json` for open todos
   - Call `GET http://atlas-fit:3457/api/today` for today's training session (graceful fallback if unreachable)
   - Call `GET http://atlas-trading:3458/api/briefing` for overnight market summary (graceful fallback if unreachable)
   - Read `data/health/sleep-log.json` for last night's sleep summary
   - Compose and write the briefing to `output/daily-plan_<YYYYMMDD>.md`

3. Display the briefing inline.

4. Remind user: "Edit todos with /my-todos · Log sleep with /sleep-log · Log workout with /fitness-log"

## Graceful degradation

If Gmail or Calendar MCP is not authenticated, organizer-agent will note it and continue with local data only. The briefing still shows goals, chores, todos, and health summary.
