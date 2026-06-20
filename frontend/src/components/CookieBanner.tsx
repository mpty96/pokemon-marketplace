'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getConsent, setConsent } from '@/lib/cookies';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  // Solo se evalúa tras montar → evita mismatch de hidratación
  useEffect(() => {
    if (getConsent() === null) setVisible(true);
    const onChange = () => setVisible(getConsent() === null);
    window.addEventListener('pm-consent-change', onChange);
    return () => window.removeEventListener('pm-consent-change', onChange);
  }, []);

  if (!visible) return null;

  function choose(value: 'accepted' | 'rejected') {
    setConsent(value);
    setVisible(false);
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-3 sm:p-4">
      <div className="max-w-3xl mx-auto rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-lg p-4 sm:p-5">
        <p className="text-sm text-[var(--foreground)] leading-6">
          Usamos cookies necesarias para que el sitio funcione (mantener tu sesión iniciada).
          Con tu permiso, en el futuro podríamos usar cookies opcionales (por ejemplo, de
          estadísticas) para mejorar PokeMarket. Puedes aceptarlas o rechazarlas.{' '}
          <Link href="/cookies" className="text-[var(--primary)] hover:underline">
            Más información
          </Link>.
        </p>
        <div className="flex flex-col sm:flex-row gap-2 sm:justify-end mt-4">
          <button onClick={() => choose('rejected')}
            className="px-4 py-2 rounded-lg border border-[var(--border)] text-[var(--foreground)] text-sm font-medium hover:bg-[var(--surface-2)] transition-colors">
            Rechazar opcionales
          </button>
          <button onClick={() => choose('accepted')}
            className="px-4 py-2 rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)] text-sm font-medium hover:bg-[var(--primary-hover)] transition-colors">
            Aceptar todas
          </button>
        </div>
      </div>
    </div>
  );
}