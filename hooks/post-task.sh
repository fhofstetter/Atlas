#!/usr/bin/env bash
# Post-task hook — moves task active → completed|failed and logs end.
#
# Required env vars:
#   ATLAS_TASK_ID     — task id
#   ATLAS_TASK_AGENT  — agent slug
#   ATLAS_TASK_STATUS — completed | failed
#
# Exit codes (official Claude Code hook protocol):
#   0  — success
#   2  — blocking error (rare for post-task)
#   other — non-blocking error

set -euo pipefail

TASK_ID="${ATLAS_TASK_ID:?ATLAS_TASK_ID must be set}"
AGENT="${ATLAS_TASK_AGENT:?ATLAS_TASK_AGENT must be set}"
STATUS="${ATLAS_TASK_STATUS:-completed}"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
LOG_FILE="logs/sessions/$(date -u +%Y%m%d).md"

# Guard: status must be valid
if [[ "$STATUS" != "completed" && "$STATUS" != "failed" ]]; then
  echo "post-task: invalid ATLAS_TASK_STATUS '${STATUS}'" >&2
  exit 1
fi

# Move active → completed or failed
if [ -f "tasks/active/${TASK_ID}.md" ]; then
  mv "tasks/active/${TASK_ID}.md" "tasks/${STATUS}/${TASK_ID}.md"
fi

# Log event
mkdir -p "$(dirname "$LOG_FILE")"
echo "| ${TIMESTAMP} | ${STATUS^^} | ${TASK_ID} | ${AGENT} |" >> "$LOG_FILE"

exit 0
