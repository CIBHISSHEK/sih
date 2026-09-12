# Demo Script (~4 minutes)

Setup before the jury arrives:
1. `npm run dev` — wait for all three services (`api`, `web`, `ml`) to report ready.
2. Open **two browser windows side by side**: one on `/login` (farmer), one on `/login` (staff or admin).
3. If anything looks off, hit **Reset demo** on the admin dashboard (or `POST /api/demo/reset`) — restores clean seeded state in ~1s.

---

### 1. The problem (20s)
"Farmers show up at procurement centres with no idea how long they'll wait, no warning their produce might get rejected, and no visibility into payment status. We built a system that fixes all three — and it has to work with no internet and no smartphone, because that's the reality at these centres."

### 2. Smart booking — the hero feature (60s)
- Window 1: log in as farmer (any phone, e.g. `9876543210`, OTP is pre-filled — **demo mode**, no SMS needed).
- New user → fill the one-screen profile → land on farmer home.
- **Book a slot** → pick paddy, 10 quintals, today.
- Fill harvest details (3 days since harvest, open storage) → **quality risk pre-check** appears with a colour-coded level and the contributing factors — "this is what the farmer sees *before* they travel."
- Continue to **recommendations** → point out the ranked list, the score, and tap **"Why this centre?"** — the weighted breakdown renders live. "This isn't a black box — a jury or an official can see exactly why centre A beat centre B."
- Confirm the booking → token number + arrival OTP shown large, "this is what the farmer shows at the gate."

### 3. Steering load away from a busy centre (30s)
- Switch to the admin window → **Demo controls → Simulate rush** on the same centre the farmer just booked.
- Switch back to the farmer window → run the booking wizard again with the same inputs → the rushed centre has visibly dropped in rank / score. "The algorithm reacts to live load, not a static timetable."

### 4. Staff flow + realtime sync (50s)
- Staff window → select the centre → find the booking just made.
- **Verify Arrival** with the OTP shown on the farmer's confirmation screen.
- Farmer window (leave it open, don't refresh) → the status timeline updates **live** via WebSocket the instant staff verifies.
- Staff: **Start Processing** → **Complete** (enter final qty, a small rejected qty) → farmer window updates again instantly, and a notification appears in the farmer's feed.
- Mention: "Payment is queued asynchronously right now — the queue never waits on it," then point at the payment status flipping to PAID a few seconds later on its own.

### 5. Voice booking, fully offline (40s)
- Farmer home → **Book by voice**.
- Speak (or type, if mic access isn't available on the demo machine) through: language → crop → quantity → harvest days → storage → date → confirm.
- "This runs entirely on the browser's built-in speech engine in demo mode — no internet, no API key. Swap one environment variable and it's backed by Sarvam AI's multilingual STT/TTS for production."

### 6. Government analytics (30s)
- Admin window → walk through the KPI cards, the 7-day arrivals forecast, 14-day utilisation, and rejection-by-crop chart — "all populated from 21 days of seeded history, so this is what a district officer sees on day one, not an empty dashboard."
- Point at a centre flagged **near capacity** in the live table.

### 7. Resilience close (20s)
- Kill the ML process in the terminal (or mention it) → repeat a risk-check or recommendation call → point out the response still works, now labelled `"source": "fallback"`. "Every prediction in this system is labelled honestly, and nothing here crashes when a dependency goes down."
- **Reset demo** to leave it clean for the next group.

---

## Fallback talking points if something breaks live
- Blank chart / no data → hit **Reset demo**.
- ML service not responding → the app already degrades gracefully; call it out as a feature, not a bug.
- No microphone on the demo machine → use the text input in the voice screen, same state machine either way.
