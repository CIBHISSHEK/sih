import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma";
import { requireAuth, requireRole } from "../middleware/auth";
import { recalcQueuePositions } from "../services/queue";
import { notifyArrived, notifyCompleted } from "../services/notifications";
import { emitBookingStatus } from "../socket";
import { queuePaymentJob } from "../services/payment";
import { localDateStr } from "@msp/shared";

const router = Router();
router.use(requireAuth, requireRole("STAFF", "ADMIN"));

router.get("/centres/:id/today", async (req, res) => {
  const today = localDateStr();
  const bookings = await prisma.booking.findMany({
    where: { centreId: req.params.id, slot: { date: today } },
    include: { farmer: true, slot: true },
    orderBy: [{ slot: { startTime: "asc" } }, { createdAt: "asc" }]
  });
  res.json({ bookings });
});

router.post("/bookings/:id/verify-arrival", async (req, res) => {
  const schema = z.object({ otp: z.string() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "otp is required" });

  const booking = await prisma.booking.findUnique({ where: { id: req.params.id } });
  if (!booking) return res.status(404).json({ error: "Booking not found" });
  if (booking.arrivalOtp !== parsed.data.otp) return res.status(400).json({ error: "Incorrect OTP" });

  const updated = await prisma.booking.update({
    where: { id: booking.id },
    data: { status: "ARRIVED", arrivedAt: new Date() }
  });

  emitBookingStatus(booking.farmerId, { bookingId: booking.id, status: updated.status });
  await notifyArrived(booking.id);
  await recalcQueuePositions(booking.centreId);
  res.json({ booking: updated });
});

router.post("/bookings/:id/start-processing", async (req, res) => {
  const booking = await prisma.booking.findUnique({ where: { id: req.params.id } });
  if (!booking) return res.status(404).json({ error: "Booking not found" });

  const updated = await prisma.booking.update({
    where: { id: booking.id },
    data: { status: "PROCESSING", processingStartedAt: new Date() }
  });

  emitBookingStatus(booking.farmerId, { bookingId: booking.id, status: updated.status });
  res.json({ booking: updated });
});

router.post("/bookings/:id/complete", async (req, res) => {
  const schema = z.object({ finalQuantityQtl: z.number().nonnegative(), rejectedQtl: z.number().nonnegative().default(0) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const booking = await prisma.booking.findUnique({ where: { id: req.params.id } });
  if (!booking) return res.status(404).json({ error: "Booking not found" });

  const processingStart = booking.processingStartedAt ?? booking.arrivedAt ?? new Date();
  const actualProcessingMin = Math.max(1, Math.round((Date.now() - processingStart.getTime()) / 60000));

  const updated = await prisma.$transaction(async (tx) => {
    const b = await tx.booking.update({
      where: { id: booking.id },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
        finalQuantityQtl: parsed.data.finalQuantityQtl,
        rejectedQtl: parsed.data.rejectedQtl,
        actualProcessingMin,
        paymentStatus: "INITIATED"
      }
    });
    await tx.centre.update({ where: { id: booking.centreId }, data: { queueLength: { decrement: 1 } } });
    return b;
  });

  emitBookingStatus(booking.farmerId, { bookingId: booking.id, status: updated.status });
  await notifyCompleted(booking.id);
  queuePaymentJob(booking.id);
  await recalcQueuePositions(booking.centreId);

  res.json({ booking: updated });
});

router.post("/bookings/:id/no-show", async (req, res) => {
  const booking = await prisma.booking.findUnique({ where: { id: req.params.id } });
  if (!booking) return res.status(404).json({ error: "Booking not found" });

  await prisma.$transaction(async (tx) => {
    await tx.booking.update({ where: { id: booking.id }, data: { status: "NO_SHOW" } });
    await tx.slot.update({ where: { id: booking.slotId }, data: { bookedQtl: { decrement: booking.quantityQtl } } });
    await tx.centre.update({
      where: { id: booking.centreId },
      data: { remainingCapacityQtl: { increment: booking.quantityQtl }, queueLength: { decrement: 1 } }
    });
  });

  emitBookingStatus(booking.farmerId, { bookingId: booking.id, status: "NO_SHOW" });
  await recalcQueuePositions(booking.centreId);
  res.json({ ok: true });
});

export default router;
