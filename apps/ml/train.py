"""
Generates rule-based synthetic training data (with gaussian noise) and fits
two lightweight models used by the demo:

  - wait_model.pkl   GradientBoostingRegressor predicting queue wait time
  - risk_model.pkl   LogisticRegression predicting rejection risk

These are bootstrapped on synthetic data for the hackathon demo and would be
retrained on real procurement history in production. Run via `npm run
ml:setup` (invoked automatically by `npm install` at the repo root), or
directly with `python train.py`.
"""
import random
import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.linear_model import LogisticRegression
import joblib

from feature_utils import (
    CROPS, MOISTURE_SENSITIVE_CROPS, RAINFALL_MAX, DAYS_SINCE_HARVEST_MAX,
    risk_feature_row, RISK_FEATURE_COLUMNS, WAIT_FEATURE_COLUMNS, congestion_multiplier
)

random.seed(42)
np.random.seed(42)

N_WAIT = 5000
N_RISK = 5000


def generate_wait_data(n: int) -> pd.DataFrame:
    rows = []
    for _ in range(n):
        queue_length = np.random.randint(0, 26)
        avg_processing_time_min = np.random.uniform(8, 20)
        remaining_capacity_pct = np.random.uniform(0, 1)
        hour_of_day = np.random.randint(8, 17)
        day_of_week = np.random.randint(0, 7)
        quantity_qtl = np.random.uniform(2, 30)

        base = queue_length * avg_processing_time_min * congestion_multiplier(hour_of_day)
        capacity_penalty = 1 + (1 - remaining_capacity_pct) * 0.3
        true_wait = base * capacity_penalty + quantity_qtl * 0.5
        noisy_wait = max(0.0, true_wait + np.random.normal(0, 10))

        rows.append({
            "queue_length": queue_length,
            "avg_processing_time_min": avg_processing_time_min,
            "remaining_capacity_pct": remaining_capacity_pct,
            "hour_of_day": hour_of_day,
            "day_of_week": day_of_week,
            "quantity_qtl": quantity_qtl,
            "wait_min": noisy_wait
        })
    return pd.DataFrame(rows)


def generate_risk_data(n: int) -> pd.DataFrame:
    rows = []
    for _ in range(n):
        rainfall_7d_mm = np.random.uniform(0, RAINFALL_MAX)
        avg_humidity_pct = np.random.uniform(30, 95)
        days_since_harvest = np.random.uniform(0, DAYS_SINCE_HARVEST_MAX)
        storage_open = np.random.choice([0, 1])
        crop = np.random.choice(CROPS)

        features = risk_feature_row(rainfall_7d_mm, avg_humidity_pct, days_since_harvest, storage_open, crop)

        logit = (
            2.2 * features["rainfall_norm"]
            + 1.8 * features["humidity_norm"]
            + 1.6 * features["days_since_harvest_norm"]
            + 1.2 * features["storage_open"]
            + (0.8 if crop in MOISTURE_SENSITIVE_CROPS else 0.0)
            - 2.8  # offset so an "average" case sits near LOW/MEDIUM boundary
        )
        prob = 1 / (1 + np.exp(-logit))
        label = 1 if np.random.random() < prob else 0

        row = dict(features)
        row["rejected"] = label
        rows.append(row)
    return pd.DataFrame(rows)


def train_wait_model():
    print(f"Generating {N_WAIT} synthetic wait-time rows...")
    df = generate_wait_data(N_WAIT)
    X = df[WAIT_FEATURE_COLUMNS]
    y = df["wait_min"]

    model = GradientBoostingRegressor(n_estimators=150, max_depth=3, learning_rate=0.08, random_state=42)
    model.fit(X, y)

    residuals = y - model.predict(X)
    residual_std = float(np.std(residuals))

    joblib.dump({"model": model, "residual_std": residual_std, "columns": WAIT_FEATURE_COLUMNS}, "wait_model.pkl")
    print(f"Saved wait_model.pkl (residual_std={residual_std:.1f} min)")


def train_risk_model():
    print(f"Generating {N_RISK} synthetic risk rows...")
    df = generate_risk_data(N_RISK)
    X = df[RISK_FEATURE_COLUMNS]
    y = df["rejected"]

    model = LogisticRegression(max_iter=1000)
    model.fit(X, y)

    joblib.dump({"model": model, "columns": RISK_FEATURE_COLUMNS}, "risk_model.pkl")
    print(f"Saved risk_model.pkl (train accuracy={model.score(X, y):.2f})")


if __name__ == "__main__":
    train_wait_model()
    train_risk_model()
    print("Training complete. Both models are synthetic-trained bootstraps — retrain on real procurement history for production use.")
