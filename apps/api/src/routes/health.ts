import { Router } from "express";
import { mlHealthCheck } from "../services/mlClient";

const router = Router();

router.get("/", async (_req, res) => {
  const mlUp = await mlHealthCheck();
  res.json({ status: "ok", ml: mlUp ? "up" : "down (using fallback formulas)", timestamp: new Date().toISOString() });
});

export default router;
