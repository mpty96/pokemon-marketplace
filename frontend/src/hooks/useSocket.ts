import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/auth.store';

let socketInstance: Socket | null = null;

export function useSocket(): Socket | null {
  const accessToken = useAuthStore((s) => s.accessToken);
  const socketRef   = useRef<Socket | null>(null);

  useEffect(() => {
  if (!accessToken) return;

    // 🔥 cerrar conexión anterior si existe
    if (socketInstance) {
      socketInstance.disconnect();
    }

    // 🔥 crear nueva conexión con el token actual
    socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
      auth: { token: accessToken },
      transports: ['websocket'],
    });

    socketRef.current = socketInstance;

    return () => {
      // opcional: limpiar referencia local
      socketRef.current = null;
    };
  }, [accessToken]);
  return socketRef.current;
}