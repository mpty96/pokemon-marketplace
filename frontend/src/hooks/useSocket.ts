import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/auth.store';

let socketInstance: Socket | null = null;

export function useSocket() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const [socket, setSocket] = useState<Socket | null>(socketInstance);

  useEffect(() => {
    // Sin token → cerrar si existía
    if (!accessToken) {
      if (socketInstance) {
        socketInstance.disconnect();
        socketInstance = null;
        setSocket(null);
      }
      return;
    }

    // Crear UNA sola vez
    if (!socketInstance) {
      socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
        auth: { token: accessToken },
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
      });

      socketInstance.on('connect_error', (err) => {
        console.error('Socket error:', err.message);
      });

      setSocket(socketInstance);
    } else {
      // Ya existe: solo actualizar el token para futuras reconexiones,
      // SIN desconectar la conexión actual
      socketInstance.auth = { token: accessToken };
      setSocket(socketInstance);
    }
  }, [accessToken]);

  return socket;
}