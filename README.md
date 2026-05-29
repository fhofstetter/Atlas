# Atlas — All-Task Logic & Automation System

A Claude-native task orchestration system. Describe a goal; Atlas decomposes
it, routes subtasks to specialised agents, and delivers a unified result.

## Quick Start

```bash
# Open in Claude Code
claude .
```

Atlas loads `CLAUDE.md` automatically and is ready to receive goals.

## Architecture

```
Goal → Orchestrator → [ Planner → Agents ] → Output
                             ↓
                         Memory / Hooks / Logs
```

## Configuration

Edit `config/atlas.yaml` to set the active model and enable integrations.

## Documentation

See `CLAUDE.md` for the full system reference.
