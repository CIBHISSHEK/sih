import "./env";
import express, { NextFunction, Request, Response } from "express";
import "express-async-errors";
import http from "http";
import path from "path";
import fs from "fs";
import cors from "cors";
import { env } from "./env";
import { initSocket } from "./socket";
import { startCronJobs } from "./jobs/cron";
import { mlHealthCheck } from "./services/mlClient";

import healthRouter from "./routes/health";
import authRouter from "./routes/auth";
import bookingsRouter from "./routes/bookings";
import staffRouter from "./routes/staff";
import adminRouter from "./routes/admin";
import voiceRouter from "./routes/voice";
import demoRouter from "./routes/demo";

const app = express();
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
// Default 100kb body limit is fine for everything except the risk-check
// photo upload, which sends a base64-encoded image inline.
app.use(express.json({ limit: "12mb" }));

app.use("/api/health", healthRouter);
app.use("/api/auth", authRouter);
app.use("/api", bookingsRouter);
app.use("/api/staff", staffRouter);
app.use("/api/admin", adminRouter);
app.use("/api/voice", voiceRouter);
if (env.DEMO_MODE) {
  app.use("/api/demo", demoRouter);
  console.log("DEMO_MODE on — /api/demo/* endpoints are mounted (reset / rush / advance).");
}

// Serve the built frontend from this same server when WEB_DIST_DIR is set
// (the production image does this), so the whole app is one deployable unit
// on one origin — no separate static host, no CORS.
if (env.WEB_DIST_DIR && fs.existsSync(env.WEB_DIST_DIR)) {
  const dist = path.resolve(env.WEB_DIST_DIR);
  app.use(express.static(dist));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api/") || req.path.startsWith("/socket.io/")) return next();
    res.sendFile(path.join(dist, "index.html"));
  });
  console.log(`Serving frontend from ${dist}`);
}

// Central error handler — external/ML failures are handled per-service with
// fallbacks, so anything reaching here is an unexpected bug; never leak stack
// traces to the client, but never silently swallow it either.
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

const httpServer = http.createServer(app);
initSocket(httpServer);

httpServer.listen(env.PORT, async () => {
  console.log(`API listening on http://localhost:${env.PORT}`);
  const mlUp = await mlHealthCheck();
  console.log(`ML service: ${mlUp ? "reachable — predictions enabled" : "unreachable — using analytical fallbacks"}`);
  startCronJobs();
});
