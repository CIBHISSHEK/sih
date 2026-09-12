import axios from "axios";
import { env } from "../env";
import type { RiskFactor } from "@msp/shared";

const client = axios.create({ baseURL: env.ML_SERVICE_URL, timeout: 1500 });

export interface WaitFeatures {
  queue_length: number;
  avg_processing_time_min: number;
  remaining_capacity_pct: number;
  hour_of_day: number;
  day_of_week: number;
  quantity_qtl: number;
}

export interface WaitPrediction {
  predicted_wait_min: number;
  confidence_band: [number, number];
}

export interface RiskFeatures {
  rainfall_7d_mm: number;
  avg_humidity_pct: number;
  days_since_harvest: number;
  storage_open: 0 | 1;
  crop: string;
}

export interface RiskPrediction {
  risk_score: number;
  risk_level: "LOW" | "MEDIUM" | "HIGH";
  factors: RiskFactor[];
}

export interface PhotoQualityPrediction {
  photo_risk_score: number;
  risk_level: "LOW" | "MEDIUM" | "HIGH";
  factors: RiskFactor[];
}

// Every function here returns null on any failure — callers fall back to an
// analytical formula and tag the response source:"fallback" per the spec's
// "never crash on an external failure" constraint.

export async function predictWait(features: WaitFeatures): Promise<WaitPrediction | null> {
  try {
    const { data } = await client.post<WaitPrediction>("/predict-wait", features);
    return data;
  } catch {
    return null;
  }
}

export async function predictRisk(features: RiskFeatures): Promise<RiskPrediction | null> {
  try {
    const { data } = await client.post<RiskPrediction>("/predict-risk", features);
    return data;
  } catch {
    return null;
  }
}

// Image analysis needs more time and a larger body limit than the other
// (tiny, numeric) prediction calls, so it gets its own axios config rather
// than sharing `client`'s defaults.
export async function predictQualityPhoto(imageBase64: string, crop: string): Promise<PhotoQualityPrediction | null> {
  try {
    const { data } = await axios.post<PhotoQualityPrediction>(
      `${env.ML_SERVICE_URL}/predict-quality-photo`,
      { image_base64: imageBase64, crop },
      { timeout: 8000, maxBodyLength: 12 * 1024 * 1024, maxContentLength: 12 * 1024 * 1024 }
    );
    return data;
  } catch {
    return null;
  }
}

export async function mlHealthCheck(): Promise<boolean> {
  try {
    await client.get("/health");
    return true;
  } catch {
    return false;
  }
}
