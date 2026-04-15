import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/auth.store';

let socketInstance: Socket | null = null;

export function useSocket() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const socketRef   = useRef<Socket | null>(null);

  useEffect(() => {
  if (!accessToken) return;

  if (!socketInstance) {
    socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
      auth: { token: accessToken },
      transports: ['websocket'],
    });
  }

  socketRef.current = socketInstance;

  return () => {};
}, [accessToken]);

  return socketRef.current;
}