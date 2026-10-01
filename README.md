# Custody Schedule — Olin & Anders, 2026-27

Interactive proposal tool for the boys' custody calendar across the 2026-27 Wake County school year. Built to share with the other parent for review and counter-proposals.

## What it does

- **Calendar tab** — visual day-by-day plan for the 365-day window from Aug 23, 2026 → Aug 22, 2027. Color-coded: NC (Mom, green), UT (Dad, blue), Dad-visiting-NC (striped purple/green), travel (orange).
- **Flights tab** — derives flight rows from the calendar (Boys + Dave). Record airline, flight number, confirmation, departure/arrival times with time zones, seats, cost, notes, and status. Override the flight date, airports, and traveler label without changing calendar assignments. Enter shared round-trip costs only once. Use **Save Draft** after editing to share flight details with the calendar; JSON exports/imports include them too. Older drafts without flight details retain the current browser's metadata.
- **Drafts** — opens the most recently saved calendar by `savedAt` across cloud and browser drafts. Falls back to a valid local save or the baseline when cloud drafts are unavailable. Paint days to revise the proposal, save named drafts, export/import JSON, and share with the other parent.

## Project layout

```
.
├── public/
│   └── index.html               # the app (single-file, vanilla JS)
├── data/
│   ├── custody-dad-proposal-starting-idea-2026-04-30.json   # seed proposal
│   ├── proposed-schedule-2026-27.csv                        # day-by-day CSV
│   └── school-calendar-2026-27.csv                          # Wake County events
├── source/
│   └── *.pdf                    # original Wake County calendars
├── server.js                    # Express server (Replit DB integration)
├── package.json
└── .replit                      # Replit boot config
```

## Running locally

```bash
npm install
npm start
# open http://localhost:3000
```

The app works without a server too — open `public/index.html` directly in a browser. The server only adds cloud-shared drafts via Replit DB (otherwise drafts are in browser localStorage and exportable as JSON).

## Running on Replit

Import this repo into Replit. The `.replit` config runs `npm install && npm start`. The starting-bid JSON in `data/` gets seeded into Replit DB on first boot. Visitors automatically see the newest available saved calendar; older drafts remain available in the Load draft dropdown. A slow cloud response will not replace edits or a calendar the visitor has already selected, imported, or reset.

## Updating the proposal

The baseline schedule is defined inline in `public/index.html` in the `buildBaseline()` function. Edit the date ranges there. The CSV and JSON files in `data/` are derived artifacts — regenerate them by exporting JSON from the running app, or update them manually to keep in sync.

## Sharing a draft with the other parent

Two paths:
1. **Cloud (Replit)**: in the app, Save Draft → the other parent opens the Replit URL → the newest save opens automatically (or they can select an older draft from the dropdown).
2. **File (email)**: in the app, Save Draft → Export JSON → attach to email. Other parent opens the URL → Import JSON.
