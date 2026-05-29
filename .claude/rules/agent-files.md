---
paths:
  - ".claude/agents/**"
  - "agents/**"
---

# Agent File Rules

- Every agent file must have `name` and `description` frontmatter (both required
  per official Claude Code subagent spec).
- `name` must be lowercase letters and hyphens only, max 64 characters.
- `description` must explain WHEN Claude should delegate to this agent (not just
  what it does). Include "Use proactively when..." to encourage automatic
  delegation.
- `tools` should be an allowlist — grant only the tools the agent actually needs.
- `model` must be one of: `sonnet`, `opus`, `haiku`, or a full model ID from
  `config/models.yaml`. Use `inherit` only when the parent model is intentional.
- `permissionMode: plan` for read-only agents (planner, reviewer).
- `permissionMode: acceptEdits` for agents that write files (coder, writer).
- Agent body = system prompt. Keep it focused and single-purpose.
