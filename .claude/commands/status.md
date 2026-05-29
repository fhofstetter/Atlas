---
name: status
description: Show Atlas system status — task counts, recent log entries, active model
allowed-tools: Bash Read Glob
disable-model-invocation: false
---

Report the current Atlas system status. Run these checks:

1. **Task counts** — run `bash tools/scripts/task-status.sh` and display the output.
2. **Recent session log** — read today's log at `logs/sessions/<YYYYMMDD>.md`
   (use `date -u +%Y%m%d` for the filename). Show the last 10 lines.
3. **Recent errors** — list files in `logs/errors/` modified today. If any exist,
   show the first 5 lines of each.
4. **Active model** — read `config/atlas.yaml` and display the `model.default` value.
5. **Agents available** — list files in `.claude/agents/` (names only, no paths).

Format the output as a single markdown report with sections and a summary line
at the end: "Atlas is ready." or "Atlas has N issue(s) — see errors above."
