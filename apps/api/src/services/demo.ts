import { prisma } from "../prisma";
import { recalcQueuePositions } from "./queue";
import { notifyCompleted } from "./notifications";
import { queuePaymentJob } from "./payment";
import { createBooking, BookingCapacityError, SlotExpiredError } from "./booking";
import { emitBookingStatus } from "../socket";
import { localDateStr, isSlotPast } from "@msp/shared";

const ACTIVE_QUEUE_STATUSES = ["CONFIRMED", "IN_QUEUE", "ARRIVED", "PROCESSING"];

export async function advanceQueue(centreId: string) {
  const next = await prisma.booking.findFirst({
    where: { centreId, status: { in: ACTIVE_QUEUE_STATUSES } },
    orderBy: [{ slot: { startTime: "asc" } }, { createdAt: "asc" }]
  });
  if (!next) return null;

  const updated = await prisma.$transaction(async (tx) => {
    const b = await tx.booking.update({
      where: { id: next.id },
      data: {
        status: "COMPLETED",
        arrivedAt: next.arrivedAt ?? new Date(),
        processingStartedAt: next.processingStartedAt ?? new Date(),
        completedAt: new Date(),
        finalQuantityQtl: next.quantityQtl,
        rejectedQtl: 0,
        actualProcessingMin: 12,
        paymentStatus: "INITIATED"
      }
    });
    await tx.centre.update({ where: { id: centreId }, data: { queueLength: { decrement: 1 } } });
    return b;
  });

  emitBookingStatus(updated.farmerId, { bookingId: updated.id, status: updated.status });
  await notifyCompleted(updated.id);
  queuePaymentJob(updated.id);
  await recalcQueuePositions(centreId);
  return updated;
}

export async function injectRush(centreId: string, count = 5) {
  const today = localDateStr();
  const allSlots = await prisma.slot.findMany({ where: { centreId, date: today }, orderBy: { startTime: "asc" } });
  const slots = allSlots.filter((s) => !isSlotPast(today, s.startTime));
  if (slots.length === 0) return [];

  const farmers = await prisma.farmer.findMany({ take: count, orderBy: { createdAt: "asc" } });
  if (farmers.length === 0) return [];

  const created = [];
  for (let i = 0; i < count; i++) {
    const slot = slots[i % slots.length];
    const farmer = farmers[i % farmers.length];
    const quantityQtl = 5 + Math.round(Math.random() * 10);

    try {
      const booking = await createBooking({
        farmerId: farmer.id,
        centreId,
        slotId: slot.id,
        crop: farmer.primaryCrop || "paddy",
        quantityQtl,
        bookedVia: "STAFF"
      });
      created.push(booking);
    } catch (err) {
      if (!(err instanceof BookingCapacityError) && !(err instanceof SlotExpiredError)) throw err;
    }
  }

  return created;
}
