import { Router } from "express";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import { advanceQueue, injectRush } from "../services/demo";
import { prisma } from "../prisma";
import { requireAuth, requireRole } from "../middleware/auth";

const execAsync = promisify(exec);
const router = Router();
router.use(requireAuth, requireRole("ADMIN"));

// Shells out to the root `npm run seed` script rather than importing
// prisma/seed.ts directly — that script lives outside apps/api's TS rootDir,
// and this way dev (tsx) and a built `dist` both reset the same way.
router.post("/reset", async (_req, res) => {
  await prisma.$disconnect();
  const repoRoot = path.resolve(process.cwd(), "../..");
  // Scoped to the api workspace (not the root "seed" script) so a reset
  // doesn't also rebuild packages/shared every time — that's only needed
  // once at startup and would blow the <2s reset budget.
  await execAsync("npm run seed -w apps/api", { cwd: repoRoot });
  res.json({ ok: true, message: "Demo state reset" });
});

router.post("/advance/:centreId", async (req, res) => {
  const booking = await advanceQueue(req.params.centreId);
  if (!booking) return res.status(404).json({ error: "No active booking to advance for this centre" });
  res.json({ booking });
});

router.post("/rush/:centreId", async (req, res) => {
  const bookings = await injectRush(req.params.centreId);
  res.json({ bookings, count: bookings.length });
});

export default router;
