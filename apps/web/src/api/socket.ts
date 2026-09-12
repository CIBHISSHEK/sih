import { io, Socket } from "socket.io-client";
import { API_URL } from "./client";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) socket = io(API_URL, { autoConnect: true });
  return socket;
}
