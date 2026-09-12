import base64
import io
import os
from typing import Literal

import joblib
import numpy as np
from fastapi import FastAPI, HTTPException
from PIL import Image, ImageFilter
from pydantic import BaseModel

from feature_utils import risk_feature_row, risk_level_for, WAIT_FEATURE_COLUMNS, RISK_FEATURE_COLUMNS

app = FastAPI(title="MSP Procurement ML Service")

MODEL_DIR = os.path.dirname(os.path.abspath(__file__))
wait_bundle = None
risk_bundle = None


@app.on_event("startup")
def load_models():
    global wait_bundle, risk_bundle
    try:
        wait_bundle = joblib.load(os.path.join(MODEL_DIR, "wait_model.pkl"))
    except FileNotFoundError:
        wait_bundle = None
        print("wait_model.pkl not found — run `python train.py` (or `npm run ml:setup`) first.")
    try:
        risk_bundle = joblib.load(os.path.join(MODEL_DIR, "risk_model.pkl"))
    except FileNotFoundError:
        risk_bundle = None
        print("risk_model.pkl not found — run `python train.py` (or `npm run ml:setup`) first.")


class WaitFeatures(BaseModel):
    queue_length: float
    avg_processing_time_min: float
    remaining_capacity_pct: float
    hour_of_day: int
    day_of_week: int
    quantity_qtl: float


class RiskFeatures(BaseModel):
    rainfall_7d_mm: float
    avg_humidity_pct: float
    days_since_harvest: float
    storage_open: Literal[0, 1]
    crop: str


class PhotoQualityInput(BaseModel):
    image_base64: str
    crop: str = "paddy"


@app.get("/health")
def health():
    return {
        "status": "ok",
        "wait_model_loaded": wait_bundle is not None,
        "risk_model_loaded": risk_bundle is not None
    }


@app.post("/predict-wait")
def predict_wait(features: WaitFeatures):
    if wait_bundle is None:
        raise HTTPException(status_code=503, detail="wait_model not loaded")

    row = [[getattr(features, col) for col in WAIT_FEATURE_COLUMNS]]
    model = wait_bundle["model"]
    residual_std = wait_bundle["residual_std"]

    predicted = max(0.0, float(model.predict(row)[0]))
    lo = max(0.0, predicted - 1.28 * residual_std)
    hi = predicted + 1.28 * residual_std

    return {
        "predicted_wait_min": round(predicted, 1),
        "confidence_band": [round(lo, 1), round(hi, 1)]
    }


FACTOR_LABELS = {
    "rainfall_norm": "Recent rainfall",
    "humidity_norm": "Humidity",
    "days_since_harvest_norm": "Days since harvest",
    "storage_open": "Open storage"
}


@app.post("/predict-risk")
def predict_risk(features: RiskFeatures):
    if risk_bundle is None:
        raise HTTPException(status_code=503, detail="risk_model not loaded")

    row_dict = risk_feature_row(
        features.rainfall_7d_mm, features.avg_humidity_pct, features.days_since_harvest,
        features.storage_open, features.crop
    )
    model = risk_bundle["model"]
    columns = risk_bundle["columns"]
    row = [[row_dict[c] for c in columns]]

    risk_score = float(model.predict_proba(row)[0][1])
    risk_level = risk_level_for(risk_score)

    # Coefficients stay interpretable (LogisticRegression) — contribution =
    # coefficient * feature value, so the sign tells us the direction.
    contributions = []
    for col, coef in zip(columns, model.coef_[0]):
        value = row_dict[col]
        contribution = coef * value
        if abs(contribution) < 0.01:
            continue
        if col.startswith("crop_"):
            crop_name = col.replace("crop_", "")
            if value == 0:
                continue
            label = f"{crop_name.capitalize()} moisture sensitivity"
        else:
            label = FACTOR_LABELS.get(col, col)
        contributions.append({
            "label": label,
            "contribution": round(float(contribution), 3),
            "direction": "increases" if contribution > 0 else "decreases"
        })

    contributions.sort(key=lambda f: abs(f["contribution"]), reverse=True)

    return {
        "risk_score": round(risk_score, 3),
        "risk_level": risk_level,
        "factors": contributions
    }


MAX_PHOTO_BYTES = 8 * 1024 * 1024


def analyze_produce_photo(image_bytes: bytes) -> dict:
    """
    Heuristic, pixel-statistics quality read of a produce photo — NOT a
    trained computer-vision grading model. There's no labelled produce-photo
    dataset available offline for this demo, so this deliberately stays
    honest about what it is: three deterministic, explainable signals
    computed straight from the image (darkness/mold, colour-mix/foreign
    matter, surface clutter/debris), each contributing to an overall score
    with the same LOW/MEDIUM/HIGH thresholds as the weather-based risk model.
    """
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    img.thumbnail((512, 512))

    gray = np.asarray(img.convert("L"), dtype="float32")
    dark_ratio = float((gray < 60).mean())

    hsv = np.asarray(img.convert("HSV"), dtype="float32")
    hue_std = float(hsv[:, :, 0].std())

    edges = np.asarray(img.convert("L").filter(ImageFilter.FIND_EDGES), dtype="float32")
    edge_density = float(edges.mean())

    dark_norm = min(dark_ratio / 0.35, 1.0)
    hue_var_norm = min(hue_std / 60.0, 1.0)
    edge_norm = min(max(edge_density - 8.0, 0.0) / 30.0, 1.0)

    factors = [
        {"label": "Discoloration / possible mold", "contribution": round(0.45 * dark_norm, 3), "direction": "increases"},
        {"label": "Colour uniformity", "contribution": round(0.30 * hue_var_norm, 3), "direction": "increases"},
        {"label": "Surface texture / possible debris", "contribution": round(0.25 * edge_norm, 3), "direction": "increases"}
    ]
    score = max(0.0, min(1.0, sum(f["contribution"] for f in factors)))

    return {
        "photo_risk_score": round(score, 3),
        "risk_level": risk_level_for(score),
        "factors": factors
    }


@app.post("/predict-quality-photo")
def predict_quality_photo(payload: PhotoQualityInput):
    raw = payload.image_base64.split(",", 1)[-1]
    try:
        image_bytes = base64.b64decode(raw, validate=True)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid base64 image data")

    if len(image_bytes) > MAX_PHOTO_BYTES:
        raise HTTPException(status_code=413, detail="Image too large (max 8MB)")

    try:
        return analyze_produce_photo(image_bytes)
    except Exception:
        raise HTTPException(status_code=400, detail="Could not process image — please try a different photo")
