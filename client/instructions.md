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

### 2. Loading/error polish on the 5 scan pages
Confirm each scan page (especially `scan/footprint`, which can take up to
2 minutes) has a clear "scanning…" state so it doesn't look frozen, and a
visible error message if the request fails or times out.

---

## Priority Features (Do These Next, In Order)

These are the top 3 features to push this from "working" to "a real digital
footprint tracker." All three are buildable entirely in `/client` — no new
backend endpoints needed, so you're not blocked waiting on anyone.

### Feature 1 — Result detail page
Right now dashboard cards are `cursor-pointer` but don't link anywhere.

- Add `app/dashboard/[id]/page.jsx`
- On load, call `getResultById` (add this one function to `lib/api.js` — it's
  just `api.get('/api/results/:id')`, same pattern as `getResults`)
- Render the existing `ResultCard` component with the fetched result
- Wrap each card in `app/dashboard/page.jsx` in a `<Link href={`/dashboard/${result._id}`}>`
- Handle the 404 case (bad/deleted id) with a simple "not found" message

This is the smallest of the three and unblocks the other two, since both
also need a way to view a single past scan.

### Feature 2 — Exposure trend over time (footprint scans)
The point of a *tracker* is watching exposure change across repeated scans of
the same identity, not just one-off snapshots. You don't need a new backend
endpoint for this — `GET /api/results` already returns every saved scan with
`inputType`, `inputValue`, `riskScore`, and `createdAt`.

- New page: `app/scan/footprint/history/page.jsx` (or a tab inside the
  existing footprint page)
- Add an input for username/email, fetch `getResults(100)` client-side, and
  filter to `inputType === 'footprint' && inputValue === thatInput`
  (normalize case/whitespace the same way `footprintScanner.js` does —
  lowercase + trim)
- Sort by `createdAt` ascending and plot `riskScore` (exposure) over time —
  a simple SVG line/bar chart is enough, no charting library needed (see
  the existing gauge SVGs in `scan/footprint/page.jsx` for the pattern
  already used in this codebase)
- If there's only one scan for that identity, show a message like "Scan
  again later to start tracking your exposure trend" instead of an empty chart

### Feature 3 — Actionable cleanup checklist per platform
Turns a footprint scan from "here's what we found" into "here's what to do
about it." Fully client-side, no backend change needed.

- In `scan/footprint/page.jsx`, next to each platform card in "Confirmed
  Platform Detections," add a checkbox: "I've removed/secured this account"
- Persist checked state in `localStorage`, keyed by `${result._id}_${platform}`
  (or by username+platform if you want it to persist across re-scans of the
  same identity)
- Show a small progress indicator ("3 of 8 platforms addressed") above the
  platform list
- Optional stretch: maintain a static map of common deactivation URLs
  (`{ github: 'https://github.com/settings/admin', instagram: '...', ... }`)
  and show a "Manage this account →" link per platform when one exists,
  falling back to the profile URL already returned by the scanner otherwise

---

## Lower-Priority / Nice-to-Haves (only if time allows after the 3 above)
- Pagination or "load more" on dashboard history (`getResults(limit)` has no
  paging yet)
- Filter dashboard history by `inputType` or risk level
- Auto-refresh dashboard after a scan completes (redirect to dashboard
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
