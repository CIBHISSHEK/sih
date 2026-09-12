import { prisma } from "../prisma";
import { emitQueueUpdate } from "../socket";
import { notifyApproaching } from "./notifications";

const ACTIVE_QUEUE_STATUSES = ["CONFIRMED", "IN_QUEUE", "ARRIVED"];

// Recomputes live queue order for a centre, pushes it over the socket, and
// fires the "3rd in line" notification exactly once per booking.
export async function recalcQueuePositions(centreId: string) {
  const bookings = await prisma.booking.findMany({
    where: { centreId, status: { in: ACTIVE_QUEUE_STATUSES } },
    orderBy: [{ slot: { startTime: "asc" } }, { createdAt: "asc" }]
  });

  const centre = await prisma.centre.findUniqueOrThrow({ where: { id: centreId } });
  const positions = bookings.map((b, idx) => ({ bookingId: b.id, farmerId: b.farmerId, position: idx + 1 }));
  emitQueueUpdate(centreId, { centreId, queueLength: centre.queueLength, positions });

  const third = bookings[2];
  if (third && !third.notifiedApproaching) {
    await prisma.booking.update({ where: { id: third.id }, data: { notifiedApproaching: true } });
    await notifyApproaching(third.id);
  }

  return positions;
}

export async function getQueuePosition(bookingId: string): Promise<{ position: number | null; etaMin: number | null }> {
  const booking = await prisma.booking.findUniqueOrThrow({ where: { id: bookingId }, include: { centre: true } });
  if (!ACTIVE_QUEUE_STATUSES.includes(booking.status)) return { position: null, etaMin: null };

  const bookings = await prisma.booking.findMany({
    where: { centreId: booking.centreId, status: { in: ACTIVE_QUEUE_STATUSES } },
    orderBy: [{ slot: { startTime: "asc" } }, { createdAt: "asc" }]
  });

  const position = bookings.findIndex((b) => b.id === bookingId) + 1;
  const etaMin = Math.round(Math.max(0, position - 1) * booking.centre.avgProcessingTimeMin);
  return { position, etaMin };
}
