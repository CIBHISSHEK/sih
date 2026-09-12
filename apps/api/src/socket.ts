import type { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { env } from "./env";

let io: Server | null = null;

export function initSocket(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: { origin: env.CORS_ORIGIN, credentials: true }
  });

  io.on("connection", (socket) => {
    socket.on("join:centre", (centreId: string) => socket.join(`centre:${centreId}`));
    socket.on("join:farmer", (farmerId: string) => socket.join(`farmer:${farmerId}`));
  });

  return io;
}

export function getIo(): Server {
  if (!io) throw new Error("Socket.IO not initialised yet");
  return io;
}

export function emitQueueUpdate(centreId: string, payload: { centreId: string; queueLength: number; positions: Array<{ bookingId: string; farmerId: string; position: number }> }) {
  io?.to(`centre:${centreId}`).emit("queue:update", payload);
}

export function emitBookingStatus(farmerId: string, payload: { bookingId: string; status: string }) {
  io?.to(`farmer:${farmerId}`).emit("booking:status", payload);
}

export function emitNotification(farmerId: string, payload: { type: string; message: string; createdAt: string }) {
  io?.to(`farmer:${farmerId}`).emit("notification:new", payload);
}
