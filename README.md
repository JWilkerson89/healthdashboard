# Health Dashboard

A personal Garmin health dashboard over the `garmin_data.db` SQLite database
produced by the garmin-health-data pipeline. Read-only — the pipeline owns all
writes; this app only ever reads.

## Stack

- **Next.js 15** (App Router) + React 19 + TypeScript
- **MUI 6** + **MUI X Charts** for UI and graphs
- **better-sqlite3** reading the SQLite DB directly (synchronous, read-only)
- **react-leaflet** for activity GPS routes

## Surfaces

- **Dashboard** — latest daily summary + multi-week trends (HRV, sleep, resting
  HR, steps, body battery, stress) + recent activities
- **Activities** — list + detail (HR zones, HR-over-time, GPS route, strength sets)
- **Sleep** — list + detail (stage hypnogram, overnight HRV and SpO₂)
- **Labs** — blood panels grouped by date with reference ranges and HIGH/LOW flags
- **Body** — weight / body-fat / muscle-mass trends
- **Explorer** — raw minute-level time series (heart rate, stress, body battery,
  respiration, steps, intensity minutes, SpO₂, HRV) by day

## Linked records (note ⇄ asset)

`health_notes.linked_records` is a JSON array of string references in the form
`"<table>.<column>='<value>'"` (mostly date-keyed):

```json
["activity_summary.date='2026-06-02'", "blood_panels.date='2026-06-19'",
 "meals.date='2026-06-03'", "daily_health_summary.date='2026-06-02'"]
```

When a note references an asset, that asset surfaces a category-colored "linked
notes" chip that expands the note inline, plus a note dot on list rows and the
dashboard. Reference tables map to assets like so (`queries.ts` → `NoteIndex`):

| ref table | shows on |
|---|---|
| `activity_summary` / `activity` (by date) | activity detail, activities list, dashboard |
| `daily_health_summary` / `sleep` (by date) | sleep detail, sleep list |
| `blood_panels` (by date) | lab panel |
| `meals` (by date) | nutrition day |

Parsing is done in JS (not SQL `json_each`) so a single malformed row can't
break a page. The legacy `[{"type","id"}]` object form is also accepted. Empty
arrays render nothing.

## Running

```bash
npm install
# point at a DB copy (defaults to ./_ref/garmin_data.db)
echo 'GARMIN_DB_PATH=/path/to/garmin_data.db' > .env.local
npm run dev          # http://localhost:3000
```

Production:

```bash
npm run build
GARMIN_DB_PATH=/path/to/garmin_data.db PORT=3100 npm run start
```

## Deployment

Runs on the home server (DGX Spark) as a systemd service on port 3100, fronted
by `tailscale serve` on the tailnet (HTTPS, tailnet-only). `better-sqlite3` is a
native module, so production installs run `npm ci` on the host to compile its
binding for the host architecture.
