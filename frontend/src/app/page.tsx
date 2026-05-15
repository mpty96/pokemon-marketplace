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
  return 'Lote';
}

export default function HomePage() {
  const [recentListings, setRecentListings] = useState<Listing[]>([]);
  const [popularListings, setPopularListings] = useState<Listing[]>([]);
  const [featuredSellers, setFeaturedSellers] = useState<FeaturedSeller[]>([]);
  const [loading, setLoading] = useState(true);
  const recentCards = recentListings.filter((l) => l.listingType === 'CARD');
  const popularCards = popularListings.filter((l) => l.listingType === 'CARD');
  const recentProducts = recentListings.filter((l) => l.listingType === 'POKEMON_PRODUCT');
  const popularProducts = popularListings.filter((l) => l.listingType === 'POKEMON_PRODUCT');
  const recentLots = recentListings.filter((l) => l.listingType === 'BULK_LOT');

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
              className="h-20 sm:h-24 md:h-28 w-auto object-contain"
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

      {loading ? (
        <div className="space-y-8">
          <SkeletonRow />
          <SkeletonRow />
        </div>
      ) : (
        <div className="space-y-10">
          <HorizontalListingSection
            title="Cartas recientes"
            description="Últimas cartas publicadas en PokeMarket."
            listings={recentCards}
            emptyText="Aún no hay cartas recientes."
            href="/marketplace?listingType=CARD"
          />

          <HorizontalListingSection
            title="Cartas populares"
            description="Cartas activas con más vistas."
            listings={popularCards}
            emptyText="Aún no hay cartas populares."
            href="/marketplace?listingType=CARD"
          />

          <HorizontalListingSection
            title="Productos recientes"
            description="Últimos productos Pokémon publicados."
            listings={recentProducts}
            emptyText="Aún no hay productos recientes."
            href="/marketplace?listingType=POKEMON_PRODUCT"
          />

          <HorizontalListingSection
            title="Productos populares"
            description="Productos Pokémon activos con más vistas."
            listings={popularProducts}
            emptyText="Aún no hay productos populares."
            href="/marketplace?listingType=POKEMON_PRODUCT"
          />

          <HorizontalListingSection
            title="Lotes recientes"
            description="Últimos lotes publicados por la comunidad."
            listings={recentLots}
            emptyText="Aún no hay lotes recientes."
            href="/marketplace?listingType=BULK_LOT"
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
  href = '/marketplace',
}: {
  title: string;
  description: string;
  listings: Listing[];
  emptyText: string;
  href?: string;
}) {
  return (
    <section className="min-w-0">
      <div className="flex items-start sm:items-end justify-between gap-3 mb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--foreground)]">{title}</h2>
          <p className="text-[var(--muted)] text-xs sm:text-sm leading-5">{description}</p>
        </div>

        <Link href={href} className="text-xs sm:text-sm text-[var(--primary)] hover:underline font-medium whitespace-nowrap">
          Ver todas →
        </Link>
      </div>

      {listings.length === 0 ? (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-8 text-center text-[var(--muted-2)]">
          {emptyText}
        </div>
      ) : (
        <div className="flex gap-3 sm:gap-4 overflow-x-auto mobile-scrollbar pb-3 snap-x snap-mandatory -mx-3 px-3 sm:mx-0 sm:px-0">
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
    <div className="min-w-[185px] max-w-[185px] sm:min-w-[230px] sm:max-w-[230px] bg-[var(--surface)] rounded-xl shadow-sm hover:shadow-md transition-shadow border border-[var(--border)] overflow-hidden snap-start">
      <Link href={`/listings/${listing.id}`} className="block group">
        <div className="aspect-square overflow-hidden bg-[var(--surface-2)]">
          <img
            src={listing.images[0]}
            alt={listing.title}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
          />
        </div>

        <div className="p-2.5 sm:p-3">
          <span className="inline-flex w-fit rounded-full bg-[var(--surface-2)] border border-[var(--border)] px-2 py-0.5 text-[10px] font-semibold text-[var(--muted)] mb-2">
            {typeLabel(listing.listingType)}
          </span>

          <h3 className="font-semibold text-[var(--foreground)] truncate text-xs sm:text-sm">
            {listing.cardName}
          </h3>

          <p className="text-xs text-[var(--muted-2)] truncate mt-0.5">
            {listing.edition}
          </p>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mt-2">
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
        <div className="flex gap-3 sm:gap-4 overflow-x-auto mobile-scrollbar pb-3 snap-x snap-mandatory -mx-3 px-3 sm:mx-0 sm:px-0">
          {sellers.map((seller) => (
            <Link
              key={seller.username}
              href={`/usuario/${seller.username}`}
              className="min-w-[185px] max-w-[185px] sm:min-w-[230px] sm:max-w-[230px] rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 sm:p-4 hover:shadow-md transition-shadow snap-start"
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