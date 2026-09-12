import cron from "node-cron";
import { prisma } from "../prisma";
import { env } from "../env";
import { recalcQueuePositions } from "../services/queue";
import { emitBookingStatus } from "../socket";
import { localDateStr } from "@msp/shared";

function nowHHMM(): string {
  return new Date().toTimeString().slice(0, 5);
}

async function recomputeCentreStats() {
  const centres = await prisma.centre.findMany();
  for (const centre of centres) {
    const recent = await prisma.booking.findMany({
      where: { centreId: centre.id, status: { in: ["COMPLETED", "PAID"] }, actualProcessingMin: { not: null } },
      orderBy: { completedAt: "desc" },
      take: 20
    });
    const avgProcessingTimeMin = recent.length
      ? recent.reduce((s, b) => s + (b.actualProcessingMin ?? 0), 0) / recent.length
      : centre.avgProcessingTimeMin;

    const utilisation = (centre.dailyCapacityQtl - centre.remainingCapacityQtl) / centre.dailyCapacityQtl;

    await prisma.centre.update({
      where: { id: centre.id },
      data: { avgProcessingTimeMin, isNearCapacity: utilisation > 0.85 }
    });
  }
}

async function transitionArrivedSlots() {
  const today = localDateStr();
  const hhmm = nowHHMM();

  const due = await prisma.booking.findMany({
    where: { status: "CONFIRMED", slot: { date: today, startTime: { lte: hhmm } } },
    include: { slot: true }
  });

  const centreIds = new Set<string>();
  for (const booking of due) {
    await prisma.booking.update({ where: { id: booking.id }, data: { status: "IN_QUEUE" } });
    emitBookingStatus(booking.farmerId, { bookingId: booking.id, status: "IN_QUEUE" });
    centreIds.add(booking.centreId);
  }
  for (const centreId of centreIds) await recalcQueuePositions(centreId);
}

function addMinutesToTime(hhmm: string, minutes: number): string {
  const [h, m] = hhmm.split(":").map(Number);
  const total = h * 60 + m + minutes;
  const wrapped = ((total % 1440) + 1440) % 1440;
  return `${String(Math.floor(wrapped / 60)).padStart(2, "0")}:${String(wrapped % 60).padStart(2, "0")}`;
}

async function markOverdueNoShows() {
  const today = localDateStr();
  const hhmm = nowHHMM();

  const candidates = await prisma.booking.findMany({
    where: { status: { in: ["CONFIRMED", "IN_QUEUE"] }, arrivedAt: null, slot: { date: today } },
    include: { slot: true }
  });

  const centreIds = new Set<string>();
  for (const booking of candidates) {
    const overdueBy = addMinutesToTime(booking.slot.endTime, 90);
    if (hhmm <= overdueBy) continue; // still within the grace window, same operating day

    await prisma.$transaction(async (tx) => {
      await tx.booking.update({ where: { id: booking.id }, data: { status: "NO_SHOW" } });
      await tx.slot.update({ where: { id: booking.slotId }, data: { bookedQtl: { decrement: booking.quantityQtl } } });
      await tx.centre.update({
        where: { id: booking.centreId },
        data: { remainingCapacityQtl: { increment: booking.quantityQtl }, queueLength: { decrement: 1 } }
      });
    });
    emitBookingStatus(booking.farmerId, { bookingId: booking.id, status: "NO_SHOW" });
    centreIds.add(booking.centreId);
  }
  for (const centreId of centreIds) await recalcQueuePositions(centreId);
}

async function runCronTasks() {
  try {
    await recomputeCentreStats();
    await transitionArrivedSlots();
    await markOverdueNoShows();
  } catch (err) {
    console.error("Cron job failed:", err);
  }
}

export function startCronJobs() {
  const interval = Math.max(1, env.CRON_INTERVAL_MIN);
  cron.schedule(`*/${interval} * * * *`, runCronTasks);
  console.log(`Cron jobs scheduled every ${interval} minute(s)`);
}
