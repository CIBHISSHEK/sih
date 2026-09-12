import axios from "axios";
import { env } from "../env";

export interface WeatherReading {
  rainfall7dMm: number;
  avgHumidityPct: number;
  source: "live" | "fallback";
  summary: string;
}

interface CacheEntry {
  reading: WeatherReading;
  expiresAt: number;
}

const CACHE_TTL_MS = 30 * 60 * 1000;
const cache = new Map<string, CacheEntry>();

// Seasonal fallback per district, used when Open-Meteo is unreachable or
// WEATHER_MODE=offline. Thanjavur sits in the Cauvery delta — wet, humid,
// northeast-monsoon-influenced climate is a reasonable year-round default.
const DISTRICT_FALLBACK: Record<string, WeatherReading> = {
  Thanjavur: { rainfall7dMm: 38, avgHumidityPct: 78, source: "fallback", summary: "Humid, moderate recent rainfall (seasonal average)" },
  default: { rainfall7dMm: 20, avgHumidityPct: 65, source: "fallback", summary: "Dry-to-moderate conditions (seasonal average)" }
};

function cacheKey(lat: number, lng: number): string {
  return `${lat.toFixed(2)},${lng.toFixed(2)}`;
}

export async function getWeather(lat: number, lng: number, district: string): Promise<WeatherReading> {
  const key = cacheKey(lat, lng);
  const cached = cache.get(key);
  if (cached && cached.expiresAt > Date.now()) return cached.reading;

  if (env.WEATHER_MODE === "offline") {
    return DISTRICT_FALLBACK[district] ?? DISTRICT_FALLBACK.default;
  }

  try {
    const { data } = await axios.get("https://api.open-meteo.com/v1/forecast", {
      params: {
        latitude: lat,
        longitude: lng,
        daily: "precipitation_sum",
        hourly: "relative_humidity_2m",
        past_days: 7,
        forecast_days: 1,
        timezone: "auto"
      },
      timeout: 2500
    });

    const rainfall7dMm = (data.daily?.precipitation_sum ?? []).reduce((sum: number, v: number) => sum + (v ?? 0), 0);
    const humidityValues: number[] = data.hourly?.relative_humidity_2m ?? [];
    const avgHumidityPct = humidityValues.length
      ? humidityValues.reduce((s, v) => s + v, 0) / humidityValues.length
      : (DISTRICT_FALLBACK[district] ?? DISTRICT_FALLBACK.default).avgHumidityPct;

    const reading: WeatherReading = {
      rainfall7dMm: Math.round(rainfall7dMm * 10) / 10,
      avgHumidityPct: Math.round(avgHumidityPct),
      source: "live",
      summary: `${Math.round(rainfall7dMm)}mm rain in the last 7 days, ${Math.round(avgHumidityPct)}% avg humidity`
    };
    cache.set(key, { reading, expiresAt: Date.now() + CACHE_TTL_MS });
    return reading;
  } catch {
    const fallback = DISTRICT_FALLBACK[district] ?? DISTRICT_FALLBACK.default;
    cache.set(key, { reading: fallback, expiresAt: Date.now() + CACHE_TTL_MS });
    return fallback;
  }
}
