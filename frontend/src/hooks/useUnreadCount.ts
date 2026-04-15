import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/auth.store';

export function useUnreadCount() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) return;

    async function fetch() {
      try {
        const { data } = await api.get('/api/chat/unread');
        setCount(data.count);
      } catch {
        // silencioso
      }
    }

    fetch();
    // Polling cada 30 segundos
    const interval = setInterval(fetch, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  return count;
}