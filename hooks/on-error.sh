#!/usr/bin/env bash
# On-error hook — writes an error log entry and moves the task to failed/.
#
# Required env vars:
#   ATLAS_TASK_ID   — task id
#   ATLAS_TASK_AGENT — agent slug
#   ATLAS_ERROR_MSG — error message
#
# Exit codes (official Claude Code hook protocol):
#   0  — error handled, continue (non-blocking)
#   2  — critical error, halt session

set -euo pipefail

TASK_ID="${ATLAS_TASK_ID:?ATLAS_TASK_ID must be set}"
AGENT="${ATLAS_TASK_AGENT:?ATLAS_TASK_AGENT must be set}"
ERROR="${ATLAS_ERROR_MSG:-unknown error}"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
SESSION_LOG="logs/sessions/$(date -u +%Y%m%d).md"
ERROR_FILE="logs/errors/$(date -u +%Y%m%d)_${TASK_ID}.md"

# Write error detail file
mkdir -p "logs/errors"
cat >> "$ERROR_FILE" <<EOF
## ${TIMESTAMP}

- **Task:** ${TASK_ID}
- **Agent:** ${AGENT}

### Error

${ERROR}

---
EOF

# Log to session log
mkdir -p "$(dirname "$SESSION_LOG")"
echo "| ${TIMESTAMP} | ERROR  | ${TASK_ID} | ${AGENT} |" >> "$SESSION_LOG"

# Move active → failed
if [ -f "tasks/active/${TASK_ID}.md" ]; then
  mv "tasks/active/${TASK_ID}.md" "tasks/failed/${TASK_ID}.md"
fi

# Exit 0: non-blocking — let the orchestrator decide whether to halt
exit 0
