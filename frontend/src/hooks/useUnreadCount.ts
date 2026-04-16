import { useEffect, useState, useCallback } from 'react';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/auth.store';

let globalCount = 0;
let silenced    = false;
let listeners:  ((n: number) => void)[] = [];

function notifyListeners(n: number) {
  globalCount = n;
  listeners.forEach((fn) => fn(n));
}

export function clearUnread() {
  silenced = true;
  notifyListeners(0);
}

export function useUnreadCount() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [count, setCount] = useState(globalCount);

  useEffect(() => {
    const handler = (n: number) => setCount(n);
    listeners.push(handler);
    return () => { listeners = listeners.filter((l) => l !== handler); };
  }, []);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const { data } = await api.get('/api/chat/unread');
      const newCount = data.count;
      if (silenced && newCount > globalCount) {
        silenced = false; // nuevo mensaje real → reactivar
      }
      if (!silenced) notifyListeners(newCount);
    } catch { /* silencioso */ }
  }, [isAuthenticated]);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 30000);
    return () => clearInterval(interval);
  }, [refresh]);

  return count;
}