---
name: fitness-log
description: Log workouts and measurements, track progress toward fitness goals
argument-hint: "[add|list|weight <kg>|goals|goal add]"
allowed-tools: Read, Write, Bash
---

Log fitness data in `data/health/fitness-log.json` and goals in `data/health/health-goals.json`. LOCAL ONLY.

## Argument Parsing

- No argument or `add` — log a workout (interactive)
- `list` — show last 14 workouts as a table
- `weight <kg>` — log a weight measurement
- `goals` — show fitness goals with progress
- `goal add` — add a new fitness goal

## Schema for a workout entry

```json
{
  "date": "YYYY-MM-DD",
  "type": "run|walk|cycle|gym|swim|yoga|other",
  "duration_min": 0,
  "distance_km": null,
  "notes": "",
  "weight_kg": null
}
```

## Schema for a measurement entry

```json
{
  "date": "YYYY-MM-DD",
  "weight_kg": 0.0,
  "notes": ""
}
```

## Schema for a health goal

```json
{
  "id": "hgoal_YYYYMMDD_NNN",
  "title": "",
  "type": "weight|distance|frequency|habit",
  "target_value": null,
  "target_unit": "",
  "current_value": null,
  "target_date": null,
  "status": "active",
  "notes": ""
}
```

## Interactive add questions (workout)

1. "What type of workout? (run/walk/cycle/gym/swim/yoga/other)"
2. "How long in minutes?"
3. "Distance in km? (Enter to skip)"
4. "Any notes?"
5. "Weight today in kg? (Enter to skip)"

## Rules

- All data LOCAL ONLY — no external APIs
- Show workouts as table: Date | Type | Duration | Distance | Notes
- Show goals as table: ID | Title | Type | Target | Current | Target Date | Status
