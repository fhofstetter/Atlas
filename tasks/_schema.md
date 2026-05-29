---
# Task Schema — copy this file to create a new task
id: ""                  # unique id, e.g. task_20260428_001
title: ""               # short title
description: ""         # full description of what needs to be done
status: queue           # queue | active | completed | failed
priority: medium        # low | medium | high | critical
agent: ""               # agent slug to execute this task
workflow: ""            # optional: workflow this task belongs to
created_at: ""          # ISO 8601 timestamp
updated_at: ""          # ISO 8601 timestamp
depends_on: []          # list of task ids that must complete first
inputs: {}              # key-value inputs for the agent
output_path: ""         # where the agent should write its result
---

## Notes

<!-- Any additional context, constraints, or background for the agent -->
