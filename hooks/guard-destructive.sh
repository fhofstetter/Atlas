#!/usr/bin/env bash
# PreToolUse guard — blocks destructive Bash commands.
#
# Reads PreToolUse JSON from stdin (Claude Code hook protocol).
# Exit 2 = blocking (halts the tool call).
# Exit 0 = allow.
#
# Official docs: https://docs.anthropic.com/en/docs/claude-code/hooks
# CRITICAL: exit 1 is NON-blocking. Use exit 2 to enforce policy.

set -euo pipefail

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

if [ -z "$COMMAND" ]; then
  exit 0
fi

# Block patterns
BLOCKED_PATTERNS=(
  'rm -rf'
  'rm -fr'
  'git push --force'
  'git push -f'
  'git reset --hard'
  'DROP TABLE'
  'DROP DATABASE'
  ':(){:|:&};:'   # fork bomb
)

for PATTERN in "${BLOCKED_PATTERNS[@]}"; do
  if echo "$COMMAND" | grep -qF "$PATTERN"; then
    # Return structured JSON denial (official PreToolUse output format)
    jq -n \
      --arg reason "Blocked by Atlas guard: destructive pattern detected — '$PATTERN'" \
      '{
        hookSpecificOutput: {
          hookEventName: "PreToolUse",
          permissionDecision: "deny",
          permissionDecisionReason: $reason
        }
      }'
    exit 2
  fi
done

exit 0
