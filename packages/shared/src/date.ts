// Local-calendar-day date string (YYYY-MM-DD), deliberately NOT using
// toISOString() — that converts to UTC first, which silently shifts the date
// by a day in any timezone ahead of UTC (e.g. IST) whenever the UTC offset
// crosses midnight. Every "what day is it" computation in this app (seeding,
// slot lookups, cron transitions, analytics windows) must agree on the same
// day, so they all funnel through this one function.
export function localDateStr(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function addDaysLocal(d: Date, days: number): Date {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + days);
  return copy;
}

export function currentHHMM(d: Date = new Date()): string {
  return d.toTimeString().slice(0, 5);
}

// A slot is "past" once its own start time has already been reached — used
// to keep already-elapsed time-of-day slots for today out of recommendations
// and off the booking wizard, rather than offering something no one could
// actually show up on time for.
export function isSlotPast(date: string, startTime: string, now: Date = new Date()): boolean {
  const today = localDateStr(now);
  if (date < today) return true;
  if (date > today) return false;
  return startTime <= currentHHMM(now);
}
