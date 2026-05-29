---
name: travel
description: Plan holidays — flights, hotels, car routes with Google Maps links, trains, ferries, weather by region, packing list, adaptive on-the-ground suggestions
argument-hint: "[plan <dest>|list|weather <dest>|route <id>|suggest <id>|packing <id>|done <id>]"
allowed-tools: Read, Write, WebSearch, WebFetch, Agent
---

Manage travel plans in `data/travel/trips.json`. Delegates all research to `travel-agent`.

## Arguments

- No arg / `list` — table: ID | Name | Destination | Dates | Mode | Status | Budget CHF
- `plan <destination>` — interactive new trip planner
- `weather <destination>` — current + 7-day forecast + seasonality verdict
- `route <trip-id>` — plan car route with Google Maps link, fuel cost, vignettes, tolls
- `suggest <trip-id>` — AI improvements + gap analysis for existing trip
- `packing <trip-id>` — generate or review packing list
- `done <trip-id>` — mark trip completed

## plan <destination> interactive flow

Ask in order:
1. "Trip name? (e.g. 'Summer Croatia 2026')"
2. "Dates or month? (e.g. '10–24 August' or 'August 2026')"
3. "How many travelers?"
4. "Budget in CHF (total for the trip)?"
5. "Trip style? beach / city / culture / adventure / nature / road trip / mixed"
6. "How are you travelling? flight / car / train / ferry / mixed"

Then delegate to `travel-agent`:
- Weather + seasonality for destination + period (using correct regional weather source)
- Itinerary outline (cities to visit, days per city)
- If flight: 3 options from ZRH
- If car: Google Maps route with recommended stops + vignette/fuel/toll notes

Create trip entry in `data/travel/trips.json` with `status: "planning"`.
Show research summary + ask: "What to tackle next? (flights / hotels / car route / activities / packing)"

## route <trip-id>

Delegate to travel-agent:
1. Ask origin (default: Zurich, Switzerland) and ordered list of stops/cities
2. Build Google Maps URL: `https://www.google.com/maps/dir/<origin>/<stop1>/.../<dest>`
3. Show: total distance, drive time, fuel cost (ask consumption if unknown, default 7L/100km), vignettes needed, toll estimate
4. Save to trip's `road_trips` array

## weather <destination>

Delegate to travel-agent using correct regional source.
Return: current conditions, 7-day forecast, monthly seasonal averages, "Good / OK / Risky" travel verdict.

## suggest <trip-id>

Read trip. Delegate to travel-agent:
- Itinerary improvements (better city order, hidden gems, worthwhile day trips)
- Unbooked gaps (nights without accommodation, legs without transport)
- Local tips per city
- Budget status: estimated total vs budget_chf

## packing <trip-id>

Read trip. Delegate to travel-agent — generate grouped list based on destination, season (from weather forecast), activities, transport mode.
Save to trip's `packing_list` array (all items with `packed: false`).
Display grouped: documents / car kit / clothing / health / tech / money.
Second call: show existing list and let user mark items as packed.

## New trip schema

```json
{
  "id": "trip_YYYYMMDD_NNN",
  "name": "",
  "status": "planning",
  "destination": "",
  "cities": [],
  "origin": "Zurich, Switzerland",
  "start_date": null,
  "end_date": null,
  "travelers": 1,
  "budget_chf": null,
  "spent_chf": 0,
  "style": "mixed",
  "transport_mode": "flight",
  "flights": [],
  "accommodation": [],
  "transport": [],
  "road_trips": [],
  "activities": [],
  "packing_list": [],
  "suggestions": [],
  "notes": "",
  "created_at": "",
  "updated_at": ""
}
```

## Rules
- Never book — options + URLs only
- Update `updated_at` on every write, validate JSON after
- Google Maps URLs: `https://www.google.com/maps/dir/City+Name,+Country/Next+City,+Country`
- Fuel default: 7L/100km, CHF 1.80/L (update if user provides their car's consumption)
