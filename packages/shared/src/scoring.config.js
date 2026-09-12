"use strict";
// Weights and constants for the dynamic allocation algorithm.
// Tune here without touching allocation.ts logic.
Object.defineProperty(exports, "__esModule", { value: true });
exports.RISK_THRESHOLDS = exports.SLOT_SPREAD_PENALTY_THRESHOLD = exports.DEFAULT_RADIUS_KM = exports.MAX_ACCEPTABLE_WAIT = exports.EXPECTED_MAX_QUEUE = exports.SCORING_WEIGHTS = void 0;
exports.clamp = clamp;
exports.SCORING_WEIGHTS = {
    W_DISTANCE: 0.35,
    W_CAPACITY: 0.3,
    W_QUEUE: 0.15,
    W_WAIT: 0.2
};
exports.EXPECTED_MAX_QUEUE = 25;
exports.MAX_ACCEPTABLE_WAIT = 180; // minutes
exports.DEFAULT_RADIUS_KM = 40;
exports.SLOT_SPREAD_PENALTY_THRESHOLD = 0.7; // slots above 70% filled get penalised
function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}
exports.RISK_THRESHOLDS = {
    LOW_MAX: 0.33,
    MEDIUM_MAX: 0.66
};
