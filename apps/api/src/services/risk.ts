import { getWeather } from "./weather";
import { predictRisk, predictQualityPhoto } from "./mlClient";
import { RISK_THRESHOLDS, clamp, type RiskCheckResult, type RiskFactor, type StorageType } from "@msp/shared";

export interface RiskCheckInput {
  lat: number;
  lng: number;
  district: string;
  crop: string;
  daysSinceHarvest: number;
  storage: StorageType;
  photoBase64?: string;
}

const MOISTURE_SENSITIVE_CROPS = new Set(["paddy", "rice"]);

// When a photo is supplied, the combined score blends the weather/storage
// read with the photo-quality read at this weight — photo evidence matters,
// but shouldn't fully override the environmental signal on its own.
const PHOTO_WEIGHT = 0.4;

function levelFor(score: number): "LOW" | "MEDIUM" | "HIGH" {
  if (score < RISK_THRESHOLDS.LOW_MAX) return "LOW";
  if (score < RISK_THRESHOLDS.MEDIUM_MAX) return "MEDIUM";
  return "HIGH";
}

function scaleFactors(factors: RiskFactor[], weight: number): RiskFactor[] {
  return factors.map((f) => ({ ...f, contribution: Math.round(f.contribution * weight * 1000) / 1000 }));
}

// Analytical fallback used when the ML service is unreachable. Mirrors the
// label rule used to generate the synthetic training data: risk rises with
// rainfall, humidity, days since harvest, and open storage; moisture-sensitive
// crops (paddy) get an extra bump.
function fallbackRisk(input: RiskCheckInput, rainfall7dMm: number, avgHumidityPct: number): { score: number; factors: RiskFactor[] } {
  const rainfallTerm = clamp(rainfall7dMm / 100, 0, 1) * 0.3;
  const humidityTerm = clamp((avgHumidityPct - 40) / 60, 0, 1) * 0.25;
  const harvestTerm = clamp(input.daysSinceHarvest / 10, 0, 1) * 0.25;
  const storageTerm = input.storage === "OPEN" ? 0.15 : 0.02;
  const cropTerm = MOISTURE_SENSITIVE_CROPS.has(input.crop.toLowerCase()) ? 0.05 : 0;

  const score = clamp(rainfallTerm + humidityTerm + harvestTerm + storageTerm + cropTerm, 0, 1);

  const factors: RiskFactor[] = [
    { label: "Recent rainfall", contribution: Math.round(rainfallTerm * 100) / 100, direction: "increases" },
    { label: "Humidity", contribution: Math.round(humidityTerm * 100) / 100, direction: "increases" },
    { label: "Days since harvest", contribution: Math.round(harvestTerm * 100) / 100, direction: "increases" },
    { label: `Storage (${input.storage.toLowerCase()})`, contribution: Math.round(storageTerm * 100) / 100, direction: input.storage === "OPEN" ? "increases" : "decreases" }
  ];
  if (cropTerm > 0) {
    factors.push({ label: `${input.crop} moisture sensitivity`, contribution: Math.round(cropTerm * 100) / 100, direction: "increases" });
  }

  return { score, factors };
}

export async function runRiskCheck(input: RiskCheckInput): Promise<RiskCheckResult> {
  const weather = await getWeather(input.lat, input.lng, input.district);

  const mlResult = await predictRisk({
    rainfall_7d_mm: weather.rainfall7dMm,
    avg_humidity_pct: weather.avgHumidityPct,
    days_since_harvest: input.daysSinceHarvest,
    storage_open: input.storage === "OPEN" ? 1 : 0,
    crop: input.crop
  });

  let envScore: number;
  let envFactors: RiskFactor[];
  let source: RiskCheckResult["source"];

  if (mlResult) {
    envScore = mlResult.risk_score;
    envFactors = mlResult.factors;
    source = "ml";
  } else {
    const fallback = fallbackRisk(input, weather.rainfall7dMm, weather.avgHumidityPct);
    envScore = fallback.score;
    envFactors = fallback.factors;
    source = "fallback";
  }

  if (!input.photoBase64) {
    return {
      riskLevel: mlResult ? mlResult.risk_level : levelFor(envScore),
      riskScore: Math.round(envScore * 1000) / 1000,
      factors: envFactors,
      weatherSummary: weather.summary,
      source,
      photoAnalysed: false
    };
  }

  const photoResult = await predictQualityPhoto(input.photoBase64, input.crop);
  if (!photoResult) {
    // Photo was supplied but the ML service couldn't analyse it — say so
    // explicitly rather than silently dropping it (per the "never crash on
    // an external failure, but stay honest about it" rule).
    return {
      riskLevel: mlResult ? mlResult.risk_level : levelFor(envScore),
      riskScore: Math.round(envScore * 1000) / 1000,
      factors: [...envFactors, { label: "Photo analysis (unavailable — ML service down)", contribution: 0, direction: "increases" }],
      weatherSummary: weather.summary,
      source,
      photoAnalysed: false
    };
  }

  const combinedScore = clamp(envScore * (1 - PHOTO_WEIGHT) + photoResult.photo_risk_score * PHOTO_WEIGHT, 0, 1);
  const combinedFactors = [
    ...scaleFactors(envFactors, 1 - PHOTO_WEIGHT),
    ...scaleFactors(
      photoResult.factors.map((f) => ({ ...f, label: `Photo: ${f.label}` })),
      PHOTO_WEIGHT
    )
  ];

  return {
    riskLevel: levelFor(combinedScore),
    riskScore: Math.round(combinedScore * 1000) / 1000,
    factors: combinedFactors,
    weatherSummary: weather.summary,
    source,
    photoAnalysed: true
  };
}
