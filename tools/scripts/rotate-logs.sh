#!/usr/bin/env bash
# Delete session log files older than 30 days.

set -euo pipefail

find logs/sessions -name "*.md" -mtime +30 -delete
find logs/errors   -name "*.md" -mtime +30 -delete
echo "Log rotation complete."
