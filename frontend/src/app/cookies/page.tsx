'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getConsent, setConsent, CookieConsent } from '@/lib/cookies';

export default function CookiesPage() {
  const [consent, setLocalConsent] = useState<CookieConsent | null>(null);

  useEffect(() => { setLocalConsent(getConsent()); }, []);

  function update(value: CookieConsent) {
    setConsent(value);
    setLocalConsent(value);
  }

  return (
    <div className="min-h-screen bg-[var(--background)] py-8 px-4">
      <div className="max-w-2xl mx-auto bg-[var(--surface)] rounded-xl border border-[var(--border)] p-6 sm:p-8 text-[var(--foreground)]">
        <h1 className="text-2xl font-bold mb-4">Política de Cookies</h1>

        <p className="text-sm text-[var(--muted)] leading-6 mb-4">
          Esta página explica qué cookies y almacenamiento local utiliza PokeMarket y cómo
          puedes gestionar tus preferencias.
        </p>

        <h2 className="text-lg font-semibold mt-6 mb-2">¿Qué son?</h2>
        <p className="text-sm text-[var(--muted)] leading-6">
          Son pequeños datos que se guardan en tu navegador y permiten que el sitio te
          recuerde entre páginas (por ejemplo, mantener tu sesión iniciada).
        </p>

        <h2 className="text-lg font-semibold mt-6 mb-2">Cookies necesarias</h2>
        <p className="text-sm text-[var(--muted)] leading-6">
          Imprescindibles para el funcionamiento del sitio: mantener tu sesión y tu inicio
          de sesión, y recordar tu preferencia de cookies. No requieren consentimiento y no
          pueden desactivarse sin afectar el uso de la plataforma.
        </p>

        <h2 className="text-lg font-semibold mt-6 mb-2">Cookies opcionales</h2>
        <p className="text-sm text-[var(--muted)] leading-6">
          Actualmente <strong>no utilizamos</strong> cookies de estadísticas ni de
          publicidad. Si en el futuro las incorporamos, solo se activarán si tú las aceptas.
        </p>

        <h2 className="text-lg font-semibold mt-6 mb-2">Gestionar tus preferencias</h2>
        <p className="text-sm text-[var(--muted)] leading-6 mb-3">
          Estado actual:{' '}
          <strong>
            {consent === 'accepted' ? 'Aceptaste las opcionales'
              : consent === 'rejected' ? 'Rechazaste las opcionales'
              : 'Sin elección registrada'}
          </strong>
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <button onClick={() => update('rejected')}
            className="px-4 py-2 rounded-lg border border-[var(--border)] text-sm font-medium hover:bg-[var(--surface-2)] transition-colors">
            Rechazar opcionales
          </button>
          <button onClick={() => update('accepted')}
            className="px-4 py-2 rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)] text-sm font-medium hover:bg-[var(--primary-hover)] transition-colors">
            Aceptar todas
          </button>
        </div>

        <p className="text-sm text-[var(--muted)] leading-6 mt-6">
          ¿Dudas? Escríbenos desde la sección de{' '}
          <Link href="/" className="text-[var(--primary)] hover:underline">Contacto</Link>{' '}
          o revisa nuestra{' '}
          <Link href="/privacy" className="text-[var(--primary)] hover:underline">Política de Privacidad</Link>.
        </p>
      </div>
    </div>
  );
}