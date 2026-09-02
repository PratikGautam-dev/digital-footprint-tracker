# Frontend — Handoff / What's Left

This replaces the old scaffolding instructions. Most of the original checklist
is done — this file is now a status report + exact task list for whoever picks
up `/client` next.

---

## Current State (as of this handoff)

Done and working:
- All 5 scan pages exist and call the **real backend** (not mock data):
  `app/scan/url`, `app/scan/email`, `app/scan/file`, `app/scan/identity`,
  `app/scan/footprint`
- `lib/api.js` has `scanURL`, `scanEmail`, `scanFile`, `scanIdentity`,
  `scanFootprint`, plus two new functions you should now use:
  `getResults(limit)` and `getStats()`
- `components/ResultCard.jsx`, `RiskBadge.jsx`, `ReasonsList.jsx`,
  `RecommendationsList.jsx` — all built and wired to the real API response
  shape (`riskScore`, `riskLevel`, `explanation`, `reasons`, `recommendations`)
- `app/dashboard/page.jsx` — **just rewired** off mock data. It now calls
  `GET /api/results` and `GET /api/stats` on mount. This is the newest change
  and the least battle-tested part of the app — treat it as a starting point,
  not finished.

Backend contract you can rely on (already implemented, don't need to touch):
- `POST /api/scan-url` `{ url }`
- `POST /api/scan-email` `{ emailText }`
- `POST /api/scan-file` `{ filename }`
- `POST /api/scan-identity` `{ input }`
- `POST /api/scan-footprint` `{ input }` (slow — OSINT/Shermilock, can take
  up to 2 min, `lib/api.js` already sets a 150s timeout for this one)
- `GET /api/results?limit=20` → array of saved `ScanResult` documents, newest
  first. Each has `_id`, `inputType`, `inputValue`, `riskScore`, `riskLevel`,
  `reasons`, `recommendations`, `explanation`, `metadata`, `createdAt`,
  `updatedAt` (timestamps come from Mongoose `timestamps: true`, **not** a
  field called `timestamp` — this bit the dashboard before, don't reintroduce it)
- `GET /api/results/:id` → single result, 404 if not found
- `GET /api/stats` → `{ totalScans, highRisk, mediumRisk, lowRisk }`

All responses are wrapped as `{ success: true, data: ... }` — `lib/api.js`
already unwraps `.data.data` for you, so components just get the raw shape.

---

## What's Actually Left To Do

### 1. Verify the dashboard rewire end-to-end
The dashboard was just switched from `mockResults` to real `getResults()` /
`getStats()` calls. Run a few real scans through each of the 5 scan pages,
then open `/dashboard` and confirm:
- Cards render with real data, sorted newest-first
- Stats row (Total Scans / High Risk / Low Risk) matches what's in Mongo
- Empty state still shows correctly on a fresh DB
- Error state shows if the backend is down (try stopping the server and
  reloading `/dashboard`)

### 2. Make a result clickable → detail view
Right now dashboard cards are `cursor-pointer` but don't link anywhere.
`GET /api/results/:id` already exists for this. Suggested: clicking a card
routes to `/dashboard/[id]` and renders full `ResultCard` (you already have
the component — it just needs a page and a fetch by id).

### 3. Loading/error polish on the 5 scan pages
Confirm each scan page (especially `scan/footprint`, which can take up to
2 minutes) has a clear "scanning…" state so it doesn't look frozen, and a
visible error message if the request fails or times out.

### 4. Pagination or "load more" on dashboard history
`getResults(limit)` currently defaults to 20 and there's no paging. Not
urgent, but flag it if the team wants full history browsing.

### 5. Nice-to-haves (only if time allows)
- Filter dashboard history by `inputType` (url/email/file/identity/footprint)
- Filter/sort by risk level
- Auto-refresh dashboard after a scan completes (e.g. redirect to dashboard
  post-scan, or a toast)

---

## Known Rough Edges (not yours to fix, just context)

- The footprint scanner shells out to a local Sherlock binary
  (`sherlock-env/Scripts/sherlock.exe`) and can be slow/flaky — if
  `scan/footprint` looks broken locally, check the backend console first
  before assuming it's a frontend bug.
- `server/*.txt` files (raw Sherlock output dumps) were cluttering `/server`
  and are now gitignored — if you see new ones appear locally after testing
  the footprint scanner, that's expected and fine to ignore.

---

## Rules (unchanged from before)

- Stay in `/client`. Don't touch `/server`, `/ai-engine`,
  `/threat-detection`, `/identity-privacy`, `/footprint`.
- Don't write scanning/risk logic — that's backend/AI-engine territory.
- Use `process.env.NEXT_PUBLIC_API_URL`, never hardcode the backend URL.
- Tailwind only, no external UI libraries.
- Questions about the API contract go to Pratik (backend/integration owner).
