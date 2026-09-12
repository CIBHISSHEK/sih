// Weights and constants for the dynamic allocation algorithm.
// Tune here without touching allocation.ts logic.

export const SCORING_WEIGHTS = {
  W_DISTANCE: 0.35,
  W_CAPACITY: 0.3,
  W_QUEUE: 0.15,
  W_WAIT: 0.2
};

export const EXPECTED_MAX_QUEUE = 25;
export const MAX_ACCEPTABLE_WAIT = 180; // minutes
export const DEFAULT_RADIUS_KM = 40;
export const SLOT_SPREAD_PENALTY_THRESHOLD = 0.7; // slots above 70% filled get penalised

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export const RISK_THRESHOLDS = {
  LOW_MAX: 0.33,
  MEDIUM_MAX: 0.66
};
