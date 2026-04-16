import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/auth.store';

let socketInstance: Socket | null = null;
let currentToken:   string | null = null;

export function useSocket() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const socketRef   = useRef<Socket | null>(null);

  useEffect(() => {
    if (!accessToken) {
      socketInstance?.disconnect();
      socketInstance  = null;
      currentToken    = null;
      return;
    }

    // Reconectar si el token cambió
    if (socketInstance && currentToken !== accessToken) {
      socketInstance.disconnect();
      socketInstance = null;
    }

    if (!socketInstance) {
      currentToken   = accessToken;
      socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
        auth:       { token: accessToken },
        transports: ['websocket', 'polling'],
      });

      socketInstance.on('connect_error', (err) => {
        console.error('Socket error:', err.message);
      });
    }

    socketRef.current = socketInstance;
  }, [accessToken]);

  return socketRef.current;
}