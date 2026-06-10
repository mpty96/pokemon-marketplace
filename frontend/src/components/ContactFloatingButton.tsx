'use client';

import { useState } from 'react';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/auth.store';

export default function ContactFloatingButton() {
  const user = useAuthStore((s) => s.user);

  const [open, setOpen] = useState(false);
  const [type, setType] = useState('Mejora');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  async function handleSend() {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await api.post('/api/contact', {
        type,
        message,
        user: user
          ? {
              id: user.id,
              username: user.username,
              email: user.email,
            }
          : undefined,
      });

      setSuccess('Comentario enviado correctamente. Muchas gracias por ayudar a mejorar PokeMarket.');
      setMessage('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'No se pudo enviar el comentario.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-32 sm:bottom-20 right-4 sm:right-5 z-50 rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] px-4 sm:px-5 py-2.5 sm:py-3 shadow-lg hover:bg-[var(--primary-hover)] transition-colors text-xs sm:text-sm font-semibold"
      >
        Contacto
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] bg-black/60 flex items-end sm:items-center justify-center px-4 py-4">
          <div className="w-full max-w-md rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-xl overflow-hidden">
            <div className="border-b border-[var(--border)] px-5 py-4 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-[var(--foreground)]">
                Enviar idea o sugerencia
              </h2>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-xl text-[var(--muted)] hover:text-[var(--foreground)]"
              >
                ×
              </button>
            </div>

            <div className="p-5 space-y-4">
              <p className="text-sm text-[var(--muted)] leading-6">
                Cuéntanos ideas, mejoras o errores que hayas encontrado durante la beta de PokeMarket.
              </p>

              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full border border-[var(--border)] rounded-lg px-3 py-2 bg-[var(--surface)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-sm"
              >
                <option value="Idea">Idea</option>
                <option value="Mejora">Mejora</option>
                <option value="Error">Error</option>
                <option value="Otro">Otro</option>
              </select>

              <textarea
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Escribe tu comentario..."
                className="w-full border border-[var(--border)] rounded-lg px-3 py-2 bg-[var(--surface)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-sm"
              />

              <p className="text-xs text-[var(--muted-2)] text-right">
								{message.length}/2000
							</p>

              {error && (
                <p className="text-sm text-[var(--danger-fg)] bg-[var(--danger-bg)] border border-[var(--border)] rounded-lg p-2">
                  {error}
                </p>
              )}

              {success && (
                <p className="text-sm text-[var(--success-fg)] bg-[var(--success-bg)] border border-[var(--border)] rounded-lg p-2">
                  {success}
                </p>
              )}

              <button
                type="button"
                disabled={!message.trim() || loading}
                onClick={handleSend}
                className="w-full bg-[var(--primary)] hover:bg-[var(--primary-hover)] disabled:opacity-60 text-[var(--primary-foreground)] rounded-lg py-2 font-medium transition-colors"
              >
                {loading ? 'Enviando...' : 'Enviar comentario'}
              </button>

              <p className="text-xs text-[var(--muted-2)] text-center">
                Tu comentario será enviado directamente al equipo de PokeMarket.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}