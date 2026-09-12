import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../../.env") });
dotenv.config(); // allow a local apps/api/.env to override, if present

const isProd = process.env.NODE_ENV === "production";

// In dev, accept the frontend on ANY localhost / 127.0.0.1 port — Vite hops
// to 5174, 5175, ... whenever 5173 is busy, and there's no reason a local
// test should be blocked over it. In production, CORS is pinned to the
// explicit origin(s) from CORS_ORIGIN (or "*" if you set that).
const CORS_ORIGIN: RegExp | string[] = isProd
  ? (process.env.CORS_ORIGIN ?? "http://localhost:5173")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
  : /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  PORT: Number(process.env.PORT ?? 4000),
  JWT_SECRET: process.env.JWT_SECRET ?? "demo-secret-change-me",
  CORS_ORIGIN,
  ML_SERVICE_URL: process.env.ML_SERVICE_URL ?? "http://localhost:8000",
  WEATHER_MODE: process.env.WEATHER_MODE ?? "live",
  VOICE_PROVIDER: (process.env.VOICE_PROVIDER as "mock" | "sarvam") ?? "mock",
  SARVAM_API_KEY: process.env.SARVAM_API_KEY ?? "",
  CRON_INTERVAL_MIN: Number(process.env.CRON_INTERVAL_MIN ?? 2),
  // Firebase service account for verifying real-phone (SMS OTP) logins.
  // Provide EITHER a path to the JSON file (local dev) OR the JSON contents
  // inline as a single-line string (platform deploys with no file mount).
  // Unset by default — real-phone OTP is opt-in, mock OTP always works.
  FIREBASE_SERVICE_ACCOUNT_PATH: process.env.FIREBASE_SERVICE_ACCOUNT_PATH ?? "",
  FIREBASE_SERVICE_ACCOUNT_JSON: process.env.FIREBASE_SERVICE_ACCOUNT_JSON ?? "",
  // Directory of the built frontend to serve from this same server. Set in
  // the production image so web + API deploy as one unit (no CORS, one URL).
  WEB_DIST_DIR: process.env.WEB_DIST_DIR ?? "",
  // The demo-only endpoints (/api/demo/reset wipes and reseeds the whole DB,
  // /rush and /advance fabricate bookings) are mounted ONLY when this is
  // explicitly "true". It must never be true on a real deployment.
  DEMO_MODE: (process.env.DEMO_MODE ?? String(!isProd)) === "true"
};
