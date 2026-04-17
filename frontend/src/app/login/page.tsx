'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/auth.store';

export default function LoginPage() {
  const router  = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [form,    setForm]    = useState({ email: '', password: '' });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await api.post('/api/auth/login', form);
      setAuth(data.user, data.accessToken, data.refreshToken);
      router.push('/');
    } catch (err: any) {
      console.error('Login error:', err);

      if (!err.response) {
        // Sin respuesta — servidor dormido o sin conexión
        setError('No se pudo conectar al servidor. Intenta de nuevo en unos segundos.');
      } else {
        setError(err.response?.data?.error || 'Error al iniciar sesión');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] px-4">
      <div className="w-full max-w-md bg-[var(--surface)] rounded-xl shadow p-8 border border-[var(--border)]">
        <h1 className="text-2xl font-bold text-center mb-6 text-[var(--foreground)]">
          Iniciar sesión
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-[var(--danger-bg)] border border-[var(--border)] text-[var(--danger-fg)] rounded-lg p-3 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
              Email
            </label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="tu@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full border border-[var(--border)] rounded-lg px-3 py-2 bg-[var(--surface)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              placeholder="Tu contraseña"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[var(--primary)] hover:bg-[var(--primary-hover)] disabled:opacity-60 text-[var(--primary-foreground)] font-medium py-2 rounded-lg transition-colors">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>
                Iniciando sesión...
              </span>
            ) : 'Iniciar sesión'}
          </button>

          <p className="text-center text-sm text-[var(--muted)]">
            ¿No tienes cuenta?{' '}
            <Link href="/register" className="text-[var(--primary)] hover:underline">
              Regístrate
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}