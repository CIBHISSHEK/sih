"""Shared feature normalisation + vocab so train.py and main.py never drift apart."""

CROPS = ["paddy", "wheat", "maize", "cotton", "sugarcane"]
MOISTURE_SENSITIVE_CROPS = {"paddy"}

RAINFALL_MAX = 150.0
DAYS_SINCE_HARVEST_MAX = 15.0

RISK_LOW_MAX = 0.33
RISK_MEDIUM_MAX = 0.66


def risk_level_for(score: float) -> str:
    if score < RISK_LOW_MAX:
        return "LOW"
    if score < RISK_MEDIUM_MAX:
        return "MEDIUM"
    return "HIGH"


def crop_one_hot(crop: str) -> dict:
    crop = crop.lower().strip()
    if crop not in CROPS:
        crop = "paddy"  # unseen crop -> conservative default (most moisture-sensitive)
    return {f"crop_{c}": (1.0 if c == crop else 0.0) for c in CROPS}


def risk_feature_row(rainfall_7d_mm: float, avg_humidity_pct: float, days_since_harvest: float, storage_open: int, crop: str) -> dict:
    row = {
        "rainfall_norm": min(rainfall_7d_mm, RAINFALL_MAX) / RAINFALL_MAX,
        "humidity_norm": max(0.0, min(avg_humidity_pct, 100.0)) / 100.0,
        "days_since_harvest_norm": min(days_since_harvest, DAYS_SINCE_HARVEST_MAX) / DAYS_SINCE_HARVEST_MAX,
        "storage_open": float(storage_open)
    }
    row.update(crop_one_hot(crop))
    return row


RISK_FEATURE_COLUMNS = ["rainfall_norm", "humidity_norm", "days_since_harvest_norm", "storage_open"] + [f"crop_{c}" for c in CROPS]

WAIT_FEATURE_COLUMNS = ["queue_length", "avg_processing_time_min", "remaining_capacity_pct", "hour_of_day", "day_of_week", "quantity_qtl"]


def congestion_multiplier(hour_of_day: int) -> float:
    if hour_of_day in (9, 10, 11):
        return 1.3
    if hour_of_day in (14, 15):
        return 1.2
    if hour_of_day in (12, 13):
        return 0.8
    return 1.0
