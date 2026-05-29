#!/usr/bin/env bash
# Create a new task file in tasks/queue/
# Usage: ./tools/scripts/new-task.sh <title> <agent> [priority]

set -euo pipefail

TITLE="${1:?Usage: new-task.sh <title> <agent> [priority]}"
AGENT="${2:?Usage: new-task.sh <title> <agent> [priority]}"
PRIORITY="${3:-medium}"
TIMESTAMP=$(date -u +"%Y%m%d_%H%M%S")
ID="task_${TIMESTAMP}"
FILE="tasks/queue/${ID}.md"

cat > "$FILE" <<EOF
---
id: ${ID}
title: "${TITLE}"
description: ""
status: queue
priority: ${PRIORITY}
agent: ${AGENT}
workflow: ""
created_at: $(date -u +"%Y-%m-%dT%H:%M:%SZ")
updated_at: $(date -u +"%Y-%m-%dT%H:%M:%SZ")
depends_on: []
inputs: {}
output_path: "output/${ID}_result.md"
---

## Notes

<!-- Add context here -->
EOF

echo "Created: $FILE"
