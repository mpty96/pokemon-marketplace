'use client';

import { useEffect, useState } from 'react';

// Subir esta versión cada vez que publiques novedades nuevas → el modal reaparece
const NEWS_VERSION = '2026-06-20';
const STORAGE_KEY = 'pm_news_seen';

const NEWS = {
  date: '20 de junio de 2026',
  intro: 'Estuvimos trabajando para mejorar tu experiencia. Esto es lo nuevo:',
  sections: [
    {
      label: 'Novedades',
      items: [
        'Ahora puedes subir hasta 5 fotos por publicación.',
        'Galería tipo carrusel en cada publicación: desliza o usa las flechas, y toca una imagen para ampliarla.',
        'Nueva opción de idioma "Varios" para publicaciones de Lote.',
      ],
    },
    {
      label: 'Correcciones',
      items: [
        'Arreglamos las secciones de la portada (recientes y populares) que mostraban menos publicaciones de las que correspondía.',
        'Al publicar, el mensaje de confirmación ahora indica correctamente si fue una Carta, Producto o Lote.',
      ],
    },
  ],
};

export default function NewsModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY) !== NEWS_VERSION) setOpen(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  function close() {
    localStorage.setItem(STORAGE_KEY, NEWS_VERSION);
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
      onClick={close}
      role="dialog"
      aria-modal="true"
      aria-labelledby="news-title"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md max-h-[85vh] overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-xl"
      >
        <div className="flex items-start justify-between gap-3 p-5 border-b border-[var(--border)]">
          <div>
            <h2 id="news-title" className="text-lg font-bold text-[var(--foreground)]">
              Novedades de PokeMarket
            </h2>
            <p className="text-xs text-[var(--muted-2)] mt-0.5">{NEWS.date}</p>
          </div>
          <button
            onClick={close}
            aria-label="Cerrar"
            className="h-8 w-8 rounded-full text-[var(--muted)] hover:bg-[var(--surface-2)] flex items-center justify-center text-lg shrink-0"
          >
            ×
          </button>
        </div>

        <div className="p-5 space-y-5">
          <p className="text-sm text-[var(--muted)] leading-6">{NEWS.intro}</p>

          {NEWS.sections.map((section) => (
            <div key={section.label}>
              <h3 className="text-sm font-semibold text-[var(--foreground)] mb-2">
                {section.label}
              </h3>
              <ul className="space-y-1.5">
                {section.items.map((item, i) => (
                  <li key={i} className="text-sm text-[var(--muted)] leading-6 flex gap-2">
                    <span className="text-[var(--primary)] mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="rounded-xl bg-[var(--surface-2)] border border-[var(--border)] p-4">
            <p className="text-sm text-[var(--foreground)] leading-6">
              💬 <strong>Leemos cada mensaje</strong> que nos dejas en el botón de{' '}
              <strong>Contacto</strong> (abajo a la derecha). Muchas de estas mejoras
              salieron de tus sugerencias. ¡Sigue enviándolas!
            </p>
          </div>

          <button
            onClick={close}
            className="w-full bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--primary-foreground)] font-medium py-2.5 rounded-lg transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}