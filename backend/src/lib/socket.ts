import type { Server } from 'socket.io';

let io: Server | null = null;

export function setIO(server: Server) {
  io = server;
}

export function emitToListing(listingId: string, event: string, payload: unknown) {
  io?.to(`listing:${listingId}`).emit(event, payload);
}