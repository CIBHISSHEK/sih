import { Router } from "express";
import { prisma } from "../prisma";
import { requireAuth, requireRole } from "../middleware/auth";
import { localDateStr as isoDate } from "@msp/shared";

const router = Router();
router.use(requireAuth, requireRole("ADMIN", "STAFF"));

function daysAgo(n: number): string[] {
  const dates: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(isoDate(d));
  }
  return dates;
}

router.get("/overview", async (_req, res) => {
  const today = isoDate(new Date());

  const [todayBookings, arrivedToday, completedToday, paidRows] = await Promise.all([
    prisma.booking.count({ where: { slot: { date: today }, status: { not: "CANCELLED" } } }),
    prisma.booking.count({ where: { slot: { date: today }, arrivedAt: { not: null } } }),
    prisma.booking.findMany({ where: { slot: { date: today }, status: { in: ["COMPLETED", "PAID"] } } }),
    prisma.booking.findMany({ where: { paidAt: { not: null }, completedAt: { not: null } }, take: 500, orderBy: { paidAt: "desc" } })
  ]);

  const avgWaitMin = completedToday.length
    ? Math.round(completedToday.reduce((s, b) => s + (b.actualProcessingMin ?? 0), 0) / completedToday.length)
    : 0;

  const totalFinal = completedToday.reduce((s, b) => s + (b.finalQuantityQtl ?? 0), 0);
  const totalRejected = completedToday.reduce((s, b) => s + (b.rejectedQtl ?? 0), 0);
  const rejectionRatePct = totalFinal + totalRejected > 0 ? Math.round((totalRejected / (totalFinal + totalRejected)) * 1000) / 10 : 0;

  const SLA_HOURS = 48;
  const withinSla = paidRows.filter((b) => (b.paidAt!.getTime() - b.completedAt!.getTime()) / 36e5 <= SLA_HOURS);
  const paymentSlaPct = paidRows.length ? Math.round((withinSla.length / paidRows.length) * 1000) / 10 : 100;

  res.json({
    todayBookings,
    arrivalsSoFar: arrivedToday,
    avgWaitMin,
    rejectionRatePct,
    paymentSlaPct
  });
});

router.get("/forecast", async (req, res) => {
  const days = Number(req.query.days ?? 7);
  const centres = await prisma.centre.findMany();
  const historyWindow = daysAgo(14);

  const results = [];
  for (const centre of centres) {
    const history = await prisma.booking.findMany({
      where: { centreId: centre.id, slot: { date: { in: historyWindow } }, status: { not: "CANCELLED" } },
      select: { slot: { select: { date: true } } }
    });
    const perDay = new Map<string, number>();
    for (const h of history) perDay.set(h.slot.date, (perDay.get(h.slot.date) ?? 0) + 1);
    const avgPerDay = perDay.size ? Array.from(perDay.values()).reduce((a, b) => a + b, 0) / historyWindow.length : 0;

    for (let i = 1; i <= days; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      results.push({
        centreId: centre.id,
        centreName: centre.name,
        date: isoDate(d),
        expectedArrivals: Math.max(0, Math.round(avgPerDay * (0.9 + Math.random() * 0.2)))
      });
    }
  }

  res.json({ forecast: results, source: "trend-based" });
});

router.get("/utilisation", async (req, res) => {
  const days = Number(req.query.days ?? 14);
  const window = daysAgo(days);
  const centres = await prisma.centre.findMany();

  const results = [];
  for (const centre of centres) {
    const bookings = await prisma.booking.findMany({
      where: { centreId: centre.id, slot: { date: { in: window } }, status: { not: "CANCELLED" } },
      select: { quantityQtl: true, slot: { select: { date: true } } }
    });
    const perDay = new Map<string, number>();
    for (const b of bookings) perDay.set(b.slot.date, (perDay.get(b.slot.date) ?? 0) + b.quantityQtl);

    for (const date of window) {
      const bookedQtl = perDay.get(date) ?? 0;
      results.push({
        centreId: centre.id,
        centreName: centre.name,
        date,
        utilisationPct: Math.round((bookedQtl / centre.dailyCapacityQtl) * 1000) / 10
      });
    }
  }

  res.json({ utilisation: results });
});

router.get("/rejections", async (req, res) => {
  const days = Number(req.query.days ?? 14);
  const window = daysAgo(days);

  const bookings = await prisma.booking.findMany({
    where: { slot: { date: { in: window } }, status: { in: ["COMPLETED", "PAID"] } },
    select: { crop: true, finalQuantityQtl: true, rejectedQtl: true, slot: { select: { date: true } } }
  });

  const byCrop = new Map<string, { accepted: number; rejected: number }>();
  for (const b of bookings) {
    const key = b.crop;
    const entry = byCrop.get(key) ?? { accepted: 0, rejected: 0 };
    entry.accepted += b.finalQuantityQtl ?? 0;
    entry.rejected += b.rejectedQtl ?? 0;
    byCrop.set(key, entry);
  }

  const trend = Array.from(byCrop.entries()).map(([crop, { accepted, rejected }]) => ({
    crop,
    acceptedQtl: Math.round(accepted * 10) / 10,
    rejectedQtl: Math.round(rejected * 10) / 10,
    rejectionRatePct: accepted + rejected > 0 ? Math.round((rejected / (accepted + rejected)) * 1000) / 10 : 0
  }));

  res.json({ rejections: trend });
});

router.get("/centres", async (_req, res) => {
  const centres = await prisma.centre.findMany({ orderBy: { name: "asc" } });
  res.json({
    centres: centres.map((c) => ({
      id: c.id,
      name: c.name,
      code: c.code,
      district: c.district,
      queueLength: c.queueLength,
      dailyCapacityQtl: c.dailyCapacityQtl,
      remainingCapacityQtl: c.remainingCapacityQtl,
      capacityUsedPct: Math.round(((c.dailyCapacityQtl - c.remainingCapacityQtl) / c.dailyCapacityQtl) * 1000) / 10,
      avgProcessingTimeMin: Math.round(c.avgProcessingTimeMin),
      isNearCapacity: c.isNearCapacity
    }))
  });
});

export default router;
