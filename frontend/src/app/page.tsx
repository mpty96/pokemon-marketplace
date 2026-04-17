'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/axios';
import { Listing, CardCondition, CardRarity } from '@/types';

const CONDITION_LABELS: Record<CardCondition, string> = {
  MINT: 'Mint', NEAR_MINT: 'Near Mint', EXCELLENT: 'Excelente',
  GOOD: 'Buena', PLAYED: 'Jugada', POOR: 'Dañada',
};

const RARITY_LABELS: Record<CardRarity, string> = {
  COMMON: 'Común', UNCOMMON: 'Poco común', RARE: 'Rara',
  HOLO_RARE: 'Holo Rara', ULTRA_RARE: 'Ultra Rara',
  SECRET_RARE: 'Secret Rara', PROMO: 'Promo',
};

export default function HomePage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    api.get('/api/listings?limit=8')
      .then(({ data }) => setListings(data.listings))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 text-[var(--foreground)]">

      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl mb-6 border border-[var(--border)] bg-[var(--surface)]">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/15 via-transparent to-[var(--primary)]/5" />
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.18) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        <div className="relative px-6 py-8 text-center">
          <div className="inline-flex items-center gap-2 bg-[var(--surface-2)] text-[var(--foreground)] text-xs font-semibold px-3 py-1 rounded-full mb-3 border border-[var(--border)]">
            🇨🇱 Solo para Chile
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold mb-2 tracking-tight text-[var(--foreground)]">
            Compra y vende cartas
            <span className="block text-[var(--primary)]">Pokémon con confianza</span>
          </h1>

          <p className="text-[var(--muted)] mb-5 text-base max-w-xl mx-auto">
            El marketplace más seguro de Chile para coleccionistas.
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
              Publicar carta
            </Link>
          </div>

          <div className="flex justify-center gap-8 mt-6 pt-5 border-t border-[var(--border)]">
            <div>
              <p className="text-xl font-extrabold text-[var(--primary)]">100%</p>
              <p className="text-xs text-[var(--muted)]">Seguro</p>
            </div>
            <div>
              <p className="text-xl font-extrabold text-[var(--primary)]">Chat</p>
              <p className="text-xs text-[var(--muted)]">Directo</p>
            </div>
            <div>
              <p className="text-xl font-extrabold text-[var(--primary)]">⭐ 5.0</p>
              <p className="text-xs text-[var(--muted)]">Reputación</p>
            </div>
          </div>
        </div>
      </div>

      {/* Publicaciones recientes */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[var(--foreground)]">
              Publicaciones recientes
            </h2>
            <p className="text-[var(--muted)]">
            Descubre las ultimas cartas publicadas en PokeMarket!
            </p>
          </div>
          <Link
            href="/marketplace"
            className="text-sm text-[var(--primary)] hover:text-[var(--primary-hover)] font-medium flex items-center gap-1"
          >
            Ver todas →
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-[var(--surface)] rounded-xl h-64 animate-pulse border border-[var(--border)]"
              />
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-16 text-[var(--muted-2)]">
            <p className="text-4xl mb-3">📭</p>
            <p>Aún no hay publicaciones. ¡Sé el primero en publicar!</p>
            <Link
              href="/listings/new"
              className="inline-block mt-4 bg-[var(--primary)] text-[var(--primary-foreground)] px-6 py-2 rounded-lg hover:bg-[var(--primary-hover)]"
            >
              Publicar carta
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ListingCard({ listing }: { listing: Listing }) {
  return (
    <div className="bg-[var(--surface)] rounded-xl shadow-sm hover:shadow-md transition-shadow border border-[var(--border)] overflow-hidden">
      {/* Card principal */}
      <Link href={`/listings/${listing.id}`} className="block group">
        <div className="aspect-square overflow-hidden bg-[var(--surface-2)]">
          <img
            src={listing.images[0]}
            alt={listing.title}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
          />
        </div>
        <div className="p-3">
          <p className="text-xs text-[var(--muted-2)] truncate">
            Edición: {listing.edition}
          </p>
          <h3 className="font-semibold text-[var(--foreground)] truncate text-sm mt-0.5">
            {listing.title}
          </h3>
          <div className="flex items-center justify-between mt-2">
            <span className="text-[var(--primary)] font-bold text-sm">
              ${listing.priceCLP.toLocaleString('es-CL')}
            </span>
            <span className="text-xs text-[var(--muted)] bg-[var(--surface-2)] px-2 py-0.5 rounded-full border border-[var(--border)]">
              {CONDITION_LABELS[listing.condition]}
            </span>
          </div>
        </div>
      </Link>

      {/* Separador */}
      <div className="border-t border-[var(--border)]" />

      {/* Card secundaria — vendedor */}
      <Link href={`/usuario/${listing.seller.username}`}
        className="flex items-center gap-2 px-3 py-2 hover:bg-[var(--surface-2)] transition-colors">
        <div className="w-6 h-6 rounded-full bg-[var(--info-bg)] flex items-center justify-center text-xs font-bold text-[var(--info-fg)] flex-shrink-0">
          {listing.seller.username[0].toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="text-xs text-[var(--muted-2)]">Vendedor:</p>
          <p className="text-xs font-medium text-[var(--foreground)] truncate">
            {listing.seller.profile?.displayName || listing.seller.username}
          </p>
        </div>
        <span className="ml-auto text-xs text-yellow-500 flex-shrink-0">
          ★ {listing.seller.profile?.reputationScore.toFixed(1) || '0.0'}
        </span>
      </Link>
    </div>
  );
}