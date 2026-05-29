---
name: sleep-log
description: Log last night's sleep, view trends, and get myofunctional exercise reminders for mild sleep apnea
argument-hint: "[add|list|trend|exercises]"
allowed-tools: Read, Write, Bash
---

Log sleep data in `data/health/sleep-log.json`. DATA IS LOCAL ONLY — never sent anywhere.

## Argument Parsing

- No argument or `add` — log last night's sleep (interactive)
- `list` — show last 14 nights as a table
- `trend` — show 7-day averages: avg hours, avg quality, position breakdown
- `exercises` — show today's myofunctional exercises (rotates daily)

## Schema for a sleep entry

```json
{
  "date": "YYYY-MM-DD",
  "hours": 0.0,
  "quality": 1,
  "woke_up_times": 0,
  "position": "side|back|stomach|mixed",
  "alcohol": false,
  "notes": "",
  "exercises_done": [],
  "apnea_events_reported": 0
}
```

## Interactive add questions

Ask in order:
1. "What date? (YYYY-MM-DD, or press Enter for yesterday)"
2. "How many hours of sleep?"
3. "Sleep quality 1-5 (1=terrible, 5=excellent)?"
4. "How many times did you wake up?"
5. "What position did you mostly sleep in? (side/back/stomach/mixed)"
6. "Did you drink alcohol yesterday evening? (y/n)"
7. "Any notes?"

After logging, show today's exercise recommendation.

## Myofunctional Exercise Library

Rotate daily through these (use date % 3 to pick set):

**Set A (day % 3 == 0)**
- Tongue press: press tongue flat to roof of mouth, hold 5s, repeat 10 times
- Soft palate lift: say "ahh" and consciously lift the soft palate, hold 5s, repeat 10 times

**Set B (day % 3 == 1)**
- Cheek resistance: place finger inside cheek, push outward with finger while cheek resists, 10 reps each side
- Tongue slide: slide tongue tip from front teeth back along palate to soft palate, 20 reps

**Set C (day % 3 == 2)**
- Lip seal: press lips firmly together (not teeth), hold 10s, repeat 10 times
- Balloon breathing: breathe in through nose slowly, out through pursed lips, 5 reps — trains nasal breathing

## Post-log flags

- If position == "back": "Tip: side sleeping significantly reduces apnea events. Try a pillow barrier."
- If alcohol == true: "Alcohol relaxes throat muscles and worsens apnea — consider skipping before bed."
- If hours < 6: "Less than 6 hours is below restorative threshold. Aim for 7-9."

## Rules

- Never call any external API — all data stays local
- quality must be integer 1-5
- hours must be a float > 0
- Display trend as table: Date | Hours | Quality | Position | Woke Up | Exercises Done
