'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { Listing, CardCondition, CardRarity, CardLanguage, ListingType, PaginatedListings } from '@/types';

const CONDITIONS: { value: CardCondition; label: string }[] = [
  { value: 'MINT',      label: 'Mint' },
  { value: 'NEAR_MINT', label: 'Near Mint' },
  { value: 'EXCELLENT', label: 'Excelente' },
  { value: 'GOOD',      label: 'Buena' },
  { value: 'PLAYED',    label: 'Jugada' },
  { value: 'POOR',      label: 'Dañada' },
];

const NON_CARD_CONDITIONS: { value: CardCondition; label: string }[] = [
  { value: 'EXCELLENT', label: 'Excelente' },
  { value: 'GOOD', label: 'Buena' },
  { value: 'POOR', label: 'Dañada' },
];

const RARITIES: { value: CardRarity; label: string }[] = [
  { value: 'COMMON',      label: 'Común' },
  { value: 'UNCOMMON',    label: 'Poco común' },
  { value: 'RARE',        label: 'Rara' },
  { value: 'HOLO_RARE',   label: 'Holo Rara' },
  { value: 'ULTRA_RARE',  label: 'Ultra Rara' },
  { value: 'SECRET_RARE', label: 'Secret Rara' },
  { value: 'PROMO',       label: 'Promo' },
];

const LANGUAGES: { value: CardLanguage; label: string }[] = [
  { value: 'ESP', label: 'Español' },
  { value: 'ENG', label: 'Inglés' },
  { value: 'POR', label: 'Portugués' },
  { value: 'JPN', label: 'Japonés' },
  { value: 'KOR', label: 'Coreano' },
  { value: 'CHN', label: 'Chino' },
  { value: 'OTHER', label: 'Otro' }
];

const LISTING_TYPES: { value: ListingType; label: string }[] = [
  { value: 'CARD', label: 'Carta' },
  { value: 'POKEMON_PRODUCT', label: 'Productos Pokémon' },
  { value: 'BULK_LOT', label: 'Lotes' },
];

const CONDITION_LABELS: Record<CardCondition, string> = {
  MINT: 'Mint',
  NEAR_MINT: 'Near Mint',
  EXCELLENT: 'Excelente',
  GOOD: 'Buena',
  PLAYED: 'Jugada',
  POOR: 'Dañada',
};

function MarketplaceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [data, setData] = useState<PaginatedListings | null>(null);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    seller: searchParams.get('seller') || '',
    listingType: searchParams.get('listingType') || '',
    edition: searchParams.get('edition') || '',
    condition: searchParams.get('condition') || '',
    rarity: searchParams.get('rarity') || '',
    language: searchParams.get('language') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    page: Number(searchParams.get('page') || 1),
  });

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => {
        if (v) params.set(k, String(v));
      });
      const { data: result } = await api.get(`/api/listings?${params.toString()}`);
      setData(result);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  function handleFilterChange(key: string, value: string) {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  }

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    fetchListings();
  }

  function clearFilters() {
    setFilters({
      search: '',
      seller: '',
      listingType: '',
      edition: '',
      condition: '',
      rarity: '',
      language: '',
      minPrice: '',
      maxPrice: '',
      page: 1,
    });
  }

  const selectClass =
    'w-full border border-[var(--border)] rounded-lg px-3 py-2 bg-[var(--surface)] text-[var(--foreground)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]';
  const inputClass = selectClass;

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-5 sm:py-8 text-[var(--foreground)]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-[var(--foreground)]">Marketplace</h1>
        <Link
          href="/listings/new"
          className="w-full sm:w-auto text-center bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--primary-foreground)] text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + Publicar carta
        </Link>
      </div>

<div className="space-y-5">
  <div className="bg-[var(--surface)] rounded-xl shadow-sm border border-[var(--border)] p-4 sm:p-5">
    <div className="flex items-center justify-between gap-3 mb-4">
      <h2 className="font-semibold text-[var(--foreground)]">
        Filtros de búsqueda
      </h2>

      <button
        onClick={clearFilters}
        className="text-xs text-[var(--primary)] hover:underline"
      >
        Limpiar
      </button>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      <form onSubmit={handleSearch} className="lg:col-span-2">
        <label className="block text-[10px] sm:text-xs font-medium text-[var(--muted)] mb-1 uppercase tracking-wide">
          Buscar
        </label>

        <div className="grid grid-cols-[1fr_auto] gap-2">
          <input
            type="text"
            placeholder="Charizard..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className={inputClass}
          />

          <button
            type="submit"
            className="bg-[var(--primary)] text-[var(--primary-foreground)] px-4 rounded-lg hover:bg-[var(--primary-hover)] text-sm"
          >
            →
          </button>
        </div>
      </form>

      <div>
        <label className="block text-[10px] sm:text-xs font-medium text-[var(--muted)] mb-1 uppercase tracking-wide">
          Tipo de publicación
        </label>

        <select
          value={filters.listingType}
          onChange={(e) => {
            const nextType = e.target.value;

            setFilters((prev) => ({
              ...prev,
              listingType: nextType,
              condition: '',
              rarity: '',
              page: 1,
            }));
          }}
          className={selectClass}
        >
          <option value="">Todos</option>
          {LISTING_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-[10px] sm:text-xs font-medium text-[var(--muted)] mb-1 uppercase tracking-wide">
          Usuario
        </label>

        <input
          type="text"
          placeholder="usuario o nombre visible"
          value={filters.seller}
          onChange={(e) => handleFilterChange('seller', e.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <label className="block text-[10px] sm:text-xs font-medium text-[var(--muted)] mb-1 uppercase tracking-wide">
          Edición
        </label>

        <input
          type="text"
          placeholder="Base Set, Jungle..."
          value={filters.edition}
          onChange={(e) => handleFilterChange('edition', e.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <label className="block text-[10px] sm:text-xs font-medium text-[var(--muted)] mb-1 uppercase tracking-wide">
          Condición
        </label>

        <select
          value={filters.condition}
          onChange={(e) => handleFilterChange('condition', e.target.value)}
          className={selectClass}
        >
          <option value="">Todas</option>
          {(filters.listingType === 'CARD' || !filters.listingType
            ? CONDITIONS
            : NON_CARD_CONDITIONS
          ).map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      {(!filters.listingType || filters.listingType === 'CARD') && (
        <div>
          <label className="block text-[10px] sm:text-xs font-medium text-[var(--muted)] mb-1 uppercase tracking-wide">
            Rareza
          </label>

          <select
            value={filters.rarity}
            onChange={(e) => handleFilterChange('rarity', e.target.value)}
            className={selectClass}
          >
            <option value="">Todas</option>
            {RARITIES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="block text-[10px] sm:text-xs font-medium text-[var(--muted)] mb-1 uppercase tracking-wide">
          Idioma
        </label>

        <select
          value={filters.language}
          onChange={(e) => handleFilterChange('language', e.target.value)}
          className={selectClass}
        >
          <option value="">Todos</option>
          {LANGUAGES.map((l) => (
            <option key={l.value} value={l.value}>
              {l.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-[10px] sm:text-xs font-medium text-[var(--muted)] mb-1 uppercase tracking-wide">
          Precio (CLP)
        </label>

        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="Mín"
            value={filters.minPrice}
            onChange={(e) => handleFilterChange('minPrice', e.target.value)}
            className={inputClass}
          />

          <input
            type="number"
            placeholder="Máx"
            value={filters.maxPrice}
            onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
            className={inputClass}
          />
        </div>
      </div>
    </div>
  </div>

  <div>
    {loading ? (
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="bg-[var(--surface)] rounded-xl h-72 animate-pulse border border-[var(--border)]"
          />
        ))}
      </div>
    ) : !data || data.listings.length === 0 ? (
      <div className="text-center py-20 text-[var(--muted-2)]">
        <p className="text-5xl mb-4">🔍</p>
        <p className="text-lg">No se encontraron publicaciones</p>

        <button
          onClick={clearFilters}
          className="mt-4 text-[var(--primary)] hover:underline text-sm"
        >
          Limpiar filtros
        </button>
      </div>
    ) : (
      <>
        <p className="text-sm text-[var(--muted)] mb-4">
          {data.pagination.total} resultado{data.pagination.total !== 1 ? 's' : ''}
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {data.listings.map((listing) => (
            <MarketplaceCard key={listing.id} listing={listing} />
          ))}
        </div>

        {data.pagination.totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            <button
              disabled={filters.page <= 1}
              onClick={() => setFilters((p) => ({ ...p, page: p.page - 1 }))}
              className="px-4 py-2 border border-[var(--border)] rounded-lg text-sm disabled:opacity-40 hover:bg-[var(--surface-2)] bg-[var(--surface)] text-[var(--foreground)]"
            >
              ← Anterior
            </button>

            <span className="px-4 py-2 text-sm text-[var(--muted)]">
              {filters.page} / {data.pagination.totalPages}
            </span>

            <button
              disabled={filters.page >= data.pagination.totalPages}
              onClick={() => setFilters((p) => ({ ...p, page: p.page + 1 }))}
              className="px-4 py-2 border border-[var(--border)] rounded-lg text-sm disabled:opacity-40 hover:bg-[var(--surface-2)] bg-[var(--surface)] text-[var(--foreground)]"
            >
              Siguiente →
            </button>
          </div>
        )}
      </>
    )}
  </div>
</div>
    </div>
  );
}

function MarketplaceCard({ listing }: { listing: Listing }) {
  return (
    <Link
      href={`/listings/${listing.id}`}
      className="bg-[var(--surface)] rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-[var(--border)] group flex flex-col min-w-0"
    >
      <div className="aspect-square overflow-hidden bg-[var(--surface-2)]">
        <img
          src={listing.images[0]}
          alt={listing.title}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
        />
      </div>

      <div className="p-3 sm:p-4 flex flex-col flex-1 min-w-0">
        <span className="mb-2 inline-flex w-fit rounded-full bg-[var(--surface-2)] border border-[var(--border)] px-2 py-0.5 text-[10px] font-semibold text-[var(--muted)]">
          {listing.listingType === 'CARD'
            ? 'Carta'
            : listing.listingType === 'POKEMON_PRODUCT'
            ? 'Producto Pokémon'
            : 'Lote'}
        </span>

        <p className="text-[10px] sm:text-xs text-[var(--muted-2)] truncate mt-0.5">
          {listing.edition}
        </p>
        
        <h3 className="font-semibold text-[var(--foreground)] text-[10px] sm:text-xs sm:text-sm truncate">
          {listing.cardName}
        </h3>

        <p className="text-sm sm:text-base font-bold text-[var(--primary)] mt-1">
          ${listing.priceCLP.toLocaleString('es-CL')}
        </p>

        {listing.listingType === 'POKEMON_PRODUCT' && (
          <p className="text-[10px] sm:text-xs text-[var(--muted)] mt-1">
            Stock disponible: {listing.stock ?? 1}
          </p>
        )}

        <div className="flex gap-1 sm:gap-1.5 mt-2 flex-wrap">
          {listing.listingType === 'CARD' && (
            <span className="text-[10px] sm:text-xs bg-[var(--info-bg)] text-[var(--info-fg)] px-2 py-0.5 rounded-full">
              {listing.rarity.replace('_', ' ')}
            </span>
          )}

          <span className="text-[10px] sm:text-xs bg-[var(--surface-2)] text-[var(--muted)] px-2 py-0.5 rounded-full border border-[var(--border)]">
            {CONDITION_LABELS[listing.condition]}
          </span>
        </div>

        <div className="mt-auto pt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <span className="text-[10px] sm:text-xs text-[var(--muted-2)]">
            <span className="text-[#e0a800] font-semibold">
              ★ {listing.seller.profile?.reputationScore.toFixed(1) || '0.0'}
            </span>
            {' · '}
            {listing.seller.profile?.displayName || listing.seller.username}
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function MarketplacePage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse h-8 bg-[var(--surface-2)] rounded w-48 mb-6" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="bg-[var(--surface)] rounded-xl h-72 border border-[var(--border)]" />
            ))}
          </div>
        </div>
      }
    >
      <MarketplaceContent />
    </Suspense>
  );
}