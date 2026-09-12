import { prisma } from "../prisma";
import { generateOtp, generateTokenNumber } from "./tokens";
import { recalcQueuePositions } from "./queue";
import { notifyBookingConfirmed } from "./notifications";
import { toJson, isSlotPast, type BookedVia, type RiskFactor, type RecommendationBreakdownItem } from "@msp/shared";

export interface CreateBookingInput {
  farmerId: string;
  centreId: string;
  slotId: string;
  crop: string;
  quantityQtl: number;
  bookedVia: BookedVia;
  riskSnapshot?: { riskLevel: string; riskScore: number; factors: RiskFactor[] };
  recommendationSnapshot?: { score: number; predictedWaitMin: number; breakdown: RecommendationBreakdownItem[] };
}

export class BookingCapacityError extends Error {}
export class SlotExpiredError extends Error {}

// Single source of truth for turning a chosen centre+slot into a confirmed
// booking — used by the REST booking endpoint and by the voice flow, so the
// two never drift out of sync (per spec §10: "no duplicated booking logic").
export async function createBooking(input: CreateBookingInput) {
  const booking = await prisma.$transaction(async (tx) => {
    const [slot, centre] = await Promise.all([
      tx.slot.findUniqueOrThrow({ where: { id: input.slotId } }),
      tx.centre.findUniqueOrThrow({ where: { id: input.centreId } })
    ]);

    // Defense in depth: the recommendation/slot-picking endpoints already
    // exclude elapsed time slots, but a client could still hold a stale
    // selection open across the boundary (e.g. left the wizard open past
    // the slot's start time before confirming).
    if (isSlotPast(slot.date, slot.startTime)) throw new SlotExpiredError("SLOT_EXPIRED");
    if (slot.bookedQtl + input.quantityQtl > slot.capacityQtl) throw new BookingCapacityError("SLOT_FULL");
    if (centre.remainingCapacityQtl < input.quantityQtl) throw new BookingCapacityError("CENTRE_FULL");

    const newRemaining = centre.remainingCapacityQtl - input.quantityQtl;
    await tx.slot.update({ where: { id: slot.id }, data: { bookedQtl: { increment: input.quantityQtl } } });
    await tx.centre.update({
      where: { id: centre.id },
      data: {
        remainingCapacityQtl: newRemaining,
        queueLength: { increment: 1 },
        isNearCapacity: newRemaining / centre.dailyCapacityQtl < 0.15
      }
    });

    const bookingCount = await tx.booking.count({ where: { centreId: centre.id } });

    return tx.booking.create({
      data: {
        farmerId: input.farmerId,
        centreId: input.centreId,
        slotId: input.slotId,
        crop: input.crop,
        quantityQtl: input.quantityQtl,
        status: "CONFIRMED",
        tokenNumber: generateTokenNumber(centre.code, bookingCount + 1),
        arrivalOtp: generateOtp(),
        bookedVia: input.bookedVia,
        riskLevel: input.riskSnapshot?.riskLevel,
        riskScore: input.riskSnapshot?.riskScore,
        riskFactors: input.riskSnapshot ? toJson(input.riskSnapshot.factors) : undefined,
        predictedWaitMin: input.recommendationSnapshot?.predictedWaitMin,
        recommendationScore: input.recommendationSnapshot?.score,
        recommendationBreakdown: input.recommendationSnapshot ? toJson(input.recommendationSnapshot.breakdown) : undefined
      }
    });
  });

  await recalcQueuePositions(input.centreId);
  await notifyBookingConfirmed(booking.id);
  return booking;
}
