#!/usr/bin/env bash
# Pre-task hook — moves task queue → active and logs start.
#
# Required env vars (set by the caller before invoking this script):
#   ATLAS_TASK_ID    — task id (e.g. task_20260428_001)
#   ATLAS_TASK_AGENT — agent slug (e.g. coder)
#
# Exit codes (official Claude Code hook protocol):
#   0  — success, proceed
#   2  — blocking error, halt the task
#   other — non-blocking error, log and continue

set -euo pipefail

TASK_ID="${ATLAS_TASK_ID:?ATLAS_TASK_ID must be set}"
AGENT="${ATLAS_TASK_AGENT:?ATLAS_TASK_AGENT must be set}"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
LOG_FILE="logs/sessions/$(date -u +%Y%m%d).md"

# Guard: task file must exist in queue
if [ ! -f "tasks/queue/${TASK_ID}.md" ]; then
  echo "pre-task: task file not found: tasks/queue/${TASK_ID}.md" >&2
  exit 2
fi

# Move queue → active
mv "tasks/queue/${TASK_ID}.md" "tasks/active/${TASK_ID}.md"

# Log event
mkdir -p "$(dirname "$LOG_FILE")"
echo "| ${TIMESTAMP} | START  | ${TASK_ID} | ${AGENT} |" >> "$LOG_FILE"

exit 0
