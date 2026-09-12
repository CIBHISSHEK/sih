import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma";
import { requireAuth, requireRole } from "../middleware/auth";
import { getRecommendations } from "../services/allocation";
import { runRiskCheck } from "../services/risk";
import { recalcQueuePositions, getQueuePosition } from "../services/queue";
import { createBooking, BookingCapacityError, SlotExpiredError } from "../services/booking";
import { fromJson, type RiskFactor, type RecommendationBreakdownItem } from "@msp/shared";

const router = Router();

router.post("/recommendations", requireAuth, async (req, res) => {
  const schema = z.object({
    lat: z.number(),
    lng: z.number(),
    crop: z.string().min(1),
    quantityQtl: z.number().positive(),
    date: z.string(),
    radiusKm: z.number().positive().optional()
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const candidates = await getRecommendations(parsed.data);
  res.json({ candidates });
});

router.post("/risk-check", requireAuth, async (req, res) => {
  const schema = z.object({
    lat: z.number(),
    lng: z.number(),
    district: z.string().min(1),
    crop: z.string().min(1),
    daysSinceHarvest: z.number().nonnegative(),
    storage: z.enum(["OPEN", "COVERED"]),
    photoBase64: z.string().max(11_000_000).optional() // ~8MB image, base64-inflated
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const result = await runRiskCheck(parsed.data);
  res.json(result);
});

const bookingSchema = z.object({
  centreId: z.string(),
  slotId: z.string(),
  crop: z.string().min(1),
  quantityQtl: z.number().positive(),
  bookedVia: z.enum(["APP", "VOICE", "STAFF"]).optional(),
  riskSnapshot: z
    .object({
      riskLevel: z.enum(["LOW", "MEDIUM", "HIGH"]),
      riskScore: z.number(),
      factors: z.array(z.object({ label: z.string(), contribution: z.number(), direction: z.enum(["increases", "decreases"]) }))
    })
    .optional(),
  recommendationSnapshot: z
    .object({
      score: z.number(),
      predictedWaitMin: z.number(),
      breakdown: z.array(
        z.object({ label: z.string(), rawValue: z.number(), normalised: z.number(), weight: z.number(), contribution: z.number() })
      )
    })
    .optional()
});

router.post("/bookings", requireAuth, requireRole("FARMER", "STAFF"), async (req, res) => {
  const parsed = bookingSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const input = parsed.data;

  const farmerId = req.auth!.role === "FARMER" ? req.auth!.sub : req.body.farmerId;
  if (!farmerId) return res.status(400).json({ error: "farmerId is required when booking as staff" });

  try {
    const booking = await createBooking({
      farmerId,
      centreId: input.centreId,
      slotId: input.slotId,
      crop: input.crop,
      quantityQtl: input.quantityQtl,
      bookedVia: input.bookedVia ?? "APP",
      riskSnapshot: input.riskSnapshot,
      recommendationSnapshot: input.recommendationSnapshot
    });

    res.status(201).json({ booking });
  } catch (err) {
    if (err instanceof BookingCapacityError) {
      return res.status(409).json({ error: "Capacity was taken by another booking — please pick another slot or centre." });
    }
    if (err instanceof SlotExpiredError) {
      return res.status(409).json({ error: "That slot's time has already passed — please pick another slot." });
    }
    throw err;
  }
});

router.get("/bookings/mine", requireAuth, requireRole("FARMER"), async (req, res) => {
  const bookings = await prisma.booking.findMany({
    where: { farmerId: req.auth!.sub },
    include: { centre: true, slot: true },
    orderBy: { createdAt: "desc" }
  });
  res.json({ bookings });
});

router.get("/bookings/:id", requireAuth, async (req, res) => {
  const booking = await prisma.booking.findUnique({
    where: { id: req.params.id },
    include: { centre: true, slot: true, farmer: true }
  });
  if (!booking) return res.status(404).json({ error: "Booking not found" });

  const { position, etaMin } = await getQueuePosition(booking.id);
  res.json({
    booking: {
      ...booking,
      riskFactors: fromJson<RiskFactor[]>(booking.riskFactors, []),
      recommendationBreakdown: fromJson<RecommendationBreakdownItem[]>(booking.recommendationBreakdown, [])
    },
    queuePosition: position,
    etaMin
  });
});

router.delete("/bookings/:id", requireAuth, async (req, res) => {
  const booking = await prisma.booking.findUnique({ where: { id: req.params.id } });
  if (!booking) return res.status(404).json({ error: "Booking not found" });
  if (req.auth!.role === "FARMER" && booking.farmerId !== req.auth!.sub) {
    return res.status(403).json({ error: "Not your booking" });
  }
  if (["COMPLETED", "PAID", "CANCELLED", "NO_SHOW"].includes(booking.status)) {
    return res.status(400).json({ error: `Cannot cancel a booking in status ${booking.status}` });
  }

  await prisma.$transaction(async (tx) => {
    await tx.slot.update({ where: { id: booking.slotId }, data: { bookedQtl: { decrement: booking.quantityQtl } } });
    await tx.centre.update({
      where: { id: booking.centreId },
      data: { remainingCapacityQtl: { increment: booking.quantityQtl }, queueLength: { decrement: 1 } }
    });
    await tx.booking.update({ where: { id: booking.id }, data: { status: "CANCELLED" } });
  });

  await recalcQueuePositions(booking.centreId);
  res.json({ ok: true });
});

export default router;
