---
name: run-workflow
description: Execute a named Atlas workflow from the workflows/ directory
argument-hint: "<workflow-name>"
arguments: workflow_name
allowed-tools: Read Write Bash Agent
effort: high
---

Execute the workflow named `$workflow_name`.

Steps:
1. Read `workflows/$workflow_name.yaml`. If it does not exist, list available
   workflows by reading the `workflows/` directory and ask the user to choose.
2. Display the workflow steps and ask the user to confirm before proceeding.
3. For each step in dependency order:
   a. Write a task file to `tasks/queue/<task-id>.md`.
   b. Run `bash hooks/pre-task.sh` (sets `ATLAS_TASK_ID` and `ATLAS_TASK_AGENT`).
   c. Dispatch the task to the correct subagent using the Agent tool.
   d. On success: run `bash hooks/post-task.sh` with `ATLAS_TASK_STATUS=completed`.
   e. On failure: run `bash hooks/on-error.sh`, set `ATLAS_TASK_STATUS=failed`,
      and stop the workflow unless `on_error: skip` is set for that step.
4. After all steps complete, display a summary table: step | agent | status | output path.
