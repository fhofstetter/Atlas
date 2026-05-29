#!/usr/bin/env bash
# Atlas Price Tracker — scheduled check script.
# Run manually or add to Windows Task Scheduler.
#
# Windows Task Scheduler setup:
#   Program: C:\Program Files\Git\bin\bash.exe
#   Arguments: -c "\"C:/Data/Projects/code/Atlas/tools/scripts/check-prices.sh\""
#   Start in: C:\Data\Projects\code\Atlas

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
TRACKER_DIR="${PROJECT_ROOT}/tools/price-tracker"
LOG_DIR="${PROJECT_ROOT}/logs"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
DATE=$(date -u +"%Y%m%d")
SESSION_LOG="${LOG_DIR}/sessions/${DATE}.md"

mkdir -p "${LOG_DIR}/sessions"
echo "| ${TIMESTAMP} | START  | check-prices | price-tracker |" >> "${SESSION_LOG}"

if [ ! -d "${TRACKER_DIR}/node_modules" ]; then
  echo "[check-prices] Installing dependencies..."
  (cd "${TRACKER_DIR}" && npm install --silent)
fi

echo "[check-prices] Running price check at ${TIMESTAMP}..."
node "${TRACKER_DIR}/index.js" check-all 2>&1

STATUS=$?

if [ $STATUS -eq 0 ]; then
  echo "| ${TIMESTAMP} | COMPLETED | check-prices | price-tracker |" >> "${SESSION_LOG}"
  echo "[check-prices] Done. Check logs/alerts.md for any alerts."
else
  echo "| ${TIMESTAMP} | FAILED    | check-prices | price-tracker |" >> "${SESSION_LOG}"
  echo "[check-prices] ERROR: price check exited with status ${STATUS}" >&2
  exit $STATUS
fi
