'use client';

import { useState } from 'react';

export default function ContactFloatingButton() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');

  function handleSend() {
    const subject = encodeURIComponent('Idea o sugerencia para PokeMarket');
    const body = encodeURIComponent(message.trim());

    window.location.href = `mailto:contacto@tcgpokemarket.cl?subject=${subject}&body=${body}`;
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

              <textarea
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Escribe tu comentario..."
                className="w-full border border-[var(--border)] rounded-lg px-3 py-2 bg-[var(--surface)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-sm"
              />

              <button
                type="button"
                disabled={!message.trim()}
                onClick={handleSend}
                className="w-full bg-[var(--primary)] hover:bg-[var(--primary-hover)] disabled:opacity-60 text-[var(--primary-foreground)] rounded-lg py-2 font-medium transition-colors"
              >
                Enviar comentario
              </button>

              <p className="text-xs text-[var(--muted-2)] text-center">
                Se abrirá tu aplicación de correo para enviar el mensaje.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}