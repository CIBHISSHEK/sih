import { prisma } from "../prisma";
import { emitBookingStatus } from "../socket";
import { notifyPaymentSettled } from "./notifications";

// Approximate 2024-25 MSP rates (₹/quintal) — good enough for a demo payout figure.
const MSP_RATE_PER_QTL: Record<string, number> = {
  paddy: 2300,
  wheat: 2275,
  maize: 2225,
  cotton: 7121,
  sugarcane: 340
};
const DEFAULT_RATE = 2100;

function computeAmount(crop: string, finalQuantityQtl: number): number {
  const rate = MSP_RATE_PER_QTL[crop.toLowerCase()] ?? DEFAULT_RATE;
  return Math.round(rate * finalQuantityQtl);
}

// Payment is intentionally decoupled from the queue: the queue advances the
// moment a booking is COMPLETED, and this runs as a separate delayed job so
// nothing in the live queue ever waits on it.
export function queuePaymentJob(bookingId: string) {
  const delayMs = 10_000 + Math.random() * 20_000;
  setTimeout(async () => {
    try {
      const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
      if (!booking || booking.status !== "COMPLETED" || booking.finalQuantityQtl == null) return;

      const amount = computeAmount(booking.crop, booking.finalQuantityQtl);
      await prisma.booking.update({
        where: { id: bookingId },
        data: { paymentStatus: "PAID", paymentAmount: amount, paidAt: new Date() }
      });
      emitBookingStatus(booking.farmerId, { bookingId, status: booking.status });
      await notifyPaymentSettled(bookingId);
    } catch (err) {
      console.error(`Payment job failed for booking ${bookingId}:`, err);
    }
  }, delayMs);
}
