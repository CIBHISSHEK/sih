# Progress Log

## Phase 0 — Scaffold ✅
Monorepo (`apps/api`, `apps/web`, `apps/ml`, `packages/shared`), Tailwind, Prisma, root `dev`/`seed`/`build` scripts, health endpoints for api and ml, `.env.example`.
Verified: `npm install && npm run dev` starts api (4000), web (5173), ml (8000) together; `/api/health` and ML `/health` both respond.

## Phase 1 — Data + seed ✅
Full Prisma schema (`prisma/schema.prisma`), migration applied, `prisma/seed.ts`:
- 5 centres in Thanjavur district (real-ish coordinates, capacities 400–1200 qtl)
- 30 farmers, 5–45km spread, mixed languages (ta/hi/te/en)
- Hourly slots 08:00–17:00 for a 26-day window (21 days back, 5 forward)
- 21 days of historical completed/paid bookings (~8% rejection, some payment-SLA breaches)
- ~18 live bookings today spanning all 8 statuses
Verified: `npm run seed` completes in ~1.1–1.5s; Prisma Studio shows populated tables.
**Bug found + fixed during this phase**: a UTC-vs-local date mismatch shifted "today's" seeded bookings onto the wrong calendar day in timezones ahead of UTC. Fixed with a shared `localDateStr()` helper — see `DECISIONS.md`.

## Phase 2 — Auth + booking + scoring ✅
OTP/JWT auth (mock OTP `123456`), `requireAuth`/`requireRole` middleware, full normalised recommendation scoring with breakdown, transactional booking with capacity re-check, farmer wizard UI.
Verified via curl end-to-end: OTP login → register → recommendations (ranked, `source: "ml"`) → risk-check → booking creation (token + OTP generated, capacity decremented). Confirmed a **Simulate rush** on a centre visibly drops its rank on the next `/api/recommendations` call.

## Phase 3 — Staff flow + realtime ✅
Staff screens, OTP arrival verification → processing → completion, Socket.IO `queue:update`/`booking:status`/`notification:new`, position-3 "approaching" notification (deduped via `notifiedApproaching`), async payment job decoupled from the queue.
Verified via curl: verify-arrival (wrong OTP rejected, correct OTP accepted) → start-processing → complete → payment flips to `PAID` a few seconds later without blocking the queue.

## Phase 4 — ML service ✅
`train.py` generates ~5,000 synthetic rows per model (GradientBoostingRegressor for wait time, LogisticRegression for risk with interpretable coefficients), FastAPI `/predict-wait` + `/predict-risk` + `/health`, Node client with timeout + fallback, Open-Meteo weather client with 30-min cache and offline seasonal fallback.
Verified: trained models load and predict correctly; **killed the ML process live** and confirmed `/api/recommendations` and `/api/risk-check` both kept responding, now tagged `"source": "fallback"`, with `/api/health` honestly reporting `"ml": "down (using fallback formulas)"`.

## Phase 5 — Analytics ✅
Admin aggregation endpoints (overview, forecast, utilisation, rejections, centres) reading from `Booking` joined to `Slot.date`.
Verified: all endpoints return populated data against the 21-day seed with no empty-state charts.

## Phase 6 — Voice ✅
Fixed-state conversation machine (`LANGUAGE → CROP → QUANTITY → DAYS_SINCE_HARVEST → STORAGE → DATE → CONFIRM_RECOMMENDATION → DONE`), prompt JSON per language (en/hi/ta/te), keyword + numeral extractors, mock provider (browser Web Speech API) as default with a Sarvam adapter behind `VOICE_PROVIDER=sarvam`. Booking on "yes" reuses the exact same `createBooking` service as the REST endpoint — no duplicated logic.
Verified end-to-end via curl: a full session (language → ... → "yes") produced a real confirmed booking with token + OTP, entirely offline.

## Phase 7 — Demo hardening ✅
`/api/demo/reset` (admin-only, ~1.1s, shells out to the seed script), `/api/demo/advance/:centreId`, `/api/demo/rush/:centreId`; `DEMO_SCRIPT.md`; `README.md` with mermaid architecture diagram; React `ErrorBoundary`; loading states throughout the wizard/staff/admin screens; ML synthetic-data caveat surfaced in the risk pre-check UI.
Verified: fresh-clone path (`npm install && npm run seed && npm run dev`) confirmed working with no API keys.

## Known trade-offs
See `DECISIONS.md` for the full list (Windows `cmd.exe` path handling, the local-date bug and fix, `@msp/shared` runtime-import bundling issue, `EventLog` left unused in favour of reading straight from `Booking`).
