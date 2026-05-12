'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/axios';
import { Listing, CardCondition, FeaturedSeller } from '@/types';

const CONDITION_LABELS: Record<CardCondition, string> = {
  MINT: 'Mint',
  NEAR_MINT: 'Near Mint',
  EXCELLENT: 'Excelente',
  GOOD: 'Buena',
  PLAYED: 'Jugada',
  POOR: 'Dañada',
};

function typeLabel(type: Listing['listingType']) {
  if (type === 'CARD') return 'Carta';
  if (type === 'POKEMON_PRODUCT') return 'Producto Pokémon';
  return 'Challa';
}

export default function HomePage() {
  const [recentListings, setRecentListings] = useState<Listing[]>([]);
  const [popularListings, setPopularListings] = useState<Listing[]>([]);
  const [featuredSellers, setFeaturedSellers] = useState<FeaturedSeller[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/api/listings/home/recent'),
      api.get('/api/listings/home/popular'),
      api.get('/api/profile/featured-sellers'),
    ])
      .then(([recentRes, popularRes, sellersRes]) => {
        setRecentListings(recentRes.data);
        setPopularListings(popularRes.data);
        setFeaturedSellers(sellersRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 text-[var(--foreground)]">
      <section className="relative overflow-hidden rounded-2xl mb-8 border border-[var(--border)] bg-[var(--surface)]">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/15 via-transparent to-[var(--primary)]/5" />
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.18) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        <div className="relative px-6 py-10 text-center">
          <div className="inline-flex items-center gap-2 bg-[var(--surface-2)] text-[var(--foreground)] text-xs font-semibold px-3 py-1 rounded-full mb-3 border border-[var(--border)]">
            Solo para Chile
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold mb-2 tracking-tight text-[var(--foreground)]">
            Compra y vende cartas
            <span className="block text-[var(--primary)]">Pokémon con confianza</span>
          </h1>

          <p className="text-[var(--muted)] mb-5 text-base max-w-xl mx-auto">
            Marketplace para cartas, productos Pokémon y lotes/challas entre coleccionistas.
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

      {loading ? (
        <div className="space-y-8">
          <SkeletonRow />
          <SkeletonRow />
        </div>
      ) : (
        <div className="space-y-10">
          <HorizontalListingSection
            title="Cartas recientes"
            description="Últimas publicaciones activas en PokeMarket."
            listings={recentListings}
            emptyText="Aún no hay publicaciones recientes."
          />

          <HorizontalListingSection
            title="Cartas populares"
            description="Publicaciones activas con más vistas."
            listings={popularListings}
            emptyText="Aún no hay publicaciones populares."
          />

          <FeaturedSellersSection sellers={featuredSellers} />
        </div>
      )}
    </div>
  );
}

function SkeletonRow() {
  return (
    <div>
      <div className="h-7 w-48 bg-[var(--surface-2)] rounded mb-4 animate-pulse" />
      <div className="flex gap-4 overflow-hidden">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="min-w-[230px] h-72 bg-[var(--surface)] rounded-xl animate-pulse border border-[var(--border)]"
          />
        ))}
      </div>
    </div>
  );
}

function HorizontalListingSection({
  title,
  description,
  listings,
  emptyText,
}: {
  title: string;
  description: string;
  listings: Listing[];
  emptyText: string;
}) {
  return (
    <section>
      <div className="flex items-end justify-between gap-4 mb-4">
        <div>
          <h2 className="text-2xl font-bold text-[var(--foreground)]">{title}</h2>
          <p className="text-[var(--muted)] text-sm">{description}</p>
        </div>

        <Link href="/marketplace" className="text-sm text-[var(--primary)] hover:underline font-medium">
          Ver todas →
        </Link>
      </div>

      {listings.length === 0 ? (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-8 text-center text-[var(--muted-2)]">
          {emptyText}
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-3 snap-x">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </section>
  );
}

function ListingCard({ listing }: { listing: Listing }) {
  return (
    <div className="min-w-[230px] max-w-[230px] bg-[var(--surface)] rounded-xl shadow-sm hover:shadow-md transition-shadow border border-[var(--border)] overflow-hidden snap-start">
      <Link href={`/listings/${listing.id}`} className="block group">
        <div className="aspect-square overflow-hidden bg-[var(--surface-2)]">
          <img
            src={listing.images[0]}
            alt={listing.title}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
          />
        </div>

        <div className="p-3">
          <span className="inline-flex w-fit rounded-full bg-[var(--surface-2)] border border-[var(--border)] px-2 py-0.5 text-[10px] font-semibold text-[var(--muted)] mb-2">
            {typeLabel(listing.listingType)}
          </span>

          <h3 className="font-semibold text-[var(--foreground)] truncate text-sm">
            {listing.cardName}
          </h3>

          <p className="text-xs text-[var(--muted-2)] truncate mt-0.5">
            {listing.edition}
          </p>

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

      <div className="border-t border-[var(--border)]" />

      <Link
        href={`/usuario/${listing.seller.username}`}
        className="flex items-center gap-2 px-3 py-2 hover:bg-[var(--surface-2)] transition-colors"
      >
        <div className="w-6 h-6 rounded-full bg-[var(--info-bg)] flex items-center justify-center text-xs font-bold text-[var(--info-fg)] flex-shrink-0 overflow-hidden">
          {listing.seller.profile?.avatarUrl ? (
            <img src={listing.seller.profile.avatarUrl} alt={listing.seller.username} className="w-full h-full object-cover" />
          ) : (
            listing.seller.username[0].toUpperCase()
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-xs text-[var(--muted-2)]">Vendedor:</p>
          <p className="text-xs font-medium text-[var(--foreground)] truncate">
            {listing.seller.profile?.displayName || listing.seller.username}
          </p>
        </div>

        <span className="text-[#e0a800] font-semibold text-xs">
          ★ {listing.seller.profile?.reputationScore.toFixed(1) || '0.0'}
        </span>
      </Link>
    </div>
  );
}

function FeaturedSellersSection({ sellers }: { sellers: FeaturedSeller[] }) {
  return (
    <section>
      <div className="flex items-end justify-between gap-4 mb-4">
        <div>
          <h2 className="text-2xl font-bold text-[var(--foreground)]">Vendedores destacados</h2>
          <p className="text-[var(--muted)] text-sm">
            Usuarios con publicaciones activas y mejor reputación.
          </p>
        </div>
      </div>

      {sellers.length === 0 ? (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-8 text-center text-[var(--muted-2)]">
          Aún no hay vendedores destacados.
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-3 snap-x">
          {sellers.map((seller) => (
            <Link
              key={seller.username}
              href={`/usuario/${seller.username}`}
              className="min-w-[230px] max-w-[230px] rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 hover:shadow-md transition-shadow snap-start"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[var(--info-bg)] flex items-center justify-center font-bold text-[var(--info-fg)] overflow-hidden">
                  {seller.avatarUrl ? (
                    <img src={seller.avatarUrl} alt={seller.username} className="w-full h-full object-cover" />
                  ) : (
                    seller.username[0].toUpperCase()
                  )}
                </div>

                <div className="min-w-0">
                  <p className="font-semibold text-[var(--foreground)] truncate">
                    {seller.displayName || seller.username}
                  </p>
                  <p className="text-xs text-[var(--muted)] truncate">
                    @{seller.username}
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-2 text-sm">
                <p className="text-[var(--muted)]">
                  📍 {seller.location || 'Sin ubicación'}
                </p>

                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg bg-[var(--surface-2)] border border-[var(--border)] p-2 text-center">
                    <p className="text-[#e0a800] font-bold">
                      ★ {seller.reputationScore.toFixed(1)}
                    </p>
                    <p className="text-[10px] text-[var(--muted)]">Global</p>
                  </div>

                  <div className="rounded-lg bg-[var(--surface-2)] border border-[var(--border)] p-2 text-center">
                    <p className="font-bold text-[var(--foreground)]">
                      {seller.activeListingsCount}
                    </p>
                    <p className="text-[10px] text-[var(--muted)]">Activas</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}