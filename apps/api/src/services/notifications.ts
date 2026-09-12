import { prisma } from "../prisma";
import { emitNotification } from "../socket";
import type { NotificationChannel as ChannelName } from "@msp/shared";

interface NotificationChannel {
  name: ChannelName;
  send(farmerId: string, message: string): Promise<void>;
}

// Socket.IO push to the farmer's live tracker.
const PushChannel: NotificationChannel = {
  name: "PUSH",
  async send(farmerId, message) {
    emitNotification(farmerId, { type: "push", message, createdAt: new Date().toISOString() });
  }
};

// Structured so a real telecom API (Twilio, MSG91, etc.) could drop in later —
// for the demo it just logs, which is enough to show the trigger firing.
const SmsChannel: NotificationChannel = {
  name: "SMS",
  async send(farmerId, message) {
    console.log(`[SMS -> farmer:${farmerId}] ${message}`);
  }
};

const CHANNELS: NotificationChannel[] = [PushChannel, SmsChannel];

export async function notify(farmerId: string, type: string, message: string, bookingId?: string) {
  for (const channel of CHANNELS) {
    await channel.send(farmerId, message);
    await prisma.notificationLog.create({
      data: { farmerId, bookingId, type, channel: channel.name, message }
    });
  }
}

export async function notifyBookingConfirmed(bookingId: string) {
  const booking = await prisma.booking.findUniqueOrThrow({ where: { id: bookingId }, include: { centre: true, slot: true } });
  await notify(
    booking.farmerId,
    "BOOKING_CONFIRMED",
    `Booking confirmed! Token ${booking.tokenNumber} at ${booking.centre.name}, slot ${booking.slot.startTime}-${booking.slot.endTime}. Arrival OTP: ${booking.arrivalOtp}`,
    booking.id
  );
}

export async function notifyApproaching(bookingId: string) {
  const booking = await prisma.booking.findUniqueOrThrow({ where: { id: bookingId } });
  await notify(booking.farmerId, "QUEUE_APPROACHING", `You're 3rd in line — your turn is approaching. Token ${booking.tokenNumber}.`, booking.id);
}

export async function notifyArrived(bookingId: string) {
  const booking = await prisma.booking.findUniqueOrThrow({ where: { id: bookingId } });
  await notify(booking.farmerId, "ARRIVAL_VERIFIED", `Checked in — please proceed to weighing. Token ${booking.tokenNumber}.`, booking.id);
}

export async function notifyCompleted(bookingId: string) {
  const booking = await prisma.booking.findUniqueOrThrow({ where: { id: bookingId } });
  await notify(
    booking.farmerId,
    "PROCUREMENT_COMPLETED",
    `Procurement complete: ${booking.finalQuantityQtl} qtl accepted. Payment has been queued.`,
    booking.id
  );
}

export async function notifyPaymentSettled(bookingId: string) {
  const booking = await prisma.booking.findUniqueOrThrow({ where: { id: bookingId } });
  await notify(booking.farmerId, "PAYMENT_SETTLED", `₹${booking.paymentAmount} credited for token ${booking.tokenNumber}.`, booking.id);
}
