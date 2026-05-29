#!/usr/bin/env bash
# Print a summary of task counts per status folder.

set -euo pipefail

for STATUS in queue active completed failed; do
  COUNT=$(find "tasks/${STATUS}" -name "*.md" 2>/dev/null | wc -l | tr -d ' ')
  printf "%-12s %s\n" "${STATUS}:" "${COUNT}"
done
