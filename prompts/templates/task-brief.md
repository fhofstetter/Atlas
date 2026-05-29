# Task Brief Template

Use this template when briefing an agent on a task.

---

**Task ID:** {{ task.id }}
**Agent:** {{ task.agent }}
**Priority:** {{ task.priority }}

## Objective

{{ task.description }}

## Inputs

{{ task.inputs | yaml }}

## Output

Write your result to: `{{ task.output_path }}`

## Constraints

{{ task.notes }}

## Context

{{ memory_context }}

---
