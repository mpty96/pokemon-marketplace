'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/axios';
import {
  Listing,
  CardCondition,
  CardRarity,
  ListingSalesHistoryItem,
  SalesHistoryRange,
} from '@/types';
import { useAuthStore } from '@/store/auth.store';
import Link from 'next/link';


const CONDITION_LABELS: Record<CardCondition, string> = {
  MINT: 'Mint', NEAR_MINT: 'Near Mint', EXCELLENT: 'Excelente',
  GOOD: 'Buena', PLAYED: 'Jugada', POOR: 'Dañada',
};

const RARITY_LABELS: Record<CardRarity, string> = {
  COMMON: 'Común', UNCOMMON: 'Poco común', RARE: 'Rara',
  HOLO_RARE: 'Holo Rara', ULTRA_RARE: 'Ultra Rara',
  SECRET_RARE: 'Secret Rara', PROMO: 'Promo',
};

export default function ListingDetailPage() {
  const { id }                          = useParams<{ id: string }>();
  const router                          = useRouter();
  const { user, isAuthenticated }       = useAuthStore();
  const [listing, setListing]           = useState<Listing | null>(null);
  const [activeImg, setActiveImg]       = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const touchStartX                     = useRef<number | null>(null);
  const [loading, setLoading]           = useState(true);
  const [historyRange, setHistoryRange] = useState<SalesHistoryRange>('1m');
  const [salesHistory, setSalesHistory] = useState<ListingSalesHistoryItem[]>([]);
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    api.get(`/api/listings/${id}`)
      .then(({ data }) => { setListing(data); setLoading(false); })
      .catch(() => { router.push('/marketplace'); });
  }, [id]);

  useEffect(() => {
  if (!id) return;

  api
    .get(`/api/sales/listing/${id}/history?range=${historyRange}`)
    .then(({ data }) => setSalesHistory(data))
    .catch(() => setSalesHistory([]));
}, [id, historyRange]);

  useEffect(() => {
    if (!listing || listing.listingType !== 'POKEMON_PRODUCT') return;

    const maxAllowed = Math.min(3, listing.stock || 1);

    if (quantity > maxAllowed) {
      setQuantity(maxAllowed);
    }
  }, [listing, quantity]);

  useEffect(() => {
  if (!lightboxOpen || !listing) return;
  const count = listing.images.length;
  document.body.style.overflow = 'hidden';
  function onKey(e: KeyboardEvent) {
    if (e.key === 'Escape') setLightboxOpen(false);
    else if (e.key === 'ArrowLeft')  setActiveImg((i) => (i - 1 + count) % count);
    else if (e.key === 'ArrowRight') setActiveImg((i) => (i + 1) % count);
  }
  window.addEventListener('keydown', onKey);
  return () => {
    window.removeEventListener('keydown', onKey);
    document.body.style.overflow = '';
  };
}, [lightboxOpen, listing]);

  async function handleDelete() {
    if (!confirm('¿Eliminar esta publicación?')) return;
    await api.delete(`/api/listings/${id}`);
    router.push('/marketplace');
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">Cargando...</p>
    </div>
  );

  if (!listing) return null;

  const isOwner = user?.id === listing.sellerId;

  function prevImg() { setActiveImg((i) => (i - 1 + listing!.images.length) % listing!.images.length); }
  function nextImg() { setActiveImg((i) => (i + 1) % listing!.images.length); }
  function handleTouchStart(e: React.TouchEvent) { touchStartX.current = e.changedTouches[0].clientX; }
  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) < 40) return;
    dx > 0 ? prevImg() : nextImg();
  }

  const prices = salesHistory.map((item) => item.priceCLP);
  const latestPrice = prices.length ? prices[prices.length - 1] : listing.priceCLP;
  const minPrice = prices.length ? Math.min(...prices) : listing.priceCLP;
  const maxPrice = prices.length ? Math.max(...prices) : listing.priceCLP;

  const chartMinPrice = Math.max(0, minPrice - Math.max(1000, Math.round(minPrice * 0.08)));
  const chartMaxPrice = maxPrice + Math.max(1000, Math.round(maxPrice * 0.08));

  function getPointX(index: number) {
    if (salesHistory.length <= 1) return 50;
    return 8 + (index / (salesHistory.length - 1)) * 84;
  }

  function getPointY(price: number) {
    const range = chartMaxPrice - chartMinPrice;
    if (!range) return 50;
    return 86 - ((price - chartMinPrice) / range) * 68;
  }

  const chartPoints =
    salesHistory.length === 1
      ? `8,${getPointY(salesHistory[0].priceCLP)} 92,${getPointY(salesHistory[0].priceCLP)}`
      : salesHistory.map((item, index) => `${getPointX(index)},${getPointY(item.priceCLP)}`).join(' ');

  const areaPoints = chartPoints
    ? `8,88 ${chartPoints} 92,88`
    : '';

  const hoveredSale = hoveredPoint !== null ? salesHistory[hoveredPoint] : null;

  function formatShortDate(date?: string) {
    if (!date) return '';
    return new Date(date).toLocaleDateString('es-CL', {
      day: '2-digit',
      month: '2-digit',
    });
  }

  function formatFullDate(date?: string) {
    if (!date) return '';
    return new Date(date).toLocaleDateString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }


  return (
    <div className="min-h-screen bg-[var(--background)] py-5 sm:py-8 px-3 sm:px-4">
      <div className="max-w-5xl mx-auto min-w-0">
        <button onClick={() => router.back()}
          className="text-[var(--primary)] hover:underline mb-6 flex items-center gap-1"
          >
          ← Volver
        </button>

        <div className="bg-[var(--surface)] rounded-xl shadow border border-[var(--border)] overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">

            {/* Imágenes */}
            <div className="p-4 sm:p-6">
              <div className="relative">
                <img
                  src={listing.images[activeImg]}
                  alt={listing.title}
                  onClick={() => setLightboxOpen(true)}
                  onTouchStart={handleTouchStart}
                  onTouchEnd={handleTouchEnd}
                  className="w-full max-h-[420px] aspect-square object-contain rounded-lg bg-[var(--surface-2)] cursor-zoom-in select-none"
                />

                {listing.images.length > 1 && (
                  <>
                    <button type="button" onClick={(e) => { e.stopPropagation(); prevImg(); }}
                      className="absolute left-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-black/45 text-white flex items-center justify-center hover:bg-black/65 transition-colors"
                      aria-label="Imagen anterior">‹</button>
                    <button type="button" onClick={(e) => { e.stopPropagation(); nextImg(); }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-black/45 text-white flex items-center justify-center hover:bg-black/65 transition-colors"
                      aria-label="Imagen siguiente">›</button>
                    <span className="absolute bottom-2 right-2 bg-black/55 text-white text-xs px-2 py-0.5 rounded-full">
                      {activeImg + 1} / {listing.images.length}
                    </span>
                  </>
                )}
              </div>

              {listing.images.length > 1 && (
                <div className="flex gap-2 mt-3 flex-wrap">
                  {listing.images.map((src, i) => (
                    <button key={i} onClick={() => setActiveImg(i)}>
                      <img src={src} alt={`img-${i}`}
                        className={`w-16 h-16 object-cover rounded border-2 transition-colors
                          ${activeImg === i ? 'border-[var(--primary)]' : 'border-[var(--border)]'}`} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-4 sm:p-6 flex flex-col justify-between min-w-0">
              <div className="space-y-4">
                <div>
                  <span className="text-xs text-[var(--muted-2)] uppercase tracking-wide">
                    Edición: {listing.edition}{listing.setNumber && ` · #${listing.setNumber}`}
                  </span>
                  <h1 className="text-xl sm:text-2xl font-bold text-[var(--foreground)] mt-1 break-words">
                    {listing.title}
                  </h1>
                </div>

                <div className="text-2xl sm:text-3xl font-bold text-[var(--primary)]">
                  ${listing.priceCLP.toLocaleString('es-CL')}
                </div>

                {listing.listingType === 'POKEMON_PRODUCT' && (
                  <p className="text-sm font-medium text-[var(--foreground)]">
                    Stock disponible:{' '}
                    <span className="text-[var(--primary)]">
                      {listing.stock ?? 1}
                    </span>
                  </p>
                )}

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[var(--muted)] w-20 shrink-0">Condición:</span>
                    <span className="px-3 py-1 bg-[var(--success-bg)] text-[var(--success-fg)] rounded-full text-sm font-medium">
                      {CONDITION_LABELS[listing.condition]}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[var(--muted)] w-20 shrink-0">Rareza:</span>
                    <span className="px-3 py-1 bg-[var(--info-bg)] text-[var(--info-fg)] rounded-full text-sm font-medium">
                      {RARITY_LABELS[listing.rarity]}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[var(--muted)] w-20 shrink-0">Idioma:</span>
                    <span className="px-3 py-1 bg-[var(--surface-2)] text-[var(--foreground)] rounded-full text-sm font-medium border border-[var(--border)]">
                      {listing.language === 'ESP'
                        ? 'Español'
                        : listing.language === 'ENG'
                        ? 'Inglés'
                        : listing.language === 'POR'
                        ? 'Portugués'
                        : listing.language === 'JPN'
                        ? 'Japonés'
                        : listing.language === 'KOR'
                        ? 'Coreano'
                        : listing.language === 'CHN'
                        ? 'Chino'
                        : 'Otro'}
                    </span>
                  </div>
                </div>

                {listing.description && (
                  <p className="text-[var(--muted)] text-sm leading-relaxed">
                    {listing.description}
                  </p>
                )}

                <div className="border-t border-[var(--border)] pt-4">
                  <p className="text-sm text-[var(--muted)]">Vendido por</p>
                  <Link
                    href={`/usuario/${listing.seller.username}`}
                    className="font-medium text-[var(--primary)] hover:underline">
                    {listing.seller.profile?.displayName || listing.seller.username}
                  </Link>
                  <p className="text-sm text-[#e0a800]">
                    ★ {listing.seller.profile?.reputationScore.toFixed(1) || '0.0'}
                  </p>
                </div>

                <p className="text-xs text-[var(--muted-2)]">
                  {listing.views} vista{listing.views !== 1 ? 's' : ''}
                </p>
              </div>

              <div className="mt-6 space-y-3">
                {isOwner ? (
                  <>
                    <button
                      onClick={handleDelete}
                      className="w-full border border-[var(--danger-fg)] text-[var(--danger-fg)] hover:bg-[var(--danger-bg)] font-medium py-2 rounded-lg transition-colors"
                    >
                      Eliminar publicación
                    </button>
                  </>
                ) : isAuthenticated ? (
                  <div className="flex flex-col sm:flex-row gap-3">
                    {listing.listingType === 'POKEMON_PRODUCT' && (
                      <div className="sm:w-44">
                        <label className="block text-xs font-medium text-[var(--muted)] mb-1">
                          Cantidad requerida:
                        </label>

                        <select
                          value={quantity}
                          onChange={(e) => setQuantity(Number(e.target.value))}
                          className="w-full border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                        >
                          {Array.from({
                            length: Math.min(3, listing.stock || 1),
                          }).map((_, index) => {
                            const value = index + 1;

                            return (
                              <option key={value} value={value}>
                                {value} unidad{value > 1 ? 'es' : ''}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                    )}

                    <button
                      onClick={() => {
                        if (listing.listingType === 'POKEMON_PRODUCT') {
                          sessionStorage.setItem(`listing:${id}:quantity`, String(quantity));
                        }

                        router.push(
                          `/listings/${id}/chat${
                            listing.listingType === 'POKEMON_PRODUCT'
                              ? `?quantity=${quantity}`
                              : ''
                          }`
                        );
                      }}
                      className="flex-1 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--primary-foreground)] font-medium py-2 rounded-lg transition-colors"
                    >
                      💬 Contactar vendedor
                    </button>
                  </div>
                ) : (
                  <button onClick={() => router.push('/login')}
                    className="w-full bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--primary-foreground)] font-medium py-2 rounded-lg transition-colors">
                    Inicia sesión para comprar
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="mt-5 sm:mt-6 bg-[var(--surface)] rounded-xl border border-[var(--border)] p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3">
            <div>
              <h2 className="text-base font-bold text-[var(--foreground)]">
                Historial de precio
              </h2>

              <div className="flex items-center gap-3 mt-2">
                <p className="text-xl sm:text-2xl font-bold text-[var(--foreground)]">
                  ${latestPrice.toLocaleString('es-CL')}
                </p>

                <span className="text-xs rounded-full bg-[var(--success-bg)] text-[var(--success-fg)] px-2 py-0.5 font-medium">
                  Referencial
                </span>
              </div>
            </div>

            <div className="flex w-full sm:w-auto rounded-lg border border-[var(--border)] overflow-hidden bg-[var(--surface-2)]">
              {[
                { value: '7d', label: '7D' },
                { value: '1m', label: '1M' },
                { value: '6m', label: '6M' },
                { value: '1y', label: '1A' },
              ].map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setHistoryRange(item.value as SalesHistoryRange)}
                  className={`flex-1 sm:flex-none px-3 py-1.5 text-xs transition-colors ${
                    historyRange === item.value
                      ? 'bg-[var(--surface)] text-[var(--foreground)] font-semibold'
                      : 'text-[var(--muted)] hover:text-[var(--foreground)]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <p className="text-xs text-[var(--muted)] mb-3">
            Basado en ventas completadas similares dentro de PokeMarket.
          </p>

          {salesHistory.length === 0 ? (
            <div className="h-56 flex items-center justify-center rounded-lg bg-[var(--surface-2)] text-sm text-[var(--muted-2)]">
              Aún no hay ventas similares en este rango.
            </div>
          ) : (
            <div className="relative rounded-lg bg-[var(--surface-2)] border border-[var(--border)] p-2 sm:p-3">
              <div className="absolute left-3 top-3 bottom-8 flex flex-col justify-between text-[10px] text-[var(--muted-2)]">
                <span>${chartMaxPrice.toLocaleString('es-CL')}</span>
                <span>${Math.round((chartMaxPrice + chartMinPrice) / 2).toLocaleString('es-CL')}</span>
                <span>${chartMinPrice.toLocaleString('es-CL')}</span>
              </div>

              <div className="ml-12 sm:ml-14 h-44 sm:h-56 relative">
                <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
                  <defs>
                    <linearGradient id="priceAreaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="currentColor" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="currentColor" stopOpacity="0.02" />
                    </linearGradient>
                  </defs>

                  {[20, 54, 88].map((y) => (
                    <line
                      key={y}
                      x1="8"
                      y1={y}
                      x2="92"
                      y2={y}
                      stroke="currentColor"
                      strokeWidth="0.3"
                      className="text-[var(--border)]"
                    />
                  ))}

                  {areaPoints && (
                    <polygon
                      points={areaPoints}
                      fill="url(#priceAreaGradient)"
                      className="text-[var(--primary)]"
                    />
                  )}

                  <polyline
                    points={chartPoints}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-[var(--primary)]"
                  />

                  {salesHistory.map((item, index) => {
                    const x = salesHistory.length === 1 ? 50 : getPointX(index);
                    const y = getPointY(item.priceCLP);
                    const active = hoveredPoint === index;

                    return (
                      <g key={item.id}>
                        {active && (
                          <line
                            x1={x}
                            y1="18"
                            x2={x}
                            y2="88"
                            stroke="currentColor"
                            strokeWidth="0.4"
                            strokeDasharray="2 2"
                            className="text-[var(--muted-2)]"
                          />
                        )}

                        <g
                          onMouseEnter={() => setHoveredPoint(index)}
                          onMouseLeave={() => setHoveredPoint(null)}
                          onClick={() => setHoveredPoint(active ? null : index)}
                          onTouchStart={(e) => {
                            e.preventDefault();
                            setHoveredPoint(active ? null : index);
                          }}
                          className="cursor-pointer"
                        >
                          <circle
                            cx={x}
                            cy={y}
                            r="7"
                            fill="transparent"
                          />

                          <circle
                            cx={x}
                            cy={y}
                            r={active ? 3.5 : 2.4}
                            fill="currentColor"
                            className="text-[var(--primary)]"
                          />
                        </g>
                      </g>
                    );
                  })}
                </svg>

                {hoveredSale && (
                  <div className="absolute right-1 sm:right-3 top-6 sm:top-8 w-40 sm:w-44 rounded-xl bg-[var(--surface)] border border-[var(--border)] shadow-lg p-2.5 sm:p-3 text-xs z-10">
                    <p className="font-semibold text-[var(--foreground)] mb-2">
                      {formatFullDate(hoveredSale.completedAt)}
                    </p>

                    <div className="space-y-1">
                      <p className="flex justify-between gap-2 text-[var(--muted)]">
                        <span>Precio actual</span>
                        <span className="font-semibold text-[var(--foreground)]">
                          ${hoveredSale.priceCLP.toLocaleString('es-CL')}
                        </span>
                      </p>

                      <p className="flex justify-between gap-2 text-[var(--muted)]">
                        <span>Más bajo</span>
                        <span className="font-semibold text-[var(--success-fg)]">
                          ${minPrice.toLocaleString('es-CL')}
                        </span>
                      </p>

                      <p className="flex justify-between gap-2 text-[var(--muted)]">
                        <span>Más alto</span>
                        <span className="font-semibold text-[var(--danger-fg)]">
                          ${maxPrice.toLocaleString('es-CL')}
                        </span>
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="ml-12 sm:ml-14 mt-1 flex justify-between text-[10px] text-[var(--muted-2)]">
                <span>{formatShortDate(salesHistory[0]?.completedAt)}</span>
                <span>{formatShortDate(salesHistory[Math.floor(salesHistory.length / 2)]?.completedAt)}</span>
                <span>{formatShortDate(salesHistory[salesHistory.length - 1]?.completedAt)}</span>
              </div>
            </div>
          )}

          {salesHistory.length > 0 && (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {salesHistory.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-[var(--foreground)] truncate">
                      {item.cardName}
                    </p>
                    <p className="text-[11px] text-[var(--muted)]">
                      {formatFullDate(item.completedAt)}
                    </p>
                  </div>

                  <p className="text-sm font-bold text-[var(--primary)]">
                    ${item.priceCLP.toLocaleString('es-CL')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {lightboxOpen && (
          <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
            onClick={() => setLightboxOpen(false)}>
            <button type="button" onClick={(e) => { e.stopPropagation(); setLightboxOpen(false); }}
              className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/15 text-white text-xl flex items-center justify-center hover:bg-white/25"
              aria-label="Cerrar">×</button>

            <img
              src={listing.images[activeImg]}
              alt={listing.title}
              onClick={(e) => e.stopPropagation()}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              className="max-h-[90vh] max-w-[92vw] object-contain select-none"
            />

            {listing.images.length > 1 && (
              <>
                <button type="button" onClick={(e) => { e.stopPropagation(); prevImg(); }}
                  className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full bg-white/15 text-white text-2xl flex items-center justify-center hover:bg-white/25"
                  aria-label="Imagen anterior">‹</button>
                <button type="button" onClick={(e) => { e.stopPropagation(); nextImg(); }}
                  className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full bg-white/15 text-white text-2xl flex items-center justify-center hover:bg-white/25"
                  aria-label="Imagen siguiente">›</button>
                <span className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-white/15 text-white text-sm px-3 py-1 rounded-full">
                  {activeImg + 1} / {listing.images.length}
                </span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}