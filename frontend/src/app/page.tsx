'use client';

import Link from 'next/link';
import HomeFeed from '@/components/HomeFeed';

export default function HomePage() {
  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-5 sm:py-8 text-[var(--foreground)]">
      <section className="relative overflow-hidden rounded-xl sm:rounded-2xl mb-7 sm:mb-8 border border-[var(--border)] bg-[var(--surface)]">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/15 via-transparent to-[var(--primary)]/5" />
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.18) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        <div className="relative px-4 sm:px-6 py-8 sm:py-10 text-center">
          <div className="mb-3 flex justify-center">
            <img
              src="/logo-footer.png"
              alt="Compra y vende cartas Pokémon con confianza"
              className="h-24 sm:h-28 md:h-32 w-auto object-contain"
            />
          </div>

          <p className="text-[var(--muted)] mb-5 text-sm sm:text-base max-w-xl mx-auto leading-6">
            Plataforma especializada en compra y venta de artículos Pokémon para coleccionistas en Chile.
          </p>

          <div className="flex gap-2 justify-center flex-wrap">
            <Link
              href="/marketplace"
              className="bg-[var(--primary)] text-[var(--primary-foreground)] font-bold px-5 py-2.5 rounded-xl hover:bg-[var(--primary-hover)] transition-colors shadow-lg"
            >
              Ver marketplace
            </Link>

            <Link
              href="/listings/new"
              className="border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] font-bold px-5 py-2.5 rounded-xl hover:bg-[var(--surface-2)] transition-colors"
            >
              Publicar
            </Link>
          </div>
        </div>
      </section>

      <HomeFeed />
    </div>
  );
}